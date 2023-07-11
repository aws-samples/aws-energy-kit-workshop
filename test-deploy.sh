#!/bin/bash

# synthesize cdk with context inputs
NEW_CONTEXT=$(jq '.adminEmail = "test@test.com"' cdk.context.template.json)
echo $NEW_CONTEXT > cdk.context.json

cdk synth --context region=$region --context adminEmail="test@email.com" --context wifiSsid="AWSeuFieldDemo" --context projectName="EnergyKit" --context energyCategory="wind" --context deployIotStack=true --context deployTwinmakerStack=true --context deployWebStack=true --context deploySimulatorStack=true --context workshopOption=false, --context nagEnabled=false, --context DEPLOYMENT_ENV="DEV"
cdk bootstrap --context region=$region --context adminEmail="test@email.com" --context wifiSsid="AWSeuFieldDemo" --context projectName="EnergyKit" --context energyCategory="wind" --context deployIotStack=true --context deployTwinmakerStack=true --context deployWebStack=true --context deploySimulatorStack=true --context workshopOption=false, --context nagEnabled=false, --context DEPLOYMENT_ENV="DEV"  #bootstraps cdk in the region
wait
echo "🚀 deploying all"
cdk deploy --all
rm cdk.context.json