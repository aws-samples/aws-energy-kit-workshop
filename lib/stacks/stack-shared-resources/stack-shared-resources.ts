import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { CognitoAuth } from '../../constructs/construct-cognito-auth/construct-cognito-auth'
import { TimeStream } from '../../constructs/construct-timestream/construct-timestream'
import { aws_sns as sns } from 'aws-cdk-lib'
import { aws_sns_subscriptions as subscriptions } from 'aws-cdk-lib'
import { EkS3 } from '../../constructs/construct-ek-s3-bucket/construct-ek-s3-bucket'

export interface SharedResourcesStackProps extends StackProps {
  adminEmail: string
}

export class SharedResourcesStack extends Stack {
  public readonly cognito: CognitoAuth
  public readonly timestreamTable: TimeStream
  public readonly iotVendingTopic: sns.Topic
  public readonly dataLake: EkS3
  //public readonly sharedResources: SharedResourcesStack

  constructor(scope: Construct, id: string, props: SharedResourcesStackProps) {
    super(scope, id, props)

    this.cognito = new CognitoAuth(this, 'CognitoAuth', {
      adminEmail: props.adminEmail,
    })

    const bucket = new EkS3(this, 'EnergyKitDataLake', {
      //bucketName: "energykit-data-lake"
    })

    this.dataLake = bucket;

    this.timestreamTable = new TimeStream(this, 'TimestreamTable')

    this.iotVendingTopic = new sns.Topic(this, 'sns-topic', {
      displayName: 'EnergyKit IoT Vending Machine Notifications',
    })

    this.iotVendingTopic.addSubscription(new subscriptions.EmailSubscription(props.adminEmail))
  }
}
