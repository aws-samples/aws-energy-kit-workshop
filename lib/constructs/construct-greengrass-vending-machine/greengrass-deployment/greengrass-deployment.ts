import * as path from "path";
import * as _ from "lodash";
import {
    Stack,
    StackProps,
    CfnOutput,
    aws_ec2 as ec2,
    aws_iam as iam,
    aws_iotsitewise as sitewise,
    aws_s3_assets as s3_assets,
    aws_s3_deployment as s3_deployment
} from "aws-cdk-lib";
import { AwsCustomResource, PhysicalResourceId, PhysicalResourceIdReference, AwsCustomResourcePolicy } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import { IotRoleAlias } from "./tools/iot-role-alias/iot-role-alias";
import { IotThingCertPolicy } from "./tools/iot-thing-cert-policy/iot-thing-cert-policy";
import { IotThingGroup } from "./tools/iot-thing-group/iot-thing-group";
import { GreengrassV2Deployment } from "./tools/greengrass-v2-deployment/greengrass-v2-deployment";
import { greengrassCoreMinimalIoTPolicy } from "./tools/stackConstants";
import * as iot from 'aws-cdk-lib/aws-iot';
import { telemetryMqttPath, commandMqttPath} from '../../../../resources/energy-assets/wind-turbines/asset-models/turbine-model'
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Condition } from "aws-cdk-lib/aws-stepfunctions";

export interface GreengrassDeploymentProps extends StackProps {
    thingType: string
}

export class GreengrassDeployment extends Construct {
    public readonly greengrassRegion: string;
    public readonly greengrassThingName: string;
    public readonly greengrassThingGroupName: string;
    public readonly greengrassRoleName: string;
    public readonly greengrassRoleAliasName: string;
    public readonly iotDataEndpoint: string;
    public readonly iotCredEndpoint: string;
    public readonly greengrassPrivateKeyParameter: string;
    public readonly greengrassCertificatePemParameter: string;
    public readonly greengrassTokenExchangeRoleAlias: string;
    public readonly greengrassRoleMinimalPolicy: string | undefined;
    public readonly greengrassGroupArn: string;

