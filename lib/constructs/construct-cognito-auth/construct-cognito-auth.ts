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

export interface CognitoProps extends StackProps {
  adminEmail?: string
}

export class CognitoAuth extends Construct {
  // Cognito
  // public readonly userPool: IUserPool;
  public readonly userPool: UserPool
  // public readonly identityPool: IIdentityPool;
  public readonly identityPool: IdentityPool
  // public readonly userPoolClient: IUserPoolClient;
  public readonly userPoolClient: UserPoolClient
  public readonly adminUser: CfnUserPoolUser

  // IAM
  public readonly AdminUserRole: Role
  public readonly StandardUserRole: Role
  public readonly AuthRole: Role
  public readonly UnAuthRole: Role
  public readonly AdminUserRoleManagedPolicy: ManagedPolicy
  public readonly StandardUserRoleManagedPolicy: ManagedPolicy
  public readonly IdentityPool: CfnIdentityPool
  
  // Transfers
  public readonly userPoolIdOutputTransfer: any
  public readonly identityPoolIdOutputIdTransfer: any
  public readonly userPoolClientIdOutputTransfer: any

  // User
  public readonly cognitoAdminUser: any
  public readonly cognitoAdminGroup: any
  public readonly cognitoStandardUserGroup: any
  
  // Outputs
  public readonly userPoolClientIdOutput: CfnOutput
  public readonly identityPoolIdOutputId: CfnOutput
  public readonly userPoolIdOutput: CfnOutput

