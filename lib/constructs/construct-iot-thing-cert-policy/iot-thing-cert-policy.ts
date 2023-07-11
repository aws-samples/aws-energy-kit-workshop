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
import * as _ from "lodash";
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

export interface Mapping {
    [keys: string]: string;
}

/**
 * @summary The properties for the IotThingCertPolicy class.
 */
 export interface IotThingCertPolicyProps { 
     /**
     * Name of AWS IoT thing to create.
     *
     * @default - None
     */
    thingName: string;

    /**
     * Name of the AWS IoT Core policy to create.
     *
     * @default - None
     */
     iotPolicyName: string;

     /**
     * The AWS IoT policy to be created and attached to the certificate.
     * JSON string converted to IoT policy, lodash format for replacement.
     *
     * @default - None
     */
    iotPolicy: string;

    /**
     * An object of parameters and values to be replaced if a Jinja template is
     * provided. For each matching parameter in the policy template, the value
     * will be used. If not provided, only the `<% thingname %>` mapping will be available for the `iotPolicy` template.
     *
     * @default - None
     */
     policyParameterMapping?: Mapping;
 }

 /**
 * This construct creates an AWS IoT thing, IoT certificate, and IoT policy.
 * It attaches the certificate to the thing and policy, and stores the
 * certificate private key into an AWS Systems Manager Parameter Store
 * string for reference outside of the CloudFormation stack.
 *
 * Use this construct to create and delete a thing, principal, and policy for
 * testing or other singular uses.
 *
 * @summary Creates and associates an AWS IoT thing, certificate and policy.
 *
 */

/**
 * @summary The IotThingCertPolicy class.
 */
 export class IotThingCertPolicy extends Construct { 
     public readonly thingArn: string;
     public readonly thingName: string;
    public readonly iotPolicyArn: string;
    public readonly certificateArn: string;
    public readonly certificatePemParameter: string;
    public readonly privateKeySecretParameter: string;
    public readonly dataAtsEndpointAddress: string;
    public readonly credentialProviderEndpointAddress: string;
    private customResourceName = "IotThingCertPolicyFunction";

    /**
     * @summary Constructs a new instance of the IotThingCertPolicy class.
     * @param {cdk.App} scope - represents the scope for all the resources.
     * @param {string} id - this is a scope-unique id.
     * @param {IotThingCertPolicyProps} props - user provided props for the construct.
     * @since AWS CDK v2.12.0
     */
    constructor(scope: Construct, id: string, props: IotThingCertPolicyProps) {
        super(scope, id);

        const stackName = Stack.of(this).stackName;
        
        // For the AWS Core policy, the template maps replacements from the
        // props.policyParameterMapping along with the following provided variables:
        // thingname  - used as: <% thingname %>
        const policyParameters = props.policyParameterMapping || {};
        policyParameters.thingname = props.thingName;

        // lodash that creates template then applies the mapping
        const policyTemplate = _.template(props.iotPolicy);
        const iotPolicy = policyTemplate(policyParameters);

        const provider = IotThingCertPolicy.getOrCreateProvider(this, this.customResourceName);
        const customResource  = new CustomResource(this, this.customResourceName, {
            serviceToken: provider.serviceToken,
            properties: {
                StackName: stackName,
                ThingName: props.thingName,
                IotPolicy: iotPolicy,
                IotPolicyName: props.iotPolicyName
            }
        });

        // Custom resource Lambda role permissions
        // Permissions to act on thing, certificate, and policy
        provider.onEventHandler.role?.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: ["iot:CreateThing", "iot:DeleteThing"],
                resources: [
                    `arn:${Fn.ref("AWS::Partition")}:iot:${Fn.ref("AWS::Region")}:${Fn.ref("AWS::AccountId")}:thing/${props.thingName}`
                ]
            })
        );

        // Create and delete specific policy
        provider.onEventHandler.role?.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: [
                    "iot:CreatePolicy",
                    "iot:DeletePolicy",
                    "iot:DeletePolicyVersion",
                    "iot:ListPolicyVersions",
                    "iot:ListTargetsForPolicy"
                ],
                resources: [
                    `arn:${Fn.ref("AWS::Partition")}:iot:${Fn.ref("AWS::Region")}:${Fn.ref("AWS::AccountId")}:policy/${props.iotPolicyName}`
                ]
            })
        );

        // Create SSM parameter
        provider.onEventHandler.role?.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: ["ssm:DeleteParameters", "ssm:PutParameter"],
                resources: [
                    `arn:${Fn.ref("AWS::Partition")}:ssm:${Fn.ref("AWS::Region")}:${Fn.ref("AWS::AccountId")}:parameter/${stackName}/${props.thingName}/private_key`,
                    `arn:${Fn.ref("AWS::Partition")}:ssm:${Fn.ref("AWS::Region")}:${Fn.ref("AWS::AccountId")}:parameter/${stackName}/${props.thingName}/certificate_pem`
                ],
            })
        );

        // Actions without resource types
        provider.onEventHandler.role?.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: [
                    "iot:AttachPolicy",
                    "iot:AttachThingPrincipal",
                    "iot:CreateKeysAndCertificate",
                    "iot:DeleteCertificate",
                    "iot:DescribeEndpoint",
                    "iot:DetachPolicy",
                    "iot:DetachThingPrincipal",
                    "iot:ListAttachedPolicies",
                    "iot:ListPrincipalThings",
                    "iot:ListThingPrincipals",
                    "iot:UpdateCertificate",
                ],
                resources: ["*"],
            })
        );

        // class public values
        this.certificatePemParameter = customResource.getAttString("CertificatePemParameter");
        this.privateKeySecretParameter = customResource.getAttString("PrivateKeySecretParameter");
        this.thingArn = customResource.getAttString("ThingArn");
        this.thingName = props.thingName;
        this.iotPolicyArn = customResource.getAttString("IotPolicyArn");
        this.certificateArn = customResource.getAttString("CertificateArn");
        this.dataAtsEndpointAddress = customResource.getAttString("DataAtsEndpointAddress");
        this.credentialProviderEndpointAddress = customResource.getAttString("CredentialProviderEndpointAddress");
    }

    // Separate static function to create or return singleton provider
    static getOrCreateProvider = (scope: Construct, resourceName: string): Provider => {
        const stack = Stack.of(scope);
        const uniqueId = resourceName;
        const existing = stack.node.tryFindChild(uniqueId) as Provider;

        if (existing === undefined) {
            const createThingFn = new NodejsFunction(stack, `${uniqueId}-Provider`,{
                entry: path.join(__dirname, "assets/thing-cert-policy-fn.ts"),
                timeout: Duration.minutes(15),
                logRetention: logs.RetentionDays.ONE_MONTH
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
    }
 }