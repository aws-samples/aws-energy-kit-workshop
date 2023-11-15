import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { IotVendingMachine } from '../../constructs/construct-iot-vending-machine/construct-iot-vending-machine'
import { CONFIG } from './constants/constants'
import { SitewiseAssets } from '../../constructs/construct-sitewise-assets/construct-sitewise-assets'
import { GreengrassVendingMachine } from '../../constructs/construct-greengrass-vending-machine/construct-greengrass-vending-machine'
import { IotCoreConstruct } from '../../constructs/construct-iot-core-deployment/construct-iot-core-deployment'
import { aws_sns as sns } from 'aws-cdk-lib'
import { aws_sns_subscriptions as subscriptions } from 'aws-cdk-lib'
import { IotControlPanel } from '../../constructs/construct-iot-control-panel/construct-iot-control-panel'
import { CognitoAuth } from '../../constructs/construct-cognito-auth/construct-cognito-auth'
import { TimeStream } from '../../constructs/construct-timestream/construct-timestream'
import { GreengrassServiceRole } from '../../constructs/construct-greengrass-service-role/construct-greengrass-service-role'
import { EkS3 } from '../../constructs/construct-ek-s3-bucket/construct-ek-s3-bucket'

interface IotStackProps extends StackProps {
  assetModel: any
  adminEmail: string
  cognito: CognitoAuth
  timestreamTable: TimeStream
  iotVendingTopic: sns.Topic
  dataLake: EkS3
}

export class IotStack extends Stack {
  public readonly greengrassVendingMachine: GreengrassVendingMachine
  public readonly iotThingVendingMachine: IotVendingMachine
  public readonly sitewiseAssets: SitewiseAssets
  public readonly subTopic: string
  public readonly pubTopic: string
  public readonly iotEndpoint: string

  constructor(scope: Construct, id: string, props: IotStackProps) {
    super(scope, id, props)

    const createGreengrassServiceRole = new GreengrassServiceRole(this, 'GreengrassServiceRole', {})

    // Iot Sitewise Deployment
    this.sitewiseAssets = new SitewiseAssets(this, 'IotSitewiseAssets', {
      assetModelName: 'wind',
    })

    // Greengrass Vending Machine
    this.greengrassVendingMachine = new GreengrassVendingMachine(this, 'GreengrassVendingMachine', {
      wifiPasswordSecretName: CONFIG.wifiPasswordSecretName,
      wifiCountry: CONFIG.wifiCountry,
      wifiSsid: this.node.tryGetContext('wifiSsid'),
      imageType: 'ggcd',
      greengrassVendingSnsTopic: props.iotVendingTopic.topicArn,
    })

    this.greengrassVendingMachine

    // IoT Thing Vending Machine
    this.iotThingVendingMachine = new IotVendingMachine(this, 'IotThingVendingMachine', {
      wifiPasswordSecretName: CONFIG.wifiPasswordSecretName,
      wifiCountry: CONFIG.wifiCountry,
      wifiSsid: this.node.tryGetContext('wifiSsid'),
      imageType: 'thing',
      iotVendingTopic: props.iotVendingTopic,
      sitewiseAssetModelId: this.sitewiseAssets.sitewiseAssetId,
      greengrassGroupArn: this.greengrassVendingMachine.greengrassGroupArn,
    })

    const workshopOption = this.node.tryGetContext('workshopOption')

    if (workshopOption === false) {
      // IoT Core Deployment
      const iotCoreDeployment = new IotCoreConstruct(this, 'IotCoreDeployment', {
        assetModel: props.assetModel,
        timestreamTable: props.timestreamTable,
        dataLake: props.dataLake
      })

      // IoT Thing Deployment
      ;(this.subTopic = 'props.assetModel.subTopic'),
        (this.pubTopic = 'props.assetModel.pubTopic'),
        (this.iotEndpoint = iotCoreDeployment.iotEndpoint)

      new CfnOutput(this, 'IotEndpoint', {
        value: iotCoreDeployment.iotEndpoint,
        description: 'IotEndpoint',
        exportName: 'IotEndpoint',
      })
    } else {
      console.log('This is the workshop version --deploying with workshop configuration')
    }

    const iotControlPanel = new IotControlPanel(this, 'IotControlPanel', {
      cognito: props.cognito,
    })

    new CfnOutput(this, 'apiUrl', {
      value: iotControlPanel.apiUrl,
      description: 'apiUrl',
      exportName: 'apiUrl',
    })
  }
}
