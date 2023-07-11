/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
    CustomResource,
    Duration,
    Fn,
    Stack,
    aws_iam as iam,
    aws_logs as logs
} from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Provider } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";

import * as path from "path";

/**
 * @summary The properties for the IotRoleAlias class.
 */
export interface IotRoleAliasProps {
    /**
     * AWS IoT role alias name.
     *
     * @default - None
     */
    readonly iotRoleAliasName: string;

    /**
     * Optional IAM Role name.
     *
     * @default - `iotRoleAliasName` value is used.
     */
    readonly iamRoleName?: string;

    /**
     * IAM policy document to apply (inline) to the IAM role.
     *
     * @default - None
     */
    readonly iamPolicy: iam.PolicyDocument;

    /**
     * Optional name of the default inline policy created on the IAM role.
     *
     * @default -"DefaultPolicyForRoleAlias"
     */
    readonly iamPolicyName?: string;
}

export class IotRoleAlias extends Construct {
    public readonly iamRoleArn: string;
    public readonly roleAliasName: string;
    public readonly roleAliasArn: string;

    private customResourceName = "IotRoleAliasFunction";

    /**
     *
     * @summary Constructs a new instance of the IotRoleAlias class.
     * @param {cdk.App} scope - represents the scope for all the resources.
     * @param {string} id - this is a scope-unique id.
     * @param {IotRoleAliasProps} props - user provided props for the construct.
     * @since AWS CDK v2.12.0
     */
    constructor(scope: Construct, id: string, props: IotRoleAliasProps) {
        super(scope, id);

        const stackName = Stack.of(this).stackName;

        // Validate and derive final values for resources
        const inlinePolicyName = props.iamPolicyName || "DefaultPolicyForIotRoleAlias";
        const iamRoleName = props.iamRoleName || props.iotRoleAliasName;

        // Create IAM role with permissions
        const iamRole = new iam.Role(this, "IamRole", {
            roleName: iamRoleName,
            assumedBy: new iam.ServicePrincipal("credentials.iot.amazonaws.com"),
            description: "Allow Greengrass token exchange service to obtain temporary credentials",
            inlinePolicies: {
                [inlinePolicyName]: props.iamPolicy,
            },
        });

        const provider = IotRoleAlias.getOrCreateProvider(this, this.customResourceName);
        const customResource = new CustomResource(this, this.customResourceName, {
                serviceToken: provider.serviceToken,
                properties: {
                    StackName: stackName,
                    IotRoleAliasName: props.iotRoleAliasName,
                    IamRoleArn: iamRole.roleArn,
                }
            }
        );

        // Custom resource Lambda role permissions
        // Permissions for the IAM role created/deleted
        provider.onEventHandler.role?.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: [
                    "iam:CreateRole",
                    "iam:DeleteRole",
                    "iam:DeleteRolePolicy",
                    "iam:DetachRolePolicy",
                    "iam:ListAttachedRolePolicies",
                    "iam:ListRolePolicies",
                    "iam:PassRole", // Needed to associate IAM role with alias role
                    "iam:PutRolePolicy",
                ],
                resources: [
                    `arn:${Fn.ref("AWS::Partition")}:iam::${Fn.ref("AWS::AccountId")}:role/${props.iamRoleName}`
                ]
            })
        );

        // Permissions for the IoT role alias created/deleted
        provider.onEventHandler.role?.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: ["iot:CreateRoleAlias", "iot:DeleteRoleAlias"],
                resources: [
                    `arn:${Fn.ref("AWS::Partition")}:iot:${Fn.ref("AWS::Region")}:${Fn.ref("AWS::AccountId")}:rolealias/${props.iotRoleAliasName}`,
                ]
            })
        );

        // class public values
        this.iamRoleArn = iamRole.roleArn;
        this.roleAliasName = props.iotRoleAliasName;
        this.roleAliasArn = customResource.getAttString("RoleAliasArn");
    }

    static getOrCreateProvider = (scope: Construct, resourceName: string): Provider => {
        const stack = Stack.of(scope);
        const uniqueId = resourceName;
        const existing = stack.node.tryFindChild(uniqueId) as Provider;

        if (existing === undefined) {
            const createThingFn = new NodejsFunction(stack, `${uniqueId}-Provider`, {
                entry: path.join(__dirname, "assets/role-alias-fn.ts"),
                timeout: Duration.minutes(15),
                logRetention: logs.RetentionDays.ONE_MONTH,
            });
            // Role permissions are handled by the main constructor

            // Create the provider that invokes the Lambda function
            const createThingProvider = new Provider(stack, uniqueId, {
                onEventHandler: createThingFn,
                logRetention: logs.RetentionDays.ONE_DAY,
            });
            return createThingProvider;
        } else {
            // Second or additional call, use existing provider
            return existing;
        }
    };
}
