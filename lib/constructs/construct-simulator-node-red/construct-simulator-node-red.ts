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
    aws_s3_deployment as s3_deployment,
    Fn,
    Duration
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { GreengrassDeployment } from "../construct-greengrass-vending-machine/greengrass-deployment/greengrass-deployment";
import { aws_iot as iot } from 'aws-cdk-lib';
import { IotVendingMachine } from "../construct-iot-vending-machine/construct-iot-vending-machine";
import { aws_sns as sns} from 'aws-cdk-lib'
import { SitewiseAssets } from "../construct-sitewise-assets/construct-sitewise-assets";
import { aws_autoscaling as autoscaling } from "aws-cdk-lib";
import { GroupMetric } from "aws-cdk-lib/aws-autoscaling";
import { SubnetType } from "aws-cdk-lib/aws-ec2";
import {v4 as uuidv4} from 'uuid';


export interface SimulatorNodeRedProps extends StackProps {
    region: any;
    iotVendingTopic: sns.Topic;
    sitewiseAssets: SitewiseAssets;
    simulatorLaunchCount?: number;
}

export class SimulatorNodeRed extends Construct {
    public readonly region: string
    public readonly account: string
    public readonly nodeRedInstanceUrls: Array<string>

    constructor(scope: Construct, id: string, props: SimulatorNodeRedProps) {
        super(scope, id);

        this.region = props.region
        this.account = Stack.of(this).account
        this.nodeRedInstanceUrls = []

        const greengrassDeployment = new GreengrassDeployment(this, "GreengrassDeployment",{
            thingType: "simulator"
          })

        const thingDeployment = new IotVendingMachine(this, "ThingDeployment", {
            iotVendingTopic: props.iotVendingTopic,
            sitewiseAssetModelId: props.sitewiseAssets.sitewiseAssetId,
            greengrassGroupArn: greengrassDeployment.greengrassGroupArn,
            imageType: "simulator"
        })

        const vpc = ec2.Vpc.fromLookup(this, "Vpc", {
            isDefault: true,
        });

        const node_red_settings = new s3_assets.Asset(this, "NodeRedSettings", {
            path: path.join(__dirname, "..", "..", "assets/node-red/settings.js"),
        });

        const node_red_flows = new s3_assets.Asset(this, "NodeRedFlows", {
            path: path.join(__dirname, "..", "..", "assets/node-red/flows.json"),
        });

        const nginx_configuration = new s3_assets.Asset(
            this,
            "NginxConfiguration",
            {
                path: path.join(__dirname, "..", "..", "assets/nginx/default.conf"),
            }
        );
        
        const security_group = new ec2.SecurityGroup(this, "SecurityGroup", {
            vpc,
            description:
                "Security group for EC2 instances created with EnergyKitSimulatorStack",
            allowAllOutbound: true,
        });

        security_group.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(22),
            "Allow ssh access from the world"
          );

