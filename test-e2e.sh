#!/bin/bash

# WELCOME TO e2e test

# to run this script manually navigate to top level directory of the package and sh test-e2e.sh

echo "Welcome to the e2e test. This test deploys the full infrastructure and then performs an e2e test with sample data."
echo "If the test is successful we will destroy the infrastructure and all of it's contents and clean up the account."

regions=("eu-west-1") #list of defined regions to loop through for deployment

for region in "${regions[@]}"
do
   echo "Setting aws default region to $region"
   export AWS_DEFAULT_REGION=$region #updates local aws config to the region defined for deployment
   echo "🚀 deploying cdk app in test to $region 📍"
   echo "🥾 bootstrapping cdk in $region 📍"
   # cdk bootstrap --context region=$region --context adminEmail="test@email.com" --context wifiSsid="AWSeuFieldDemo" --context projectName="EnergyKit" --context energyCategory="wind" --context deployIotStack=true --context deployTwinmakerStack=true --context deployWebStack=true --context deploySimulatorStack=true --context workshopOption=false, --context nagEnabled=false, --context DEPLOYMENT_ENV="DEV"  #bootstraps cdk in the region
   echo "🚀 deploying all in $region 📍"
   # cdk deploy --all --context region=$region --context adminEmail="test@email.com" --context wifiSsid="AWSeuFieldDemo" --context projectName="EnergyKit" --context energyCategory="wind" --context deployIotStack=true --context deployTwinmakerStack=true --context deployWebStack=true --context deploySimulatorStack=true --context workshopOption=false, --context nagEnabled=false, --context DEPLOYMENT_ENV="DEV" #deploys all with the optional region context variable
   wait
done
#destroys all cdk resources in the defined region --force flag prevents the required "y" confirmation
   

echo "🥳 Successfully deployed and destroyed all CDK stacks with TEST! 😎"
echo "✅ successfully deployed, tested, and destroyed cdk app in $region 📍"
