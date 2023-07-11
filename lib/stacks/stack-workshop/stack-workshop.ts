import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { IotVendingMachine } from '../../constructs/construct-iot-vending-machine/construct-iot-vending-machine'
import { SitewiseAssets } from '../../constructs/construct-sitewise-assets/construct-sitewise-assets'
import { GreengrassVendingMachine } from '../../constructs/construct-greengrass-vending-machine/construct-greengrass-vending-machine'
import { aws_sns as sns } from 'aws-cdk-lib'
import { aws_ec2 as ec2 } from 'aws-cdk-lib'
import { aws_iam as iam } from 'aws-cdk-lib'
import { aws_sns_subscriptions as subscriptions } from 'aws-cdk-lib'
import { CognitoAuth } from '../../constructs/construct-cognito-auth/construct-cognito-auth'
import { SimulatorNodeRedWorkshop } from '../../constructs/construct-simulator-node-red-workshop/construct-simulator-node-red-workshop'

interface WorkshopStackProps extends StackProps {}

export class WorkshopStack extends Stack {
  public readonly greengrassVendingMachine: GreengrassVendingMachine
  public readonly iotThingVendingMachine: IotVendingMachine
  public readonly sitewiseAssets: SitewiseAssets
  public readonly subTopic: string
  public readonly pubTopic: string
  public readonly iotEndpoint: string

  constructor(scope: Construct, id: string, props: WorkshopStackProps) {
    super(scope, id, props)

    /*

    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      isDefault: true,
    })

    const security_group = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      description: 'Security group for EC2 instances created with EnergyKitSimulatorStack',
      allowAllOutbound: true,
    })

    security_group.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow ssh access from the world')

    security_group.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP access from the world')

    security_group.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP access from the world')

    security_group.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow AWS IoT SiteWise data endpoint communication'
    )

    security_group.addEgressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow AWS IoT SiteWise data endpoint communication'
    )

    security_group.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8883),
      'Allow AWS IoT Greengrass endpoints communication'
    )

    security_group.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8883))

    const instance_role = new iam.Role(this, 'IotInstanceRoleCloud', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSIoTThingsRegistration'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    })

    const instance_type = ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL)

    const greengrassCloudServer = new ec2.Instance(this, 'GreengrassInstanceCloud', {
      instanceType: instance_type,
      machineImage: new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 }),
      vpc: vpc,
      securityGroup: security_group,
      instanceName: `energykit-greengrass-cloud-instance`,
      role: instance_role,
    })


    const manualSimulatorInstanceGroup = new SimulatorNodeRedWorkshop(this, 'ManualSimulatorInstanceGroup', {
      region: Stack.of(this).region,
      simulatorLaunchCount: 1
    })
    */

    const sitewiseIotAccessRole = new iam.Role(this, 'IotToSitewiseBatchPutRole', {
      roleName: 'IotToSitewiseBatchPutRole',
      assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
    })

    /**
     * Creates an access role for workshop only
     * Allows IoT core to write to sitewise assets
     * This permissive policy is only used for workshops
     */
    sitewiseIotAccessRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['iotsitewise:BatchPutAssetPropertyValue'],
        resources: ['*'],
      })
    )
  }
}
