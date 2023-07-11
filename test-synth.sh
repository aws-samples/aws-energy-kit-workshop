#!/bin/bash

# synthesize cdk with context inputs
NEW_CONTEXT=$(jq '.adminEmail = "test@test.com"' cdk.context.template.json)
echo $NEW_CONTEXT > cdk.context.json
cdk synth
rm cdk.context.json