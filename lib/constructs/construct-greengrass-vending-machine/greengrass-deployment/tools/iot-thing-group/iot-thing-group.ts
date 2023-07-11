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

import * as path from "path";
import {
    CustomResource,
    Duration,
    Fn,
    Stack,
    aws_iam as iam,
    aws_logs as logs,
} from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Provider } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";

/**
 * @summary The properties for the IotThingGroup class.
 */
export interface IotThingGroupProps {
    /**
     * AWS IoT thing group name.
     *
     * @default - None
     */
    readonly thingGroupName: string;

    /**
     * Optional name of the parent thing group.
     *
     * @default - None
     */
    readonly parentGroupName?: string;

    /**
     * Optional description of the thing group.
     *
     * @default - None
     */
    readonly thingGroupDescription?: string;
}

/**
 * This construct creates an AWS IoT thing group and provides methods to add or remove things from the group.
 *
 * @summary Create an AWS IoT thing group.
 */

/**
 * @summary The IotThingGroup class.
 */
export class IotThingGroup extends Construct {
    public readonly thingGroupName: string;
    public readonly thingGroupArn: string;
    public readonly thingGroupId: string;

    private thingArnList: Array<string> = [];
    private customResourceName = "IotThingGroupFunction";

    /**
   *
   * @summary Constructs a new instance of the IotRoleAlias class.
   * @param {cdk.App} scope - represents the scope for all the resources.
   * @param {string} id - this is a scope-unique id.
   * @param {IotThingGroupProps} props - user provided props for the construct.
   * @since AWS CDK v2.12.0
   */

    constructor(scope: Construct, id: string, props: IotThingGroupProps) {
        super(scope, id);
        
        const stackName = Stack.of(this).stackName;

        // Validate and derive final values for resources
        const thingGroupDescription = props.thingGroupDescription || "CloudFormation generated group";

        const provider = IotThingGroup.getOrCreateProvider(this, this.customResourceName);
        const customResource = new CustomResource(this, this.customResourceName, {
            serviceToken: provider.serviceToken,
            properties: {
                // resources for lambda
                StackName: stackName,
                ThingGroupName: props.thingGroupName,
                ThingGroupDescription: thingGroupDescription,
                ThingArnList: this.thingArnList
            }
        });

        // Custom resource Lambda role permissions
        // Permissions for the resource specific calls
        provider.onEventHandler.role?.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: ["iot:CreateThingGroup", "iot:DeleteThingGroup"],
                resources: [
                    `arn:${Fn.ref("AWS::Partition")}:iot:${Fn.ref("AWS::Region")}:${Fn.ref("AWS::AccountId")}:thinggroup/${props.thingGroupName}`
                ]
            })
        );

        // Permissions needed for all resources
        provider.onEventHandler.role?.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: ["iot:AddThingToThingGroup"],
                resources: ["*"]
            })
        );

        // class public values
        this.thingGroupName = customResource.getAttString("ThingGroupName");
        this.thingGroupArn = customResource.getAttString("ThingGroupArn");
        this.thingGroupId = customResource.getAttString("ThingGroupId");

    }

    // methods
    public addThing(thingArn: string): void {
        this.thingArnList.push(thingArn);
    }

    // Separate static function to create or return singleton provider
    static getOrCreateProvider = (scope: Construct, resourceName: string): Provider => {
        const stack = Stack.of(scope);
        const uniqueId = resourceName;
        const existing = stack.node.tryFindChild(uniqueId) as Provider;

        if (existing === undefined) {
            const createThingFn = new NodejsFunction(stack, `${uniqueId}-Provider`, {
                entry: path.join(__dirname, "assets/thing-group-fn.ts"),
                timeout: Duration.minutes(15),
                logRetention: logs.RetentionDays.ONE_MONTH
            });
            // Role permissions are handled by the main constructor
        
            // Create the provider that invokes the Lambda function
            const createThingProvider = new Provider(stack, uniqueId, {
                onEventHandler: createThingFn,
                logRetention: logs.RetentionDays.ONE_DAY
            });
            return createThingProvider;

        } else {
            // Second or additional call, use existing provider
            return existing;
        }

    }

 }
