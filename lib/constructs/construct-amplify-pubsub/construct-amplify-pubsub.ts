import * as cdk from 'aws-cdk-lib'
import * as path from 'path'
import { Construct } from 'constructs'
import { AuthorizationType, FieldLogLevel, GraphqlApi, MappingTemplate, Schema } from '@aws-cdk/aws-appsync-alpha'
import {
  Role,
  PolicyStatement,
  ManagedPolicy,
  FederatedPrincipal,
  Effect,
} from 'aws-cdk-lib/aws-iam'
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib'
import {
  AccountRecovery,
  BooleanAttribute,
  CfnUserPoolGroup,
  CfnUserPoolUser,
  CfnUserPoolUserToGroupAttachment,
  DateTimeAttribute,
  StringAttribute,
  UserPool,
  UserPoolClient,
  VerificationEmailStyle,
  CfnIdentityPoolRoleAttachment,
  CfnIdentityPool,
} from 'aws-cdk-lib/aws-cognito'
import {
  IdentityPool,
  RoleMappingMatchType,
} from '@aws-cdk/aws-cognito-identitypool-alpha'
import { aws_iot as iot } from 'aws-cdk-lib'

export interface AmplifyPubSubProps extends StackProps {
  adminEmail?: string
  cognitoAdminGroup: string
  cognitoStandardUserGroup: string
  cognitoAdminUser: string
}

export class AmplifyPubSub extends Construct {
  public readonly policyName: any

  constructor(scope: Construct, id: string, props: AmplifyPubSubProps) {
    super(scope, id)

    // Create iot policy
    const amplifyPubSubPolicy = new iot.CfnPolicy(this, 'Policy', {
      policyName: 'AmplifyPubSubPolicy',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: ['iot:*'],
            Resource: ['*'],
          },
        ],
      },
    });

    cdk.Tags.of(this).add("component", "amplifyPubSub");

  }
}