    constructor(scope: Construct, id: string, props: GreengrassDeploymentProps) {
        super(scope, id);

        const stack = Stack.of(this);

        this.greengrassRegion = stack.region;

        /**
         * Greengrass V2 resources
         */

        // Create IoT role policy for use by Greengrass IoT role alias
        const greengrass_role_minimal_policy_document = new iam.PolicyDocument({
            statements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        "ecr:GetDownloadUrlForLayer",
                        "ecr:BatchGetImage",
                        "ecr:GetAuthorizationToken",
                        "iot:DescribeCertificate",
                        "logs:CreateLogGroup",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents",
                        "logs:DescribeLogStreams",
                        "iot:Connect",
                        "iot:Publish",
                        "iot:Subscribe",
                        "iot:Receive",
                        "iot:DescribeEndpoint",
                        "iot:GetThingShadow",
                        "iot:UpdateThingShadow",
                        "iotsitewise:BatchPutAssetPropertyValue",
                        "iotsitewise:List*",
                        "iotsitewise:Describe*",
                        "iotsitewise:Get*",
                        "s3:GetBucketLocation",
                        "greengrass:ResolveComponentCandidates",
                        "greengrass:*"
                    ],
                    resources: ["*"]
                })
            ]
        });

        const greengrass_role_minimal_policy = new iot.CfnPolicy(this, 'greengrassPolicy', {
            policyDocument: greengrass_role_minimal_policy_document
          });
        
        const greengrass_role = new iam.Role(this, 'GreengrassRole', {
            assumedBy: new iam.ServicePrincipal('credentials.iot.amazonaws.com'),
            managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')],
          });
      
          const policy = new iam.ManagedPolicy(this, 'GreenGrassPolicy', {
            managedPolicyName: greengrass_role.roleName + 'Access',
            roles: [greengrass_role],
            statements: [
              new iam.PolicyStatement({
                actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents', 'logs:DescribeLogStreams'],
                resources: ['*'],
              }),
            ],
          });
        
        this.greengrassRoleName = greengrass_role.roleName
        

        // Then create IoT role alias
        const greengrass_role_alias = new IotRoleAlias(this, "GreengrassRoleAlias", {
            iotRoleAliasName: `${stack.stackName}GreengrassRoleAlias`,
            iamRoleName: `${stack.stackName}GreengrassRole`,
            iamPolicy: greengrass_role_minimal_policy_document
        });

        // Then create IoT thing, certificate/private key, and IoT Policy
        const iot_thing_cert_policy = new IotThingCertPolicy(this, "GreengrassCore", {
            thingName: `energykit-ggcd-${props.thingType}`,
            iotPolicyName: `${stack.stackName}-Greengrass-Minimal-Policy`,
            iotPolicy: greengrassCoreMinimalIoTPolicy,
            policyParameterMapping: {
            region: stack.region,
            account: stack.account,
            rolealiasname: greengrass_role_alias.roleAliasName
            }
        });

        // Then create thing group and add thing
        const deployment_group = new IotThingGroup(this, "GreengrassDeploymentGroup", {
            thingGroupName: `${props.thingType}-greengrass-group`
        });


        this.greengrassGroupArn = deployment_group.thingGroupArn

        deployment_group.addThing(iot_thing_cert_policy.thingArn);
        
        this.greengrassTokenExchangeRoleAlias = greengrass_role_alias.roleAliasName
        this.greengrassThingName = iot_thing_cert_policy.thingName,
        this.greengrassThingGroupName = deployment_group.thingGroupName,
        this.greengrassRoleAliasName = greengrass_role_alias.roleAliasName,
        this.iotDataEndpoint = iot_thing_cert_policy.dataAtsEndpointAddress,
        this.iotCredEndpoint = iot_thing_cert_policy.credentialProviderEndpointAddress,
        this.greengrassPrivateKeyParameter = iot_thing_cert_policy.privateKeySecretParameter,
        this.greengrassCertificatePemParameter = iot_thing_cert_policy.certificatePemParameter,
        this.greengrassRoleMinimalPolicy = greengrass_role_minimal_policy.ref
  
        // Create the deployment with AWS public and stack components, target the thing group
        // and add the components/version/updates
        const greengrass_deployment = new GreengrassV2Deployment(this, "GreengrassDeployment", {
            targetArn: deployment_group.thingGroupArn,
            deploymentName: `energykit-deployment-${props.thingType}`,
            component: {
                // Add core public components
                "aws.greengrass.Nucleus": { componentVersion: "2.8.0" },
                "aws.greengrass.Cli": { componentVersion: "2.8.0" },
                "aws.greengrass.clientdevices.mqtt.Moquette": { componentVersion: "2.3.1" },
                //"aws.greengrass.clientdevices.mqtt.EMQX": { componentVersion: "1.1.0" },
                "aws.greengrass.clientdevices.IPDetector": { componentVersion: "2.1.5" }
                //"aws.greengrass.ShadowManager": { componentVersion: "2.2.2" }            
            }
        });

        /*
        greengrass_deployment.addComponent({
            "aws.greengrass.LocalDebugConsole": {
                componentVersion: "2.2.7",
                configurationUpdate: {
                    merge: JSON.stringify({ httpsEnabled: "false" })
                }
            }
        });
        */

        // Add Greengrass client device component to allow client devices to discover and authorize with Greengrass core device
        // Configure to allow client devices to publish and subscribe to all mqtt topics
        // For added security it is strongly recommended that you scope your allowed topics only to what is required
        greengrass_deployment.addComponent({
            "aws.greengrass.clientdevices.Auth": {
                componentVersion: "2.3.1",
                configurationUpdate: {
                    merge: JSON.stringify({
                            deviceGroups: {
                              formatVersion: "2021-03-05",
                                definitions: {
                                MyDeviceGroup: {
                                  selectionRule: "thingName: turbine*",
                                  policyName: "MyClientDevicePolicy"
                                }
                              },
                              policies: {
                                MyClientDevicePolicy: {
                                  AllowConnect: {
                                    statementDescription: "Allow client devices to connect.",
                                    operations: [
                                      "mqtt:connect"
                                    ],
                                    resources: [
                                      "*"
                                    ]
                                  },
                                  AllowPublish: {
                                    statementDescription: "Allow client devices to publish to all topics.",
                                    operations: [
                                      "mqtt:publish"
                                    ],
                                    resources: [
                                      "*"
                                    ]
                                  },
                                  AllowSubscribe: {
                                    statementDescription: "Allow client devices to subscribe to all topics.",
                                    operations: [
                                      "mqtt:subscribe"
                                    ],
                                    resources: [
                                      "*"
                                    ]
                                  }
                                }
                              }
                            }
                            })
                }
            }
        });

        // Add MQTT Bridge component for bridging local MQTT to AWS cloud
        // Configure to allow bridging on pub and sub messages from device configuration
        greengrass_deployment.addComponent({
            "aws.greengrass.clientdevices.mqtt.Bridge": {
                componentVersion: "2.2.4",
                configurationUpdate: {
                    merge: JSON.stringify({ 
                        mqttTopicMapping: {
                            ClientDeviceHelloWorld: {
                                topic: "clients/+/hello/world",
                                source: "LocalMqtt",
                                target: "IotCore"
                            },
                            ClientDeviceEvents: {
                                topic: "clients/+/detections",
                                targetTopicPrefix: "events/input/",
                                source: "LocalMqtt",
                                target: "Pubsub"
                            },
                            ClientDeviceCloudStatusUpdate: {
                                topic: "clients/+/status",
                                targetTopicPrefix: "$aws/rules/StatusUpdateRule/",
                                source: "LocalMqtt",
                                target: "IotCore"
                            },
                            EnergyKitTelemetry: {
                                topic: telemetryMqttPath,
                                source: "LocalMqtt",
                                target: "IotCore"
                            },
                            EnergyKitCommand: {
                                topic: "energykit/wind/command/#",
                                source: "IotCore",
                                target: "LocalMqtt"
                            },
                        }
                    })
                }
            }
        });


        // Set stack outputs to be consumed by local processes
        new CfnOutput(this, "IotRoleAliasName", {
            value: greengrass_role_alias.roleAliasName
        });
        new CfnOutput(this, "IotPolicyArn", {
            value: iot_thing_cert_policy.iotPolicyArn
        });
        new CfnOutput(this, "RoleAliasArn", {
            value: greengrass_role_alias.roleAliasArn
        });
        new CfnOutput(this, "IamRoleArn", {
            exportName: `${stack.stackName}-IamRoleArn`,
            value: greengrass_role_alias.iamRoleArn
        });
        new CfnOutput(this, "CertificateArn", {
            exportName: `${stack.stackName}-CertificateArn`,
            value: iot_thing_cert_policy.certificateArn
        });
        new CfnOutput(this, "CertificatePemParameter", {
            value: iot_thing_cert_policy.certificatePemParameter
        });
        new CfnOutput(this, "PrivateKeySecretParameter", {
            value: iot_thing_cert_policy.privateKeySecretParameter
        });
        new CfnOutput(this, "DataAtsEndpointAddress", {
            value: iot_thing_cert_policy.dataAtsEndpointAddress
        });
        new CfnOutput(this, "CredentialProviderEndpointAddress", {
            value: iot_thing_cert_policy.credentialProviderEndpointAddress
        });
    }
}
