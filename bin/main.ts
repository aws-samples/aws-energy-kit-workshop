#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { Aspects, IAspect, RemovalPolicy, CfnResource } from 'aws-cdk-lib'
import { AwsSolutionsChecks } from 'cdk-nag'
import { IotStack } from '../lib/stacks/stack-iot/stack-iot'
import { WebStack } from '../lib/stacks/stack-web/stack-web'
import { SimulatorStack } from '../lib/stacks/stack-simulator/stack-simulator'
import { SharedResourcesStack } from '../lib/stacks/stack-shared-resources/stack-shared-resources'
import { TwinmakerStack } from '../lib/stacks/stack-twinmaker/stack-twinmaker'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { Construct, IConstruct } from 'constructs'
import { checkAdminEmailSetup, checkContextFilePresent } from '../resources/setup-checks/setupCheck'
import { WorkshopStack } from '../lib/stacks/stack-workshop/stack-workshop'

const app = new cdk.App()

const appEnv = {
  region: app.node.tryGetContext('awsRegion') ? app.node.tryGetContext('awsRegion') : process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
}

console.log(`Deployment policy is: ${app.node.tryGetContext('DEPLOYMENT_ENV')}`)

/**
 * Check if cdk context is defined either by context file or command line flags
 * If the context file is missing return a
 */
checkContextFilePresent(app)

/**
 * Sets a deletion policy to handle DEV and PROD environments
 * If environment is set to DEV all stacks will delete on destroy
 * If environment is set to PROD stacks will manage delete and destroy separately
 */
export class DeletionPolicySetter implements IAspect {
  constructor(private readonly policy: RemovalPolicy) {}
  visit(node: IConstruct): void {
    /**
     * Nothing stops you from adding more conditions here.
     */
    if (node instanceof CfnResource) {
      node.applyRemovalPolicy(this.policy)
    }
  }
}

/**
 * Sets removal policy to retain on prod
 */
const prodRemovalPolicy = RemovalPolicy.RETAIN

/**
 * Sets removal policy to destroy on dev
 */
const devRemovalPolicy = RemovalPolicy.DESTROY

const adminEmail = app.node.tryGetContext('adminEmail')
const projectName = app.node.tryGetContext('projectName')

checkAdminEmailSetup(adminEmail)

const sharedResources = new SharedResourcesStack(app, 'SharedResourcesStack', {
  env: appEnv,
  adminEmail: adminEmail,
})

const cognito = sharedResources.cognito
const timestreamTable = sharedResources.timestreamTable
const iotVendingTopic = sharedResources.iotVendingTopic

// EnergyKit IoT Stack
const iotOption = app.node.tryGetContext('deployIotStack')
console.log(`Iot deployment option is set to: ${iotOption}`)
const iotStack = new IotStack(app, 'IotStack', {
  env: appEnv,
  assetModel: 'hello',
  adminEmail: adminEmail,
  cognito: cognito,
  timestreamTable: timestreamTable,
  iotVendingTopic: iotVendingTopic,
  dataLake: sharedResources.dataLake,
})

// EnergyKit Web Stack
const webOption = app.node.tryGetContext('deployWebStack')
console.log(`Web deployment option is set to: ${webOption}`)
if (webOption === true) {
  new WebStack(app, 'WebStack', {
    env: appEnv,
    adminEmail: app.node.tryGetContext('adminEmail'),
    cognito: cognito,
    iot: iotStack,
  })
}

const sitewiseAssets = iotStack.sitewiseAssets

// EnergyKit Simulator Stack
const simulatorOption = app.node.tryGetContext('deploySimulatorStack')
console.log(`Web deployment option is set to: ${simulatorOption}`)
if (simulatorOption === true) {
  new SimulatorStack(app, 'SimulatorStack', {
    env: appEnv,
    projectName: projectName,
    adminEmail: adminEmail,
    iotVendingTopic: iotVendingTopic,
    sitewiseAssets: sitewiseAssets,
  })
}

const twinmakerOption = app.node.tryGetContext('deployTwinmakerStack')
console.log(`Twinmaker deployment option is set to: ${twinmakerOption}`)
if (twinmakerOption === true) {
  new TwinmakerStack(app, 'TwinmakerStack', {
    env: appEnv,
    assetName: app.node.tryGetContext('energyCategory'),
  })
}

const workshopOption = app.node.tryGetContext('workshopOption')
console.log(`Workshop option is set to: ${workshopOption}`)
if (workshopOption === true) {
  new WorkshopStack(app, 'WorkshopStack', {
    env: appEnv,
  })
}

cdk.Tags.of(app).add('application', 'energykit')

/*
    Description: Checks if context variable nagEnabled=true and 
    applies cdk nag if it is added to the app synth context
    Inputs: Optionally accepts cdk synth --context nagEnabled=true to apply cdk-nag packs
    Outputs: Outputs cdk-nag verbose logging and throws errors if violations met
    AWS Services: cdk, cdk-nag, aspect
*/

// Add the cdk-nag AwsSolutions Pack with extra verbose logging enabled.
const nagEnabled = app.node.tryGetContext('nagEnabled')
console.log(`cdk-nag option is set to: ${nagEnabled}`)

if (nagEnabled === true) {
  console.log('CDK-nag enabled. Starting cdk-nag review')
  Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))
}
/**
 * Applies removal policy at the app level.
 * This means that when context variable DEPLOYMENT_ENV is set to DEV
 * the resources created will be destroyed upon cdk destroy.
 * If this is not set to DEV then all resources will be retained.
 */
const devDeploymentOption = app.node.tryGetContext('DEPLOYMENT_ENV')
console.log(`Dev deployment option is set to: ${devDeploymentOption}`)
if (devDeploymentOption === 'PROD') {
  Aspects.of(app).add(new DeletionPolicySetter(prodRemovalPolicy))
} else if (devDeploymentOption === 'DEV') {
  Aspects.of(app).add(new DeletionPolicySetter(devRemovalPolicy))
}
