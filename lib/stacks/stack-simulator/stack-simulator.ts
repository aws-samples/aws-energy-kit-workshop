import * as path from 'path'
import * as _ from 'lodash'
import {
  Stack,
  StackProps,
  CfnOutput,
  aws_ec2 as ec2,
  aws_iam as iam,
  aws_iotsitewise as sitewise,
  aws_s3_assets as s3_assets,
  aws_s3_deployment as s3_deployment,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { SimulatorNodeRed } from '../../constructs/construct-simulator-node-red/construct-simulator-node-red'
import { aws_sns as sns } from 'aws-cdk-lib'
import { aws_sns_subscriptions as subscriptions } from 'aws-cdk-lib'
import { SitewiseAssets } from '../../constructs/construct-sitewise-assets/construct-sitewise-assets'

export interface SimulatorStackProps extends StackProps {
  adminEmail: string
  projectName: string
  iotVendingTopic: sns.Topic
  sitewiseAssets: SitewiseAssets
}

export class SimulatorStack extends Stack {
  constructor(scope: Construct, id: string, props: SimulatorStackProps) {
    super(scope, id, props)

    const nodeRedSimulator = new SimulatorNodeRed(this, 'NodeRedSimulator', {
      region: props.env?.region,
      iotVendingTopic: props.iotVendingTopic,
      sitewiseAssets: props.sitewiseAssets,
    })
  }
}
