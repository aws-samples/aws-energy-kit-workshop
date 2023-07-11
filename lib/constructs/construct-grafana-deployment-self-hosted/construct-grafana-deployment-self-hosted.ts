import { Construct } from 'constructs';
import { CustomResource, Stack, Duration, CfnOutput, aws_ec2 as ec2, aws_s3_assets as s3_assets,
  aws_s3_deployment as s3_deployment, } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm'
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from "path";
import * as _ from "lodash";
import { readFileSync } from 'fs';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import yaml from 'js-yaml';
import fs from 'fs';

type GrafanaProps = {
  twinmakerId: string;
  assetName: string;
  region: string;
  datasourceRole: iam.Role;
};

export class GrafanaDeploymentSelfHosted extends Construct {
  public readonly simulatorDashboardUrl: string;
  public readonly telemetryDashboardUrl: string;
  public readonly region: string;
  public readonly account: string;


  constructor(scope: Construct, id: string, props: GrafanaProps) {
    super(scope, id);
    const { twinmakerId, assetName, region, datasourceRole } = props;
    this.region = props.region
    this.account = Stack.of(this).account

    const grafanaRole = new iam.Role(this, 'GrafanaRole', { assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com') });

    grafanaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:*'],
        resources: ["*"],
      }),
    );

    grafanaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["iottwinmaker:*"],
        resources: ["*"],
      }),
    );

    grafanaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["iottwinmaker:ListWorkspaces"],
        resources: ["*"],
      }),
    );

    const grafanaSummaryDashboard = new s3_assets.Asset(this, "GrafanaSummaryDashboard", {
      path: path.join(__dirname, ".", "dashboards/overview.json"),
    });

    const grafanaDashboardConfig = new s3_assets.Asset(this, "GrafanaDatasourceConfig", {
      path: path.join(__dirname, ".", "dashboards/default.yaml"),
    });

    // create ec2 instance to host grafana
    const vpc = ec2.Vpc.fromLookup(this, "Vpc", {
        isDefault: true,
      });

    const security_group = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc,
      description:
          "Security group for EC2 instances created with EnergyKit self hosted Grafana",
      allowAllOutbound: true,
  });

  security_group.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allow ssh access from the world"
    );

  security_group.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3000),
      "Allow Grafana access from the world"
  );

