import * as path from 'path';
import { Stack, CfnOutput, CustomResource, Duration, Fn, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as s3Assets from 'aws-cdk-lib/aws-s3-assets';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as secrets from 'aws-cdk-lib/aws-secretsmanager';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import { GreengrassDeployment } from './greengrass-deployment/greengrass-deployment';
import { EkS3 } from '../construct-ek-s3-bucket/construct-ek-s3-bucket';

export interface GreengrassVendingMachineProps {
  greengrassVendingSnsTopic: string;
  /**
   * Name of the secret where the password used by the Raspberry Pi to connect to the Wifi is stored
   */
  wifiPasswordSecretName: string;
  /**
   * Country code for the Wifi network (e.g. 'US')
   */
  wifiCountry: string;
  /**
   * SSID of the Wifi network the Raspberry Pi will connect to
   */
  wifiSsid: string;

  imageType: string;
}

//TODO --> use this to update below https://docs.aws.amazon.com/greengrass/v2/developerguide/fleet-provisioning-setup.html

export class GreengrassVendingMachine extends Construct {

  private readonly rpiImageBuilderArchiveName: string = 'rpi-image-builder.zip';
  private readonly customImageArchiveName: string;
  public readonly greengrassGroupArn: string;
  /**
   * 
   * Create a CodePipeline that builds a custom raspbian image.
   * This custom raspbian image automatically provisions a RaspberryPi with AWS IoT on its first boot.
   * @param scope 
   * @param id 
   * @param props 
   */
  constructor(scope: Construct, id: string, props: GreengrassVendingMachineProps) {
    super(scope, id);

    const greengrassDeployment = new GreengrassDeployment(this, "GreengrassDeployment",{
      thingType: "telemetry"
    })

    // Give the AWS IoT service permission to create or update IoT resources such as things and certificates in your account when provisioning devices
    const ggcdProvisioningRole = new iam.Role(this, 'GGCDProvisioningRoleArn', {
      assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
    });
    ggcdProvisioningRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSIoTThingsRegistration'));

    // The bucket where the configured rpi-image-builder used as a source of the pipeline is stored
    const rpiImageBuilderSourceBucket = new EkS3(this, 'rpiImageBuilderSourceBucket', {
      versioned: true, // CodePipeline requires a versioned source for source stages
    });

    // TODO -- update with name
    // The bucket where the custom raspbian image created by the pipeline is stored
    const rpiImageOutputBucket = new EkS3(this, 'RpiImageOutputBucket', {
      versioned: true,
    });

    // Lambda that configures the rpi-image-builder and stores it in the pipeline source bucket
    const configureRpiImageBuilderFunction = new lambda.Function(this, 'ConfigureRpiImageBuilderFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'app.on_event',
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/configure_rpi_image_builder')),
      timeout: Duration.seconds(60),
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'iot:CreateKeysAndCertificate',
            'iot:AttachPolicy',
            'iot:DescribeEndpoint',
          ],
          resources: ['*'],
        }),
      ],
    });

    // Lambda that configures the rpi-image-builder and stores it in the pipeline source bucket
    const preProvisionHooksFunction = new lambda.Function(this, 'PreProvisionHooksFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'app.on_event',
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/pre_provision_hooks')),
      timeout: Duration.seconds(60),
      environment: {
        "SNS_TOPIC": props.greengrassVendingSnsTopic
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'sns:Publish',
          ],
          resources: ['*'],
        }),
      ],
    });

    const iotPrincipal = new iam.ServicePrincipal('iot.amazonaws.com');

    preProvisionHooksFunction.grantInvoke(iotPrincipal);

    const preProvisionPolicy = new iam.PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: [preProvisionHooksFunction.functionArn],
    });

    /**
          * Add lambda invoke for pre-provision policy to the iot service principal.
          * This allows iot service to invoke the lambda function.
          * TODO - verify that this solves the preprovision hooks issue
         */
    iotPrincipal.addToPrincipalPolicy(preProvisionPolicy)

    const snsTopicPolicy = new iam.PolicyStatement({
      actions: ['sns:publish'],
      resources: ['*'],
    });

    preProvisionHooksFunction.addToRolePolicy(snsTopicPolicy);

    // The provisioning template used to create IoT things
    // https://docs.aws.amazon.com/iot/latest/developerguide/provision-template.html
    const ggcdProvisioningTemplate = new iot.CfnProvisioningTemplate(this, 'ggcdProvisioningTemplate', {
      provisioningRoleArn: ggcdProvisioningRole.roleArn,
      enabled: true,
      preProvisioningHook: {
        payloadVersion: '2020-04-01',
        targetArn: preProvisionHooksFunction.functionArn,
      },
      templateBody: `{
  "Parameters": {
    "ThingName": {
      "Type": "String"
    },
    "SerialNumber": {
      "Type": "String"
    },
    "ThingGroupName": {
      "Type": "String"
    },
    "AWS::IoT::Certificate::Id": {
      "Type": "String"
    }
  },
  "Resources": {
    "thing": {
      "OverrideSettings": {
        "AttributePayload": "REPLACE",
        "ThingGroups": "REPLACE",
        "ThingTypeName": "REPLACE"
      },
      "Properties": {
        "AttributePayload": {},
        "ThingGroups": [
          {
            "Ref": "ThingGroupName"
          }
        ],
        "ThingName": {
          "Ref": "ThingName"
        }
      },
      "Type": "AWS::IoT::Thing"
    },
    "policy": {
      "Properties": {
        "PolicyName": "${greengrassDeployment.greengrassRoleMinimalPolicy}"
      },
      "Type": "AWS::IoT::Policy"
    },
    "MyCertificate": {
      "Properties": {
        "CertificateId": {
          "Ref": "AWS::IoT::Certificate::Id"
        },
        "Status": "Active"
      },
      "Type": "AWS::IoT::Certificate"
    }
  }
}`
    });

    const ggcdFleetProvisioningPolicy = new iot.CfnPolicy(this, 'GGCDFleetProvisioningPolicy', {
      policyDocument: {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": ["iot:Connect"],
            "Resource": ["*"]
          },
          {
            "Effect": "Allow",
            "Action": ["iot:Publish", "iot:Receive"],
            "Resource": [
              `arn:aws:iot:${Stack.of(this).region}:${Stack.of(this).account}:topic/$aws/certificates/create/*`,
              `arn:aws:iot:${Stack.of(this).region}:${Stack.of(this).account}:topic/$aws/provisioning-templates/${ggcdProvisioningTemplate.ref}/provision/*`
            ]
          },
          {
            "Effect": "Allow",
            "Action": ["iot:Subscribe"],
            "Resource": [
              `arn:aws:iot:${Stack.of(this).region}:${Stack.of(this).account}:topicfilter/$aws/certificates/create/*`,
              `arn:aws:iot:${Stack.of(this).region}:${Stack.of(this).account}:topicfilter/$aws/provisioning-templates/${ggcdProvisioningTemplate.ref}/provision/*`
            ]
          }
        ]
      }
    });



    // Store the rpi-image-builder source code in S3
    const rpiImageBuilderAsset = new s3Assets.Asset(this, 'RpiImageBuilderAsset', {
      path: path.join(__dirname, `./rpi-image-builder-${props.imageType}`),
    });

    rpiImageBuilderSourceBucket.grantWrite(configureRpiImageBuilderFunction);
    rpiImageBuilderAsset.grantRead(configureRpiImageBuilderFunction);



    // Custom resource that calls the Lambda that will configure the rpi-image-builder client
    new CustomResource(this, 'ConfigureRpiImageBuilderCR', {
      serviceToken: new cr.Provider(this, 'ConfigureRpiImageBuilderProvider', {
        onEventHandler: configureRpiImageBuilderFunction,
      }).serviceToken,
      properties: {
        'RPI_IMAGE_BUILDER_BUCKET_NAME': rpiImageBuilderAsset.s3BucketName,
        'RPI_IMAGE_BUILDER_OBJECT_KEY': rpiImageBuilderAsset.s3ObjectKey,
        'CONFIGURED_RPI_IMAGE_BUILDER_BUCKET_NAME': rpiImageBuilderSourceBucket.bucketName,
        'CONFIGURED_RPI_IMAGE_BUILDER_OBJECT_KEY': this.rpiImageBuilderArchiveName,
        'GREENGRASS_GROUP_NAME': greengrassDeployment.greengrassThingGroupName,
        'GREENGRASS_THING_NAME': greengrassDeployment.greengrassThingName,
        'GREENGRASS_REGION': greengrassDeployment.greengrassRegion,
        'GREENGRASS_ROLE_ALIAS_NAME': greengrassDeployment.greengrassRoleAliasName,
        'IOT_DATA_ENDPOINT': greengrassDeployment.iotDataEndpoint,
        'IOT_CRED_ENDPOINT': greengrassDeployment.iotCredEndpoint,
        'GREENGRASS_PRIVATE_KEY_PARAMETER': greengrassDeployment.greengrassPrivateKeyParameter,
        'GREENGRASS_CERTIFICATE_PEM_PARAMETER': greengrassDeployment.greengrassCertificatePemParameter,
        'FLEET_PROVISIONING_POLICY_NAME': ggcdFleetProvisioningPolicy.ref,
        'PROVISIONING_TEMPLATE_NAME': ggcdProvisioningTemplate.ref,
        'GREENGRASS_TOKEN_EXCHANGE_ROLE_ALIAS': greengrassDeployment.greengrassTokenExchangeRoleAlias
      }, 
        
    });

    // Codebuild project that generates the custom raspbian image
    const buildRpiImageProject = new codebuild.PipelineProject(this, 'BuildRpiImageProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_4_0,
        privileged: true,
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        env: {
          variables: {
            // Set environment variables expected by the build-rpi-image.bash script
            'WIFI_SSID': props.wifiSsid,
            'WIFI_COUNTRY': props.wifiCountry,
            'ARTIFACT_IMAGE_NAME': `energykit-${props.imageType}-raspios.img`,
          },
          'secrets-manager': {
            'WIFI_PASSWORD': `${props.wifiPasswordSecretName}`,
          },
        },
        phases: {
          install: {
            commands: [
              // Install dependencies required by the build-rpi-image.bash script
              'apt-get update',
              'apt-get -y install p7zip-full wget libxml2-utils kpartx',
              'wget -qO - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -',
              'echo \"### THIS FILE IS AUTOMATICALLY CONFIGURED ###\n# You may comment out this entry, but any other modifications may be lost.\ndeb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main\" | sudo tee -a /etc/apt/sources.list.d/google-linux.list',
              'sudo apt update'
            ],
          },
          build: {
            commands: [
              'bash build-rpi-image.bash'
            ],
          },
        },
        artifacts: {
          files: [
            '$ARTIFACT_IMAGE_NAME',
          ],
        },
      }),
    });

    // Give access to the secret containing the wifi password to the codebuild project
    if (buildRpiImageProject.role) {
      const rpiSecret = secrets.Secret.fromSecretNameV2(this, 'RPIVendingSecrets', props.wifiPasswordSecretName);
      rpiSecret.grantRead(buildRpiImageProject.role);
    }

    const pipelineSourceArtifact = new codepipeline.Artifact();
    const buildOutputArtifact = new codepipeline.Artifact();

    new codepipeline.Pipeline(this, 'BuildRpiImagePipeline', {
      crossAccountKeys: false,
      restartExecutionOnUpdate: true,
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipelineActions.S3SourceAction({
              actionName: 'Source',
              bucket: rpiImageBuilderSourceBucket,
              bucketKey: this.rpiImageBuilderArchiveName,
              output: pipelineSourceArtifact,
            }),
          ],
        },
        {
          stageName: 'BuildRpiImage',
          actions: [
            new codepipelineActions.CodeBuildAction({
              actionName: 'BuildRpiImage',
              input: pipelineSourceArtifact,
              project: buildRpiImageProject,
              outputs: [buildOutputArtifact],
            }),
          ],
        },
        {
          stageName: 'StoreRpiImage',
          actions: [
            new codepipelineActions.S3DeployAction({
              actionName: 'StoreRpiImage',
              input: buildOutputArtifact,
              bucket: rpiImageOutputBucket,
              extract: false,
              objectKey: `energykit-${props.imageType}-raspios.img`,
            }),
          ],
        },
      ],
    });

    this.greengrassGroupArn = greengrassDeployment.greengrassGroupArn;

    new CfnOutput(this, 'RpiImageBucketName', {
      description: `Download the os image for ${Stack.of(this).stackName} from this S3 bucket`,
      value: rpiImageOutputBucket.bucketWebsiteUrl,
      exportName: `${props.imageType}-s3-bucket`
    });

  }
}

