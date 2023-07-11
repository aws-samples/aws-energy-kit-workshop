import boto3
import cmd, sys

print("This tool will search for all active asset models, delete all of their associated assets, and then delete the model. This is a destructive action. BE VERY CAREFUL...")
confirmation = input("Are you sure you want to do this? (Type yes or no) ")
if confirmation == "yes":
    client = boto3.client('iotsitewise')
    asset_models = client.list_asset_models(
        #nextToken='0',
        maxResults=123
    )

    for model in asset_models['assetModelSummaries']:
        model_id = model['id']
        paginator = client.get_paginator('list_assets')
        assets = client.list_assets(
            #nextToken='string',
            maxResults=250,
            assetModelId=model_id,
            filter='ALL'
        )
        print(assets['assetSummaries'])
        #print(assets)
        for asset in assets['assetSummaries']:
            print(asset['id'])
            response = client.delete_asset(
                
                assetId=asset['id'],
                )
            asset_id = asset['id']
            print(f'🗑️ Deleted asset {asset_id}')
        response = client.delete_asset_model(
            assetModelId=model['id'],
            )
        model_id = model['id']
        print(f'🗑️ Deleted asset model {model_id}')
else:
    print("Okay. Good idea to be careful. Consider that action carefully then try again...")
