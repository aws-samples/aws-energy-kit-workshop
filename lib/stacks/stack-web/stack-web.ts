import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_iam as iam, CfnOutput } from 'aws-cdk-lib';
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_codecommit as codecommit } from "aws-cdk-lib";
import * as path from 'path';
import { AmplifyDeploy } from "../../constructs/construct-amplify-deploy/construct-amplify-deploy";
import { CognitoAuth } from "../../constructs/construct-cognito-auth/construct-cognito-auth";
import { AmplifyPubSub } from "../../constructs/construct-amplify-pubsub/construct-amplify-pubsub";

interface WebStackProps extends cdk.StackProps {
  adminEmail: string,
  cognito: CognitoAuth
}

export class WebStack extends cdk.Stack {
  public amplifyDeployment: AmplifyDeploy;
  public cognito: CognitoAuth

  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    const cognito = props.cognito

    const amplifyPubSub = new AmplifyPubSub(this, "AmplifyPubSub", {
      adminEmail: props.adminEmail,
      cognitoAdminGroup: cognito.cognitoAdminUser,
      cognitoStandardUserGroup: cognito.cognitoStandardUserGroup,
      cognitoAdminUser: cognito.cognitoAdminGroup
    });
    
    amplifyPubSub.node.addDependency(cognito)

    this.amplifyDeployment = new AmplifyDeploy(this, 'AmplifyDeployment', {
      appPath: path.join(__dirname, './app/energy-kit-web'),
      repoName: 'EnergyKitWebApp',
      region: this.region,
      envVariables: {
        'REGION': this.region,
        'IDENTITY_POOL_ID': cognito.identityPoolIdOutputIdTransfer,
        'USER_POOL_ID': cognito.userPoolIdOutputTransfer,
        'USER_POOL_WEB_CLIENT_ID': cognito.userPoolClientIdOutputTransfer,
        "IOT_SUB_TOPIC": "dummy",
        "IOT_PUB_TOPIC": "dummy",
        "IOT_ENDPOINT": "dummy",
      }
    });

    const codeArtifactPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement(
          {
             actions: [
                "codeartifact:List*",
                "codeartifact:Describe*",
                "codeartifact:Get*",
                "codeartifact:Read*",
             ],
             resources: ["*"],
                
          },
    )],
    });

   const amplifyRole = new iam.Role(this, 'AmplifyArtifactRole', {
    assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
    description: 'Role for amplify to access codeartifact',
    inlinePolicies: {
      // 👇 attach the Policy Document as inline policies
      CodeArtifactAccess: codeArtifactPolicy,
    }
  });

  const codebuildRole = new iam.Role(this, 'CodebuildArtifactRole', {
    assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
    description: 'Role for amplify to access codeartifact',
    inlinePolicies: {
      // 👇 attach the Policy Document as inline policies
      CodeArtifactAccess: codeArtifactPolicy,
    }
  });

    new CfnOutput(this, 'WebAppRepositoryCloneUrl', {
      value: this.amplifyDeployment.repository.repositoryCloneUrlHttp,
      description: 'WebAppRepositoryLink',
      exportName: 'WebAppRepositoryLink'
    });

    new CfnOutput(this, 'WebAppId', {
      value: this.amplifyDeployment.amplifyApp.appId,
      description: 'WebAppRepository',
      exportName: 'WebAppRepository'
    });

    new CfnOutput(this, 'AmplifyLink', {
      value: `https://${this.amplifyDeployment.amplifyApp.env.region}.console.aws.amazon.com/amplify/home?region=${this.amplifyDeployment.amplifyApp.env.region}#/${this.amplifyDeployment.amplifyApp.appId}`,
      description: 'AmplifyLink',
      exportName: 'AmplifyLink'
    });

    new CfnOutput(this, 'WebAppDomain', {
      value: `https://dev.${this.amplifyDeployment.amplifyApp.defaultDomain}`,
      description: 'WebAppDomain',
      exportName: 'WebAppDomain'
    });

  cdk.Tags.of(this).add("component", "amplifyDeployment");
}
}
