import * as path from 'path'
import * as _ from 'lodash'
import {
  Stack,
  StackProps,
  CfnOutput,
  aws_ec2 as ec2,
  aws_iam as iam,
  aws_s3_assets as s3_assets,
  Fn,
  Duration,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { aws_sns as sns } from 'aws-cdk-lib'
import { aws_autoscaling as autoscaling } from 'aws-cdk-lib'
import { SubnetType } from 'aws-cdk-lib/aws-ec2'
import { v4 as uuidv4 } from 'uuid'

export interface SimulatorNodeRedWorkshopProps extends StackProps {
  region: any
  simulatorLaunchCount?: number
}

export class SimulatorNodeRedWorkshop extends Construct {
  public readonly region: string
  public readonly account: string
  public readonly nodeRedInstanceUrls: Array<string>

  constructor(scope: Construct, id: string, props: SimulatorNodeRedWorkshopProps) {
    super(scope, id)

    this.region = props.region
    this.account = Stack.of(this).account
    this.nodeRedInstanceUrls = []

    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      isDefault: true,
    })

    const node_red_settings = new s3_assets.Asset(this, 'NodeRedSettings', {
      path: path.join(__dirname, '..', '..', 'assets/node-red/settings.js'),
    })

    const nginx_configuration = new s3_assets.Asset(this, 'NginxConfiguration', {
      path: path.join(__dirname, '..', '..', 'assets/nginx/default.conf'),
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

    security_group.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(54845), 'Allow OPC-UA access from the world')

    security_group.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(54845), 'Allow OPC-UA access from the world')

    const instance_type = ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL)

    const instance_role = new iam.Role(this, 'SimulatorInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSIoTThingsRegistration'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    })
    instance_role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['iot:CreateKeysAndCertificate', 'iot:Describe*', 'iam:Get*'],
        resources: ['*'],
      })
    )

    node_red_settings.grantRead(instance_role)
    nginx_configuration.grantRead(instance_role)

    const simulatorAutoScalingGroupLogicalId = `${Stack.of(this).stackName}SimulatorASG${String(uuidv4()).slice(0, 4)}`

    const nodeRedInstanceUserData = ec2.UserData.forLinux({
      shebang: '#!/bin/bash -xe',
    })
    nodeRedInstanceUserData.addCommands(
      'apt-get update -y',
      'sudo apt install net-tools',
      'apt-get install -y git awscli ec2-instance-connect build-essential nginx',
      'sudo apt install unzip',
      `curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"`,
      `unzip awscliv2.zip`,
      `sudo ./aws/install`,
      `aws --version`,
      'cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup',
      `aws s3 cp ${nginx_configuration.s3ObjectUrl} /etc/nginx/sites-available/default`,
      'until git clone https://github.com/aws-quickstart/quickstart-linux-utilities.git; do echo "Retrying"; done',
      'cd /quickstart-linux-utilities',
      'source quickstart-cfn-tools.source',
      'qs_update-os || qs_err',
      'qs_bootstrap_pip || qs_err',
      'qs_aws-cfn-bootstrap || qs_err',
      'mkdir -p /opt/aws/bin',
      'ln -s /usr/local/bin/cfn-* /opt/aws/bin/',
      'cd /home/ubuntu',
      'SIMULATOR_UUID=$(sudo dmidecode --string system-uuid)',
      "BASE_NAME='turbine-simulator-workshop'",
      'NEW_NAME="$BASE_NAME-$SIMULATOR_UUID"',
      'echo $NEW_NAME',
      'sudo hostnamectl set-hostname $NEW_NAME',
      'echo $NEW_NAME',
      'cd /home/ubuntu'
    )

    const ubuntu = ec2.MachineImage.fromSsmParameter(
      '/aws/service/canonical/ubuntu/server/20.04/stable/current/amd64/hvm/ebs-gp2/ami-id',
      {
        cachedInContext: false,
        os: ec2.OperatingSystemType.LINUX,
        userData: nodeRedInstanceUserData,
      }
    )

    // TODO -- switch to ECR

    // Create an autoscaling group to launch specified number of EC2 instances with node-RED simulator
    const simulatorAutoscalingGroup = new autoscaling.AutoScalingGroup(this, 'SimulatorASG', {
      groupMetrics: [autoscaling.GroupMetrics.all()],
      desiredCapacity: props.simulatorLaunchCount ? props.simulatorLaunchCount : 3,
      maxCapacity: 8,
      associatePublicIpAddress: true,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      healthCheck: autoscaling.HealthCheck.ec2(),
      signals: autoscaling.Signals.waitForAll({
        timeout: Duration.minutes(15),
      }),
      instanceType: instance_type,
      machineImage: ubuntu,
      vpc: vpc,
      securityGroup: security_group,
      role: instance_role,
      userData: nodeRedInstanceUserData,
      init: ec2.CloudFormationInit.fromElements(
        ec2.InitCommand.shellCommand('curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -'),
        ec2.InitCommand.shellCommand('apt install -y nodejs jq'),

        // Install Node-RED and dependent requirements
        ec2.InitCommand.shellCommand('npm install -g pm2'),
        ec2.InitCommand.shellCommand('pm2 startup -u ubuntu --hp /home/ubuntu'),
        ec2.InitCommand.shellCommand('npm install -g --unsafe-perm node-red'),
        ec2.InitCommand.shellCommand("su ubuntu -c 'pm2 start node-red -- --userDir /home/ubuntu/.node-red'"),
        ec2.InitCommand.shellCommand(`while [ ! -f /home/ubuntu/.node-red/settings.js ]; do sleep 2; done; sleep 1;`),
        ec2.InitCommand.shellCommand("su ubuntu -c 'cp settings.js settings.js.backup'", {
          cwd: '/home/ubuntu/.node-red',
        }),
        // Configure Node-RED instance
        ec2.InitCommand.shellCommand("su ubuntu -c 'cp settings.js settings.js.backup'", {
          cwd: '/home/ubuntu/.node-red',
        }),
        ec2.InitCommand.shellCommand(`su ubuntu -c 'aws s3 cp ${node_red_settings.s3ObjectUrl} settings.js'`, {
          cwd: '/home/ubuntu/.node-red',
        }),
        ec2.InitCommand.shellCommand(`su ubuntu -c 'sudo chown -R ubuntu:ubuntu /home/ubuntu/.node-red/flows.json'`, {
          cwd: '/home/ubuntu/.node-red',
        }),
        ec2.InitCommand.shellCommand(`su ubuntu -c 'ls'`, {
          cwd: '/home/ubuntu',
        }),
        ec2.InitCommand.shellCommand(`su ubuntu -c 'ls /home/ubuntu/energykit-embedded'`, {
          cwd: '/home/ubuntu',
        }),
        ec2.InitCommand.shellCommand("su ubuntu -c 'npm install lodash traverse'", {
          cwd: '/home/ubuntu/.node-red',
        }),
        ec2.InitCommand.shellCommand(
          "su ubuntu -c 'npm install node-red-contrib-mqtt-broker hub node-red-dashboard node-red-contrib-aws axios @node-red-contrib-themes/dark'",
          {
            cwd: '/home/ubuntu/.node-red',
          }
        ),
        // Start node-RED server
        ec2.InitCommand.shellCommand("su ubuntu -c 'pm2 restart node-red'"),
        ec2.InitCommand.shellCommand("su ubuntu -c 'pm2 save'"),
        ec2.InitCommand.shellCommand('nginx -t'),
        ec2.InitCommand.shellCommand('service nginx reload'),
        ec2.InitCommand.shellCommand('service nginx reload')
      ),
      initOptions: {
        printLog: true,
      },
    })

    // Get access to the CfnAutoScalingGroup Level 1 resource as child of Level 2 resource
    const cfnSimulatorAutoscalingGroup = simulatorAutoscalingGroup.node.defaultChild as autoscaling.CfnAutoScalingGroup

    // Override the logical ID to math logical ID specified in cfn-signal command
    cfnSimulatorAutoscalingGroup.overrideLogicalId(simulatorAutoScalingGroupLogicalId)

    //
    /*
          new CfnOutput(this, `NodeRedUrl-${simulatorServerList[i]}`, {
            value: `http://${nodeRedSimulatorInstance.instancePublicIp}/node-red`,
            description: `The URL to access Node-RED simulator instance ${simulatorServerList[i]}`,
            exportName: `NodeRedSimulatorUrl-${simulatorServerList[i]}`
        });

          }
          */

    // Set stack outputs to be consumed by local processes

    new CfnOutput(this, `NodeRedUsernameWorkshop`, {
      value: 'admin',
      description: `The username to access Node-RED simulator instance`,
      exportName: `NodeRedSimulatorUsernameWorkshop`,
    })

    new CfnOutput(this, `NodeRedPasswordWorkshop`, {
      value: 'password',
      description: `The password to access Node-RED simulator instance`,
      exportName: `NodeRedSimulatorPasswordWorkshop`,
    })
  }
}
