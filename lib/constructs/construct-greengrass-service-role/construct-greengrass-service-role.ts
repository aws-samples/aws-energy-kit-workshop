import * as path from "path";
import * as _ from "lodash";
import {
    Stack,
    StackProps,
    aws_iam as iam,
} from "aws-cdk-lib";
import { AwsCustomResource, PhysicalResourceId, AwsCustomResourcePolicy } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import {v4 as uuidv4} from 'uuid';


export class GreengrassServiceRole extends Construct {
    public readonly greengrassRegion: string;
    public readonly greengrassServiceRole: iam.Role;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id);
        const stack = Stack.of(this);
        this.greengrassRegion = stack.region;
        const greengrassServicePrincipal = new iam.ServicePrincipal('greengrass.amazonaws.com')

        greengrassServicePrincipal.withConditions({
            "StringEquals": {
                "aws:SourceAccount": `${Stack.of(this).account}`
            },
            "ArnLike": {
                "aws:SourceArn": `arn:aws:greengrass:${Stack.of(this).region}:${Stack.of(this).account}:*`
            }
        })

        const greengrassServiceRole = new iam.Role(this, "GreengrassServiceRole", {
            assumedBy: greengrassServicePrincipal,
            roleName: `Greengrass_ServiceRole`,
            managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName(
                'service-role/AWSGreengrassResourceAccessRolePolicy',
            )]
        });

        // Associate greengrass service role with AWSCustomResource

        greengrassServiceRole.addToPolicy(new iam.PolicyStatement({
            actions: ["sts:AssumeRole"],
            resources: ["*"],
            conditions: {
                "StringEquals": {
                    "aws:SourceAccount": `${Stack.of(this).account}`
                },
                "ArnLike": {
                    "aws:SourceArn": `arn:aws:greengrass:${Stack.of(this).region}:${Stack.of(this).account}:*`
                }
            },
            
        }))

        const associateGreengrassServiceRolePolicyStatement = new iam.PolicyStatement({
            actions: ['greengrass:AssociateServiceRoleToAccount', 'greengrass:DisassociateServiceRoleFromAccount', "iam:PassRole"],
            resources: ["*"]
        })
                    

        // Associate the greengrass service role
        const associateGreengrassServiceRole = new AwsCustomResource(this, 'AssociateGreengrassServiceRole', {
            onCreate: { // will also be called for a CREATE event
              service: 'GreengrassV2',
              action: 'associateServiceRoleToAccount',
              physicalResourceId: PhysicalResourceId.of(Date.now().toString()),
              region: this.greengrassRegion,
              parameters: {
                roleArn: greengrassServiceRole.roleArn,    
              },
              
            },
            onDelete: {
                service: 'GreengrassV2',
                action: 'disassociateServiceRoleFromAccount',
                region: this.greengrassRegion
            },
            policy: AwsCustomResourcePolicy.fromStatements([associateGreengrassServiceRolePolicyStatement])
          });
          this.greengrassServiceRole = greengrassServiceRole;
        }}