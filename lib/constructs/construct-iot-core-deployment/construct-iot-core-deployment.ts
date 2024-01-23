import { RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import { custom_resources as customResource } from 'aws-cdk-lib'
import { TopicRule, IotSql  } from '@aws-cdk/aws-iot-alpha';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { S3PutObjectAction, DynamoDBv2PutItemAction } from '@aws-cdk/aws-iot-actions-alpha'
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { telemetryMqttPath, commandMqttPath, sitewiseAliasPrefix, sitewiseAssetAlias} from '../../../resources/energy-assets/wind-turbines/asset-models/turbine-model'
import { aws_iot as iot } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import { TimeStream } from '../construct-timestream/construct-timestream';
import { EkS3 } from '../construct-ek-s3-bucket/construct-ek-s3-bucket';

export interface IotCoreConstructProps {
  assetModel: string,
  timestreamTable: TimeStream,
  dataLake: EkS3
}

export class IotCoreConstruct extends Construct {
  public readonly iotEndpoint: string
  public readonly pubTopic: string
  public readonly subTopic: string

  constructor(scope: Construct, id: string, props: IotCoreConstructProps) {
    super(scope, id);

    // Get the IoT custom endpoint for use in all other iot applications
    const getIoTEndpoint = new customResource.AwsCustomResource(this, 'IoTEndpoint', {
      onCreate: {
        service: 'Iot',
        action: 'describeEndpoint',
        physicalResourceId: customResource.PhysicalResourceId.fromResponse('endpointAddress'),
        parameters: {
          "endpointType": "iot:Data-ATS"
        }
      },
      policy: customResource.AwsCustomResourcePolicy.fromSdkCalls({resources: customResource.AwsCustomResourcePolicy.ANY_RESOURCE})
    });

    this.iotEndpoint = getIoTEndpoint.getResponseField('endpointAddress')
    this.subTopic = telemetryMqttPath;
    this.pubTopic = commandMqttPath;

    // Iot Rules

    const iotS3RuleAction = new TopicRule(this, 'TopicRule', {
      sql: IotSql.fromStringAsVer20160323(
      `SELECT * FROM '${telemetryMqttPath}'`,
    ),
    actions: [
      new S3PutObjectAction(props.dataLake, {
        key: '${topic()}/${timestamp()}',
      }),
  ],
});
    // DynamoDB Table Rule
    const telemetryTable = new dynamodb.Table(this, "TelemetryTable", {
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
      sortKey: {name: 'createdAt', type: dynamodb.AttributeType.NUMBER},
      pointInTimeRecovery: true,
    });

    const iotDynamoDbRuleAction = new TopicRule(this, 'DynamoDbTopicRule', {
      sql: IotSql.fromStringAsVer20160323(
        `SELECT assetId AS id, temp, pressure, humidity, altitude, current, voltage, power, rpm, gearboxVibration FROM '${telemetryMqttPath}'`,
    ),
    
    actions: [
      new DynamoDBv2PutItemAction(telemetryTable)
    ],
});

    const sitewiseIotAccessRole = new iam.Role(this, 'timeStreamAccessRole', {
      assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
    });

    sitewiseIotAccessRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['iotsitewise:BatchPutAssetPropertyValue'],
        resources: ['*']
      }))

    const sitewiseTopicRule = new iot.CfnTopicRule(this, 'SitewiseTopicRule', {
        topicRulePayload: {
          sql: `SELECT assetId, temp, pressure, humidity, altitude, current, voltage, power, rpm, gearboxVibration FROM '${telemetryMqttPath}'`,
          actions: [{
            iotSiteWise: {
              putAssetPropertyValueEntries: [{
                propertyValues: [{
                  timestamp: {
                    timeInSeconds: "${floor(timestamp() / 1E3)}",
                  },
                  value: {
                    doubleValue: '${temp}',
                  },
                }],
                propertyAlias: "energykit/wind/telemetry/${assetId}/temp",
              },
              {
                propertyValues: [{
                  timestamp: {
                    timeInSeconds: "${floor(timestamp() / 1E3)}",
                  },
                  value: {
                    doubleValue: '${rpm}',
                  },
                }],
                propertyAlias: "energykit/wind/telemetry/${assetId}/rpm",
              },
              {
                propertyValues: [{
                  timestamp: {
                    timeInSeconds: "${floor(timestamp() / 1E3)}",
                  },
                  value: {
                    doubleValue: '${gearboxVibration}',
                  },
                }],
                propertyAlias: "energykit/wind/telemetry/${assetId}/vibration",
              }
              ],
              roleArn: sitewiseIotAccessRole.roleArn,
            },
          }],
        }
    })

    const timeStreamAccessRole = new iam.Role(this, 'topicIotTimeStreamRole', {
      assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonTimestreamFullAccess')],
    });

    const timestreamTopicRule = new iot.CfnTopicRule(this, 'TimestreamTopicRule', {
      topicRulePayload: {
        sql: `SELECT assetId AS id, temp, pressure, humidity, altitude, current, voltage, power, rpm, gearboxVibration FROM '${telemetryMqttPath}'`,
        actions: [
          {
            timestream: {
              databaseName: props.timestreamTable.table.databaseName!,
              tableName: props.timestreamTable.table.tableName!,
              dimensions: [
                {
                  name: 'TelemetryAssetType',
                  value: 'Telemetry',
                },
                {
                  name: 'TelemetryAssetId',
                  value: '${topic(1)}',
                },
              ],
              timestamp: {
                unit: 'MILLISECONDS',
                value: '${timestamp()}',
              },
              roleArn: timeStreamAccessRole.roleArn,
            },
          },
        ]
      }
    })   

  }
}