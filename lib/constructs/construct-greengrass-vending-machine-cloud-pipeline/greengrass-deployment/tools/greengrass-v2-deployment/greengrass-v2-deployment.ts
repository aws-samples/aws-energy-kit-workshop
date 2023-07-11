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
    Stack,
    Tags,
    aws_iam as iam,
    aws_logs as logs,
} from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Provider } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";

/**
 * @summary A component definition
 */
export interface Component {
    [componentName: string]: {
        componentVersion: string;
        configurationUpdate?: {
            merge?: string;
            reset?: string;
        };
    };
}

/**
 * @summary The properties for the GreengrassCreateDeployment class.
 */
export interface GreengrassV2DeploymentProps {
    /**
     * Target Arn (thing or thingGroup) for deployment
     *
     * @default - None
     */
    readonly targetArn: string;

    /**
     * Name to describe the deployment.
     *
     * @default - None
     */
    readonly deploymentName: string;

    /**
     * List of components to deploy along with optional merge and reset values
     *
     * @default - None
     */
    readonly component: Component;
    /**
     * Optional IoT job configuration
     *
     * @default - None
     */
    readonly iotJobConfiguration?: object;

    /**
     * Optional deployment polices for failure handling, component update, and
     * validity of the policy
     *
     * @default - None
     */
    readonly deploymentPolicies?: object;

    /**
     * Optional tags to add to deployment
     *
     * @default - None
     */
    readonly tags?: Tags
}

/**
 * This construct creates a Greengrass v2 deployment targeted to an individual thing
 * or thingGroup.
 *
 * @summary Creates an AWS IoT role alias and referenced IAM role with provided IAM policy.
 */

/**
 * @summary The IotRoleAlias class.
 */
export class GreengrassV2Deployment extends Construct {
    public readonly deploymentId: string;
    public readonly iotJobId: string;
    public readonly iotJobArn: string;

    private customResourceName = "GreengrassV2DeploymentFunction";
    private componentList: Component = {};

    /**
     *
     * @summary Constructs a new instance of the IotRoleAlias class.
     * @param {cdk.App} scope - represents the scope for all the resources.
     * @param {string} id - this is a scope-unique id.
     * @param {GreengrassV2DeploymentProps} props - user provided props for the construct.
     * @since AWS CDK v2.12.0
     */
    constructor(scope: Construct, id: string, props: GreengrassV2DeploymentProps) {
        super(scope, id);

        const stackName = Stack.of(this).stackName;
        this.componentList = props.component;

        // Validate and derive final values for resources
        const provider = GreengrassV2Deployment.getOrCreateProvider(this, this.customResourceName);
        const customResource = new CustomResource(this, this.customResourceName, {
            serviceToken: provider.serviceToken,
            properties: {
                StackName: stackName,
                TargetArn: props.targetArn,
                DeploymentName: props.deploymentName,
                // object of objects { "compA": {..}, "compB": {...} }
                Components: this.componentList,
                IotJobExecution: props.iotJobConfiguration || {},
                DeploymentPolicies: props.deploymentPolicies || {},
                Tags: props.tags || {}
            }
        });

        // Custom resource Lambda role permissions
        // Permissions for Creating or cancelling deployment - requires expanded permissions to interact with
        // things and jobs
        provider.onEventHandler.role?.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: [
                    "greengrass:CancelDeployment",
                    "greengrass:CreateDeployment",
                    "iot:CancelJob",
                    "iot:CreateJob",
                    "iot:DeleteThingShadow",
                    "iot:DescribeJob",
                    "iot:DescribeThing",
                    "iot:DescribeThingGroup",
                    "iot:GetThingShadow",
                    "iot:UpdateJob",
                    "iot:UpdateThingShadow"
                ],
                resources: ["*"]
            })
        );

        // class public values
        // this.iamRoleArn = iamRole.roleArn
        this.deploymentId = customResource.getAttString("DeploymentId");
        this.iotJobId = customResource.getAttString("IotJobId");
        this.iotJobArn = customResource.getAttString("IotJobArn");

    }

    public addComponent = (component: Component) => {
        Object.keys(component).forEach((key) => {
            if (key in this.componentList) {
                console.error("Duplicate components not allowed. Component ", key, " already part of deployment.");
                process.exitCode = 1;
            } else {
                this.componentList[key] = component[key];
            }
        })
    }

    // Separate static function to create or return singleton provider
    static getOrCreateProvider = (scope: Construct, resourceName: string): Provider => {
        const stack = Stack.of(scope);
        const uniqueId = resourceName;
        const existing = stack.node.tryFindChild(uniqueId) as Provider;

        if (existing === undefined) {
            const createThingFn = new NodejsFunction(stack, `${uniqueId}-Provider`,{
                entry: path.join(__dirname, "assets/greengrass-v2-deployment-fn.ts"),
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