security_group.addIngressRule(
  ec2.Peer.anyIpv4(),
  ec2.Port.tcp(80),
  "Allow HTTP access from the world"
);


  const instance_role = new iam.Role(this, 'GrafanaInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });
    
    grafanaSummaryDashboard.grantRead(instance_role);
    grafanaDashboardConfig.grantRead(instance_role);
    
    const describeIamManagedPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName(
      'AmazonSSMReadOnlyAccess'
    );
    
    instance_role.addManagedPolicy(describeIamManagedPolicy)

    props.datasourceRole.grantAssumeRole(instance_role);
    props.datasourceRole.assumeRolePolicy?.addStatements(
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        principals: [new iam.ArnPrincipal(instance_role.roleArn)],
      }),
    );

    const data = {
      apiVersion: 1,
      datasources: [{
        name: 'AWS IoT TwinMaker',
        type: 'grafana-iot-twinmaker-datasource',
        access: 'proxy',
        basicAuth: false,
        isDefault: true,
        jsonData: {
          assumeRoleArn: "REPLACE_WITH_DATASOURCE_ROLE_ARN",
          authType: 'default',
          defaultRegion: props.region,
          workspaceId: props.twinmakerId,
        }
    }]
      
    };

    console.log(data)

    const yamlStr = yaml.dump(data);

    console.log(yamlStr)

    console.log(yamlStr)
    fs.writeFileSync(path.join(__dirname, ".", "datasources/datasources.yaml"), yamlStr, 'utf8');
    
    const grafanaDatasourceAsset = new s3_assets.Asset(this, "GrafanaDatasourceAsset", {
      path: path.join(__dirname, ".", "datasources/datasources.yaml"),
    });
      
    const grafanaInstanceUserData = ec2.UserData.forLinux({
      shebang: "#!/bin/bash -xe"
      });
            
            grafanaInstanceUserData.addCommands(
              "echo '#############################################################'",
              "echo '########## UPDATE EC2 INSTANCE ##########'",
              "echo '#############################################################'",
              "sudo yum update -y",
              "echo '#############################################################'",
              "echo '########## INSTALL GRAFANA REQUIREMENTS ##########'",
              "echo '#############################################################'",
              "sudo chmod 777 /etc/yum.repos.d",
              "sudo echo '[grafana]'> /etc/yum.repos.d/grafana.repo",
              "sudo chmod 777 /etc/yum.repos.d/grafana.repo",
              "sudo echo 'name=grafana'>> /etc/yum.repos.d/grafana.repo",
              "sudo echo 'baseurl=https://packages.grafana.com/oss/rpm'>> /etc/yum.repos.d/grafana.repo",
              "sudo echo 'repo_gpgcheck=1'>> /etc/yum.repos.d/grafana.repo",
              "sudo echo 'enabled=1'>> /etc/yum.repos.d/grafana.repo",
              "sudo echo 'gpgcheck=1'>> /etc/yum.repos.d/grafana.repo",
              "sudo echo 'gpgkey=https://packages.grafana.com/gpg.key'>> /etc/yum.repos.d/grafana.repo",
              "sudo echo 'sslverify=1'>> /etc/yum.repos.d/grafana.repo",
              "sudo echo 'sslcacert=/etc/pki/tls/certs/ca-bundle.crt'>> /etc/yum.repos.d/grafana.repo",
              "cat /etc/yum.repos.d/grafana.repo",
              "echo '#############################################################'",
              "echo '########## INSTALL GRAFANA ##########'",
              "echo '#############################################################'",
              "sudo yum install -y grafana",
              "sudo yum install jq -y",
              "echo '#############################################################'",
              "echo '########## START GRAFANA ##########'",
              "echo '#############################################################'",
              "sudo systemctl daemon-reload",
              "sudo systemctl start grafana-server",
              "sudo systemctl status grafana-server",
              "sudo systemctl enable grafana-server.service",
              "echo '#############################################################'",
              "echo '################# Initial build complete! ################'",
              "echo '#############################################################'",
              `sudo chmod 777 /etc/grafana/provisioning/datasources`,
              `ls /etc/grafana/provisioning/datasources`,
              `sudo rm /etc/grafana/provisioning/datasources/*`,
              `aws s3 cp ${grafanaDatasourceAsset.s3ObjectUrl} /etc/grafana/provisioning/datasources/default.yaml`,
              `ROLE_ARN=$(aws ssm get-parameter --name /twinmakerDatasourceRole/arn --query 'Parameter.Value' --region ${props.region} --output text)`,
              `echo $ROLE_ARN`,  
              `sed -i "s@REPLACE_WITH_DATASOURCE_ROLE_ARN@$ROLE_ARN@g" /etc/grafana/provisioning/datasources/default.yaml`,              
              `cat /etc/grafana/provisioning/datasources/default.yaml`
            );

          const twinmakerDatasourceRoleArnSsmSecret = new ssm.StringParameter(this, 'TwinmakerDatasourceRoleArnSsmSecret', {
            parameterName: `/twinmakerDatasourceRole/arn`,
            stringValue: props.datasourceRole.roleArn
          })

          twinmakerDatasourceRoleArnSsmSecret.grantRead(instance_role)
                      
          const grafanaInstance = new ec2.Instance(this, `GrafanaInstance`, {
              instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
              machineImage: new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 }),
              vpc: vpc,
              securityGroup: security_group,
              instanceName: `energykit-grafana-instance`,
              role: instance_role,
              userData: grafanaInstanceUserData,
              init: ec2.CloudFormationInit.fromElements(
                ec2.InitCommand.shellCommand("ls"),
                ec2.InitCommand.shellCommand("sudo chmod 777 /var/lib/grafana"),
                ec2.InitCommand.shellCommand("ls /var/lib/grafana"),
                ec2.InitCommand.shellCommand(`mkdir /var/lib/grafana/dashboards`),
                ec2.InitCommand.shellCommand("ls /var/lib/grafana"),
                ec2.InitCommand.shellCommand(`grafana-cli plugins install grafana-iot-twinmaker-app`),
                ec2.InitCommand.shellCommand("wait"),
                ec2.InitCommand.shellCommand("sudo systemctl restart grafana-server"),
                ec2.InitCommand.shellCommand(`sudo chmod 777 /var/lib/grafana/dashboards`),
                ec2.InitCommand.shellCommand(`aws s3 cp ${grafanaDashboardConfig.s3ObjectUrl} /etc/grafana/provisioning/dashboards/default.yaml`),
                //ec2.InitCommand.shellCommand(`rm /etc/grafana/provisioning/dashboards/sample.yml`),
                ec2.InitCommand.shellCommand(`sudo chmod 777 /etc/grafana/provisioning/datasources/default.yaml`),
                ec2.InitCommand.shellCommand(`cat /etc/grafana/provisioning/datasources/default.yaml`),
                ec2.InitCommand.shellCommand(`sudo chmod 777 /etc/grafana/provisioning/dashboards`),
                ec2.InitCommand.shellCommand(`aws s3 cp ${grafanaSummaryDashboard.s3ObjectUrl} /var/lib/grafana/dashboards/summary.json`),
                ec2.InitCommand.shellCommand("wait"),
                ec2.InitCommand.shellCommand("sudo systemctl restart grafana-server")
            ),
            initOptions: {
              // Optional, how long the installation is expected to take (5 minutes by default)
              timeout: Duration.minutes(10),
            },
        });


          new CfnOutput(this, `GrafanaInstanceUrl`, {
            value: `http://${grafanaInstance.instancePublicIp}:3000`,
            description: `The URL to access energykit grafana instance`,
            exportName: `GrafanaInstanceUrl`
        });

        new CfnOutput(this, `GrafanaUsername`, {
          value: "admin",
          description: `The username to access Node-RED simulator instance`,
          exportName: `GrafanaUsername`
      });

      new CfnOutput(this, `GrafanaPassword`, {
          value: "admin",
          description: `The password to access Node-RED simulator instance`,
          exportName: `GrafanaPassword`
      });

      new CfnOutput(this, `GrafanaTwinmakerDatasourceRoleArn`, {
        value: props.datasourceRole.roleArn,
        description: `GrafanaTwinmakerDatasourceRoleArn`,
        exportName: `GrafanaTwinmakerDatasourceRoleArn`
    });

    new CfnOutput(this, `GrafanaTwinmakerWorkspaceId`, {
      value: props.twinmakerId,
      description: `GrafanaTwinmakerWorkspaceId`,
      exportName: `GrafanaTwinmakerWorkspaceId`
  });

          }

  }