        security_group.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            "Allow HTTP access from the world"
        );

        security_group.addEgressRule(
          ec2.Peer.anyIpv4(),
          ec2.Port.tcp(80),
          "Allow HTTP access from the world"
      );

        security_group.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(443),
            "Allow AWS IoT SiteWise data endpoint communication"
        );

        security_group.addEgressRule(
          ec2.Peer.anyIpv4(),
          ec2.Port.tcp(443),
          "Allow AWS IoT SiteWise data endpoint communication"
      );

        security_group.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(8883),
            "Allow AWS IoT Greengrass endpoints communication"
        );

        security_group.addEgressRule(
          ec2.Peer.anyIpv4(),
          ec2.Port.tcp(8883),
        )

        security_group.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(54845),
            "Allow OPC-UA access from the world"
        );

        security_group.addEgressRule(
          ec2.Peer.anyIpv4(),
          ec2.Port.tcp(54845),
          "Allow OPC-UA access from the world"
      );

        const instance_role = new iam.Role(this, 'SimulatorInstanceRole', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            managedPolicies: [
              iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSIoTThingsRegistration'),
              iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
            ],
          });
          instance_role.addToPolicy(
            new iam.PolicyStatement({
              actions: ['iot:CreateKeysAndCertificate', 'iot:Describe*', 'iam:Get*'],
              resources: ['*'],
            }),
          );

        node_red_settings.grantRead(instance_role);
        node_red_flows.grantRead(instance_role);
        nginx_configuration.grantRead(instance_role);
        thingDeployment.provisionByClaimSourceBucket.grantRead(instance_role)

        const greengrassCoreUserData = ec2.UserData.forLinux({
            shebang: "#!/bin/bash -xe",
        });
        greengrassCoreUserData.addCommands(
          "exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1",
            "sudo amazon-linux-extras install java-openjdk11 -y",
            "curl -s https://d2s8p88vqu9w66.cloudfront.net/releases/greengrass-nucleus-latest.zip > greengrass-nucleus-latest.zip",
            "unzip greengrass-nucleus-latest.zip -d GreengrassCore && rm greengrass-nucleus-latest.zip",
            "sudo useradd --system --create-home ggc_user",
            "sudo groupadd --system ggc_group",
            "SIMULATOR_UUID=$(sudo dmidecode --string system-uuid)",
            "BASE_NAME='energykit-ggcd-simulator'",
            'NEW_NAME="$BASE_NAME-$SIMULATOR_UUID"',
            "echo $NEW_NAME",
            Fn.sub("${command}", {
                command: `sudo -E java -Dlog.store=FILE \
                -jar ./GreengrassCore/lib/Greengrass.jar \
                --aws-region ${this.region} \
                --root /greengrass/v2 \
                --thing-name $NEW_NAME \
                --thing-group-name ${greengrassDeployment.greengrassThingGroupName} \
                --tes-role-name ${greengrassDeployment.greengrassRoleName} \
                --tes-role-alias-name ${greengrassDeployment.greengrassRoleAliasName} \
                --component-default-user ggc_user:ggc_group \
                --provision true \
                --deploy-dev-tools true \
                --setup-system-service true`,
            }),
            "sudo chmod 755 /greengrass/v2 && sudo chmod 755 /greengrass",
            );
          
          const instance_type = ec2.InstanceType.of(
              ec2.InstanceClass.T3,
              ec2.InstanceSize.SMALL
            );
        

        const greengrassSimulatorServer = new ec2.Instance(this, "GreengrassSimulatorServer", {
            instanceType: instance_type,
            machineImage: new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 }),
            vpc: vpc,
            securityGroup: security_group,
            instanceName: `energykit-greengrass-simulator-server`,
            role: instance_role,
            userData: greengrassCoreUserData
        });

            const simulatorAutoScalingGroupLogicalId = `${Stack.of(this).stackName}SimulatorASG${String(uuidv4()).slice(0,4)}`


            const nodeRedInstanceUserData = ec2.UserData.forLinux({
              shebang: "#!/bin/bash -xe"
            });
            nodeRedInstanceUserData.addCommands(
              "apt-get update -y",
              "sudo apt install net-tools",
              "apt-get install -y git awscli ec2-instance-connect build-essential nginx",
              "sudo apt install unzip",
              `curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"`,
              `unzip awscliv2.zip`,
              `sudo ./aws/install`,
              `aws --version`,
              "cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup",
              `aws s3 cp ${nginx_configuration.s3ObjectUrl} /etc/nginx/sites-available/default`,
              'until git clone https://github.com/aws-quickstart/quickstart-linux-utilities.git; do echo "Retrying"; done',
              "cd /quickstart-linux-utilities",
              "source quickstart-cfn-tools.source",
              "qs_update-os || qs_err",
              "qs_bootstrap_pip || qs_err",
              "qs_aws-cfn-bootstrap || qs_err",
              "mkdir -p /opt/aws/bin",
              "ln -s /usr/local/bin/cfn-* /opt/aws/bin/",
              "mkdir /home/ubuntu/.awscerts",
              "cd /home/ubuntu",
              Fn.sub("${command}", {
                  command: `aws s3 cp ${thingDeployment.provisionByClaimSourceBucket.s3UrlForObject("rpi-image-builder.zip")} ./`
                }),
              "unzip rpi-image-builder.zip && sudo rm rpi-image-builder.zip",
              "sudo rm build-rpi-image.bash firstboot.bash firstboot.service",
              "echo '################ energykit-embedded-located-here ################'",
              "sudo pwd",
              "sudo ls",
              "sudo ls -l",
              "SIMULATOR_UUID=$(sudo dmidecode --string system-uuid)",
              "BASE_NAME='turbine-simulator'",
              'NEW_NAME="$BASE_NAME-$SIMULATOR_UUID"',
              "echo $NEW_NAME",
              "sudo hostnamectl set-hostname $NEW_NAME",
              "echo $NEW_NAME",
              "cd /home/ubuntu",
              "sudo chmod -R 777 ./",
              "sudo chmod -R 777 *",
              "cd /home/ubuntu/energykit-embedded",
              "sudo chmod -R 777 ./",
              "sudo chmod -R 777 ./node-red-sim",
              "sudo chmod 777 ./node-red-sim/replace.py",
              "cd /home/ubuntu",
              "sudo chown -R ubuntu:ubuntu .awscerts",
              "cd /home/ubuntu/aws-iot-fleet-provisioning",
              "sudo chmod -R 777 ./",
              "echo '#############################################################'",
              "echo '########## INSTALL FLEET PROVISIONING REQUIREMENTS ##########'",
              "echo '#############################################################'",
              "python3 -m pip install -r requirements.txt",
              "echo $NEW_NAME",
              "echo 'Requirements installed and moving on to next step'",
              "echo 'Ready to provision by fleet'",
              "echo '#############################################################'",
              "echo '################## PROVISION DEVICE BY CLAIM ################'",
              "echo '#############################################################'",
              "python3 main.py ${NEW_NAME}",
              "echo '##############################################################'",
              "echo '################## MOVE CERTS FOR ONGOING USE ################'",
              "echo '##############################################################'",
              "sudo mv ./certs/* /home/ubuntu/.awscerts",
              "echo 'Successfully completed provisioning of $NEW_NAME'",
              "echo '#############################################################'",
              "echo '################## MOVE CLAIM CERTIFICATES ##################'",
              "echo '#############################################################'",
              "sudo rm /home/ubuntu/.awscerts/claim-certificate.pem.crt",
              "sudo rm /home/ubuntu/.awscerts/claim-private.pem.key",
              "cd /home/ubuntu/.awscerts/",
              `ls`,
              `sudo mv $(find . -type f -name "*.pem.crt") ./device.pem.crt`,
              `sudo mv $(find . -type f -name "*.pem.key") ./private.pem.key`,
              `sudo mv $(find . -type f -name "*.pem") ./AmazonRootCA1.pem`
            );
  
            const ubuntu = ec2.MachineImage.fromSsmParameter(
              "/aws/service/canonical/ubuntu/server/focal/stable/current/amd64/hvm/ebs-gp2/ami-id",
              {
                  cachedInContext: false,
                  os: ec2.OperatingSystemType.LINUX,
                  userData: nodeRedInstanceUserData,
              }
          );

          // TODO -- switch to ECR
                    
          // Create an autoscaling group to launch specified number of EC2 instances with node-RED simulator
          const simulatorAutoscalingGroup = new autoscaling.AutoScalingGroup(this, "SimulatorASG", {
            groupMetrics: [autoscaling.GroupMetrics.all()],
            desiredCapacity: props.simulatorLaunchCount ? props.simulatorLaunchCount : 3,
            maxCapacity: 8,
            associatePublicIpAddress: true,
            vpcSubnets: {subnetType: SubnetType.PUBLIC},
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
                  ec2.InitCommand.shellCommand("curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -"),
                  ec2.InitCommand.shellCommand("apt install -y nodejs jq"),
                  
                  // Install Node-RED and dependent requirements
                  ec2.InitCommand.shellCommand("npm install -g pm2"),
                  ec2.InitCommand.shellCommand("pm2 startup -u ubuntu --hp /home/ubuntu"),
                  ec2.InitCommand.shellCommand("npm install -g --unsafe-perm node-red"),
                  ec2.InitCommand.shellCommand("su ubuntu -c 'pm2 start node-red -- --userDir /home/ubuntu/.node-red'"),
                  ec2.InitCommand.shellCommand(`while [ ! -f /home/ubuntu/.node-red/settings.js ]; do sleep 2; done; sleep 1;`),
                  ec2.InitCommand.shellCommand("su ubuntu -c 'cp settings.js settings.js.backup'", {
                      cwd: "/home/ubuntu/.node-red"
                  }),
                  // Configure Node-RED instance
                  ec2.InitCommand.shellCommand("su ubuntu -c 'cp settings.js settings.js.backup'", {
                      cwd: "/home/ubuntu/.node-red"
                  }),
                  ec2.InitCommand.shellCommand(`su ubuntu -c 'aws s3 cp ${node_red_settings.s3ObjectUrl} settings.js'`, {
                      cwd: "/home/ubuntu/.node-red"
                  }),
                  ec2.InitCommand.shellCommand(`su ubuntu -c 'aws s3 cp ${node_red_flows.s3ObjectUrl} flows.json'`, {
                      cwd: "/home/ubuntu/.node-red"
                  }),
                  ec2.InitCommand.shellCommand(`su ubuntu -c 'sudo chown -R ubuntu:ubuntu /home/ubuntu/.node-red/flows.json'`, {
                    cwd: "/home/ubuntu/.node-red"
                  }),
                  ec2.InitCommand.shellCommand(`su ubuntu -c 'ls'`, {
                    cwd: "/home/ubuntu"
                  }),
                  ec2.InitCommand.shellCommand(`su ubuntu -c 'ls /home/ubuntu/energykit-embedded'`, {
                    cwd: "/home/ubuntu"
                  }),
                  ec2.InitCommand.shellCommand(`su ubuntu -c 'ls /home/ubuntu/energykit-embedded/node-red-sim'`, {
                    cwd: "/home/ubuntu"
                  }),
                  ec2.InitCommand.shellCommand(`su ubuntu -c 'sudo chmod 777 /home/ubuntu/energykit-embedded/node-red-sim/replace.py'`, {
                    cwd: "/home/ubuntu"
                  }),
                  ec2.InitCommand.shellCommand(`su ubuntu -c 'sudo chown -R ubuntu:ubuntu /home/ubuntu/energykit-embedded/node-red-sim/replace.py'`, {
                    cwd: "/home/ubuntu"
                  }),
                  ec2.InitCommand.shellCommand(`su ubuntu -c 'python3 /home/ubuntu/energykit-embedded//node-red-sim/replace.py --tag broker --original INSERT_GREENGRASS_CORE_DEVICE_LOCAL_IP_ADDRESS --replacement ${greengrassSimulatorServer.instancePrivateIp} --path ./flows.json'`, {
                    cwd: "/home/ubuntu/.node-red"
                  }),
                  ec2.InitCommand.shellCommand(`su ubuntu -c 'python3 /home/ubuntu/energykit-embedded//node-red-sim/replace.py --tag clientid --original INSERT_CLIENT_DEVICE_THING_NAME --replacement "$HOSTNAME" --path ./flows.json'`, {
                    cwd: "/home/ubuntu/.node-red"
                  }),
                  ec2.InitCommand.shellCommand("su ubuntu -c 'npm install lodash traverse'", {
                      cwd: "/home/ubuntu/.node-red"
                  }),
                  ec2.InitCommand.shellCommand("su ubuntu -c 'npm install node-red-contrib-mqtt-broker hub node-red-dashboard node-red-contrib-aws axios @node-red-contrib-themes/dark'", {
                    cwd: "/home/ubuntu/.node-red"
                  }),
                  // Start node-RED server
                    ec2.InitCommand.shellCommand("su ubuntu -c 'pm2 restart node-red'"),
                    ec2.InitCommand.shellCommand("su ubuntu -c 'pm2 save'"),
                    ec2.InitCommand.shellCommand("nginx -t"),
                    ec2.InitCommand.shellCommand("service nginx reload"),
                    ec2.InitCommand.shellCommand("service nginx reload")
              ),
              initOptions: {
                printLog: true
              },
          })

          // Get access to the CfnAutoScalingGroup Level 1 resource as child of Level 2 resource
          const cfnSimulatorAutoscalingGroup = simulatorAutoscalingGroup.node.defaultChild as autoscaling.CfnAutoScalingGroup

          // Override the logical ID to math logical ID specified in cfn-signal command
          cfnSimulatorAutoscalingGroup.overrideLogicalId(simulatorAutoScalingGroupLogicalId);

          // 
          simulatorAutoscalingGroup.node.addDependency(greengrassSimulatorServer);
          /*
          new CfnOutput(this, `NodeRedUrl-${simulatorServerList[i]}`, {
            value: `http://${nodeRedSimulatorInstance.instancePublicIp}/node-red`,
            description: `The URL to access Node-RED simulator instance ${simulatorServerList[i]}`,
            exportName: `NodeRedSimulatorUrl-${simulatorServerList[i]}`
        });

          }
          */
        

        // Set stack outputs to be consumed by local processes

      new CfnOutput(this, `NodeRedUsername`, {
          value: "admin",
          description: `The username to access Node-RED simulator instance`,
          exportName: `NodeRedSimulatorUsername`
      });

      new CfnOutput(this, `NodeRedPassword`, {
          value: "password",
          description: `The password to access Node-RED simulator instance`,
          exportName: `NodeRedSimulatorPassword`
      });
        
        new CfnOutput(this, "GreengrassCoreSimulatorDevicePublicIp", {
            value: greengrassSimulatorServer.instancePublicIp,
            exportName: `GreengrassCoreSimulatorDevicePublicIp`
        });

        
    }
}