  constructor(scope: Construct, id: string, props: CognitoProps) {
    super(scope, id)

    const defaultAdminEmail = this.node.tryGetContext('adminEmail')

    // -- COGNITO USER POOL --
    const userPool = new UserPool(this, 'UserPool', {
      userPoolName: 'UserPool',
      signInAliases: {
        email: true,
        username: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Set the user pool to be destroyed if the stack that deployed it is destroyed
      selfSignUpEnabled: false, // Prevent users to sign up (security mechanism)
      autoVerify: { email: true }, // Verify email addresses by sending a verification code
      accountRecovery: AccountRecovery.EMAIL_ONLY, // Restricts account recovery only to email method
      // Invite Message
      userInvitation: {
        emailSubject: `Welcome to IoT EnergKit!`,
        emailBody:
          'Hello {username}, you have been invited to join AWS IoT EnergyKit! Your temporary password is {####}',
        smsMessage: 'Hello {username}, your temporary password for AWS IoT EnergyKit is {####}',
      },
      // Verification Message
      userVerification: {
        emailSubject: 'Verify your email for AWS IoT EnergyKit',
        emailBody: 'Thanks for signing up for AWS IoT EnergyKit! Your verification code is {####}',
        emailStyle: VerificationEmailStyle.CODE,
        smsMessage: 'Thanks for signing up for AWS IoT EnergyKit! Your verification code is {####}',
      },
      // Standard User Attributes
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        joinedOn: new DateTimeAttribute(),
        isAdmin: new BooleanAttribute({ mutable: false }),
        myappid: new StringAttribute({ minLen: 5, maxLen: 15, mutable: false }),
      },
    })

    this.userPool = userPool

    // -- COGNITO USER POOL (APP) CLIENT
    const userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
      userPool: userPool,
      userPoolClientName: 'UserPoolClient',
      generateSecret: false, // Don't need to generate secret for web app running on browsers
    })

    this.userPoolClient = userPoolClient

    // // -- COGNITO IDENTITY POOL
    //     const identityPool = new IdentityPool(this, 'IdentityPool', {
    //         identityPoolName: 'IdentityPool',
    //         // allowUnauthenticatedIdentities: true,
    //         allowUnauthenticatedIdentities: false,
    //         cognitoIdentityProviders: [
    //           {
    //             clientId: userPoolClient.userPoolClientId,
    //             providerName: userPool.userPoolProviderName,
    //           },
    //         ],
    //     });
    // -- COGNITO IDENTITY POOL
    this.IdentityPool = new CfnIdentityPool(this, 'IdentityPool', {
      identityPoolName: 'IdentityPool',
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    })

    // --- IAM ---
    //  -- AuthRole --
    // Create AuthRole IAM Role using the custom managed policy
    this.AuthRole = new Role(this, 'AuthRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.IdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      // TODO - Add basic read-only AWS Managed Policies
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')],
      description: 'AuthRole granting read-only access to S3',
    })

    //  -- UnAuthRole --
    // Create UnAuthRole IAM Role using the custom managed policy
    this.UnAuthRole = new Role(this, 'UnAuthRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.IdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      // TODO - Add basic read-only AWS Managed Policies
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')],
      description: 'UnAuthRole granting access to S3',
    })

    // -- AdminUserRole --
    // Create AdminUserRole IAM Role using the custom managed policy
    const AdminUserRole = new Role(this, 'AdminUserRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.IdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      // managedPolicies: [
      //  iam.ManagedPolicy.fromManagedPolicyName(scAdminS3PolicyDocument)
      // ],
      description: 'AdminUserRole granting access to S3',
    })

    this.AdminUserRoleManagedPolicy = new ManagedPolicy(this, 'AdminUserRoleManagedPolicy', {
      description: 'All permissions for AdminUserRole',
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:*'],
          resources: ['*'],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['iot:*'],
          resources: ['*'],
        })
      ],
      roles: [AdminUserRole],
    })

    //   // -- StandardUserRole --
    //   // Create StandardUserRole IAM Role using the custom managed policy
    this.StandardUserRole = new Role(this, 'StandardUserRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.IdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      // managedPolicies: [
      //  iam.ManagedPolicy.fromManagedPolicyName(scAdminS3PolicyDocument)
      // ],
      description: 'StandardUserRole granting access to S3',
    })
    this.StandardUserRoleManagedPolicy = new ManagedPolicy(this, 'StandardUserRoleManagedPolicy', {
      description: 'All permissions for StandardUserRole',
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:*'],
          resources: ['*'],
        })
      ],
      roles: [this.StandardUserRole],
    })

    // -- IDENTITY POOL ROLE ATTACHMENT --

    const Region = cdk.Stack.of(this).region // Reference current AWS Region
    const identityProviderUrl = `cognito-idp.${Region}.amazonaws.com/${userPool.userPoolId}:${userPoolClient.userPoolClientId}`

    new CfnIdentityPoolRoleAttachment(this, 'identity-pool-role-attachment', {
      identityPoolId: this.IdentityPool.ref,
      roles: {
        authenticated: this.AuthRole.roleArn,
        unauthenticated: this.UnAuthRole.roleArn,
      },
      roleMappings: {
        roleMappingsKey: {
          type: 'Rules',
          ambiguousRoleResolution: 'Deny',
          identityProvider: identityProviderUrl,
          rulesConfiguration: {
            rules: [
              {
                claim: 'cognito:groups',
                matchType: RoleMappingMatchType.CONTAINS,
                roleArn: AdminUserRole.roleArn,
                value: 'Admin',
              },
              {
                claim: 'cognito:groups',
                matchType: RoleMappingMatchType.CONTAINS,
                roleArn: this.StandardUserRole.roleArn,
                value: 'Standard-Users',
              },
            ],
          },
        },
      },
    })

    // -- COGNITO USER POOL GROUPS
    const AdminUserPoolGroup = new CfnUserPoolGroup(this, 'Admin', {
      userPoolId: userPool.userPoolId,
      description: 'Admin user group',
      groupName: 'Admin',
      precedence: 1,
      roleArn: AdminUserRole.roleArn,
    })
    AdminUserPoolGroup.node.addDependency(AdminUserRole)
    const StandardUserPoolGroup = new CfnUserPoolGroup(this, 'Standard', {
      userPoolId: userPool.userPoolId,
      groupName: 'Standard-Users',
      description: 'Standard user group',
      precedence: 2,
      roleArn: this.StandardUserRole.roleArn,
    })
  
  

    // Create an initial admin user with the email address provided in the CDK context
    const adminUser = new CfnUserPoolUser(this, 'DefaultAdminUser', {
      userPoolId: userPool.userPoolId,
      desiredDeliveryMediums: ['EMAIL'],
      userAttributes: [
        {
          name: 'email',
          value: props.adminEmail,
        },
        {
          name: 'given_name',
          value: 'CarbonLake',
        },
        {
          name: 'family_name',
          value: 'Admin',
        },
      ],
      username: props.adminEmail,
    })

    this.cognitoAdminGroup = AdminUserPoolGroup.ref;
    this.cognitoStandardUserGroup = StandardUserPoolGroup.ref;
    this.cognitoAdminUser = adminUser;

    const cfnUserPoolUserToGroupAttachment = new CfnUserPoolUserToGroupAttachment(
      this,
      'MyCfnUserPoolUserToGroupAttachment',
      {
        groupName: 'Admin',
        username: defaultAdminEmail,
        userPoolId: userPool.userPoolId,
      }
    )

    // Prevent creation of UserGroupAttachment until User is created
    cfnUserPoolUserToGroupAttachment.node.addDependency(adminUser)
    cfnUserPoolUserToGroupAttachment.node.addDependency(AdminUserPoolGroup)

    // Transfer

    this.userPoolIdOutputTransfer = userPool.userPoolId

    
    this.identityPoolIdOutputIdTransfer = this.IdentityPool.ref


    this.userPoolClientIdOutputTransfer = userPoolClient.userPoolClientId
    
    
    // -- Outputs --
    // Set the public variables so other stacks can access the deployed auth/auz related stuff above as well as set as CloudFormation output variables

    // Cognito
    
    
    this.userPoolIdOutput = new CfnOutput(this, 'userPoolId', { 
      value: userPool.userPoolId,
      exportName: 'userPoolId'
    })
    
    this.identityPoolIdOutputId = new CfnOutput(this, 'identityPoolId', { 
      value: this.IdentityPool.ref,
      exportName: 'identityPoolId'
    })

    this.userPoolClientIdOutput = new CfnOutput(this, 'userPoolClientId', {
       value: userPoolClient.userPoolClientId,
       exportName: 'userPoolClientId' 
      })

    // IAM
    this.AdminUserRole = AdminUserRole
    new CfnOutput(this, 'AdminUserRoleOutput', { 
      value: this.AdminUserRole.roleArn,
      exportName: 'AdminUserRoleOutput'
    })

    new CfnOutput(this, 'StandardUserRoleOutput', {
      value: this.StandardUserRole.roleArn,
      exportName: 'StandardUserRoleOutput' 
    })


    // Output API Username (password will be email to admin user on create)
    new cdk.CfnOutput(this, 'adminUsername', {
      value: adminUser.username ?? '' ,
      description: 'Admin username created on build for GraphQL API',
      exportName: 'ApiUsername',
    });


    cdk.Tags.of(this).add("component", "cognitoAuth");

  }
}
