import * as path from 'path';
import { Stack, StackProps, CfnOutput, CustomResource, Duration, RemovalPolicy } from 'aws-cdk-lib';
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
import { SharedResourcesStack } from '../../stacks/stack-shared-resources/stack-shared-resources';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { HttpUserPoolAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { HttpUrlIntegration, HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha'
import { CognitoAuth } from "../construct-cognito-auth/construct-cognito-auth";
import * as turbineModel from "../../../resources/energy-assets/wind-turbines/asset-models/turbine-model"

export interface IotControlPanelProps extends StackProps {
  cognito: CognitoAuth;
}


export class IotControlPanel extends Construct {
  /**
   * Name of the archive containing the configured Raspberry pi image builder
   */
  private readonly controlPanelEndpoints: any;
  public readonly apiUrl: string;
  
  constructor(scope: Construct, id: string, props: IotControlPanelProps) {
    super(scope, id);


    // Lambda that configures the rpi-image-builder and stores it in the pipeline source bucket
    const simulateTurbinesAnomalyFunction = new lambda.Function(this, 'simulateTurbinesAnomalyFunction', {
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: 'app.on_event',
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/simulate_turbines_anomaly')),
      timeout: Duration.seconds(60),
      environment: {
        "MQTT_COMMAND_TOPIC": turbineModel.commandMqttPath
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'iot:Publish'
          ],
          resources: ['*'],
        }),
      ],
    });

    const simulateTurbinesNormalFunction = new lambda.Function(this, 'simulateTurbinesNormalFunction', {
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: 'app.on_event',
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/simulate_turbines_normal')),
      timeout: Duration.seconds(60),
      environment: {
        "MQTT_COMMAND_TOPIC": turbineModel.commandControlPanelMqttPath
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'iot:Publish'
          ],
          resources: ['*'],
        }),
      ],
    });

    const stopTurbinesFunction = new lambda.Function(this, 'stopTurbinesFunction', {
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: 'app.on_event',
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/stop_turbines')),
      timeout: Duration.seconds(60),
      environment: {
        "MQTT_COMMAND_TOPIC": turbineModel.commandControlPanelMqttPath
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'iot:Publish'
          ],
          resources: ['*'],
        }),
      ],
    });

    const sendMqttFunction = new lambda.Function(this, 'sendMqttFunction', {
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: 'app.on_event',
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/send_mqtt')),
      timeout: Duration.seconds(60),
      environment: {
        "MQTT_COMMAND_TOPIC": turbineModel.commandControlPanelMqttPath
      },
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'iot:Publish'
          ],
          resources: ['*'],
        }),
      ],
    });

    const pubSubApi = new apigwv2.HttpApi(this, 'PubSubApi', {
      corsPreflight: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: [
          apigwv2.CorsHttpMethod.OPTIONS,
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.PATCH,
          apigwv2.CorsHttpMethod.DELETE,
        ],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000'],
      },
    });

    pubSubApi.applyRemovalPolicy(RemovalPolicy.DESTROY)

    const authorizer = new HttpUserPoolAuthorizer('IoTControlPanelApiAuthorizer', props.cognito.userPool,
    {
      userPoolClients: [props.cognito.userPoolClient],
      identitySource: ['$request.header.Authorization'],
    },
    );

    const simulateTurbinesAnomalyEndpoint = pubSubApi.addRoutes({
      methods: [ apigwv2.HttpMethod.POST ],
      integration: new HttpLambdaIntegration(
        'simulateTurbinesAnomalyEndpoint',
        simulateTurbinesAnomalyFunction,
      ),
      path: '/simulate-anomaly',
      authorizer,
    });

    const simulateTurbinesNormalEndpoint = pubSubApi.addRoutes({
      methods: [ apigwv2.HttpMethod.POST ],
      integration: new HttpLambdaIntegration(
        'simulateTurbinesNormalEndpoint',
        simulateTurbinesNormalFunction,
      ),
      path: '/simulate-normal',
      authorizer,
    });

    const stopTurbinesEndpoint = pubSubApi.addRoutes({
      methods: [ apigwv2.HttpMethod.POST ],
      integration: new HttpLambdaIntegration(
        'stopTurbinesEndpoint',
        stopTurbinesFunction,
      ),
      path: '/stop',
      authorizer,
    });

    const sendMqttEndpoint = pubSubApi.addRoutes({
      methods: [ apigwv2.HttpMethod.POST ],
      integration: new HttpLambdaIntegration(
        'sendMqttEndpoint',
        sendMqttFunction,
      ),
      path: '/mqtt',
      authorizer,
    });

    this.apiUrl = pubSubApi.apiEndpoint 
  }
}

