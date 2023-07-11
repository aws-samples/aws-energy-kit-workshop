import json
import logging
import sys
import boto3
import os
from time import sleep


# Configure logging
logger = logging.getLogger()

for h in logger.handlers:
    logger.removeHandler(h)
h = logging.StreamHandler(sys.stdout)

FORMAT = "[%(asctime)s - %(levelname)s - %(filename)s:%(lineno)s - %(funcName)s - %(message)s"
h.setFormatter(logging.Formatter(FORMAT))

logger.addHandler(h)
logger.setLevel(logging.INFO)

def generate_onboarding_message(thing_name):
    return f'{thing_name} has been onboarded to EnergyKit! Asset has been associated with Greengrass core device and Sitewise asset models have been associated and enabled. You are ready to start collecting data!'

def send_sns(thing_name, message):
    client = boto3.client("sns")
    response = client.publish(
        TopicArn=os.environ["SNS_TOPIC"],
        Message=message, 
        Subject=f"{thing_name} onboarded!"
        )
    logger.info(response)
    return response

base_property_alias = 'energykit/wind/telemetry'

def check_asset_active(assetId):
    client = boto3.client('iotsitewise')
    response = client.describe_asset(
        assetId=assetId
        )

    logging.info(response)
    logging.info(response['assetStatus']['state'])
    return response['assetStatus']['state']

def get_asset_properties(assetId):
    client = boto3.client('iotsitewise')
    response = client.describe_asset(
        assetId=assetId
        )
    logging.info(response)
    return response['assetProperties']


def update_sitewise_asset_properties(assetId, assetName):
    client = boto3.client('iotsitewise')
    logging.info(f"The asset id we're trying to update is: {assetId}")
    assetProperties = get_asset_properties(assetId)
    logging.info(f"The asset properties are: {assetProperties}")
    for asset in assetProperties:
        id = asset["id"]
        logger.info(f"The id within the loop is: {id}")
        property_name = asset["name"]
        response = client.update_asset_property(
            assetId=assetId,
            propertyId=id,
            propertyAlias=f'{base_property_alias}/{assetName}/{property_name}',
            propertyNotificationState='ENABLED'
        )
        logger.info(response)
    return "Done!"

def onboard_sitewise_asset(thing_name):
    client = boto3.client('iotsitewise')
    response = client.create_asset(
        assetName=thing_name,
        assetModelId=os.environ["SITEWISE_ASSET_MODEL_ID"],
        tags={"energyAsset": "turbine"}
    )
    assetId = response["assetId"]
    logger.info(response)
    sleep(10)
    iterator = 0
    while iterator <= 4:
        activeAssetId = check_asset_active(assetId)
        if activeAssetId == 'ACTIVE':
            break
        else:
            sleep(10)
        iterator += 1
    updatedAsset = update_sitewise_asset_properties(assetId, thing_name)
    logger.info(updatedAsset)
    return response


def add_twinmaker_asset_to_scene(thing_name, thing_type):
    # get S3 bucket object
    # turn into json
    # modify
    # calculate grid placement
    # add Twinmaker model to scene
    # add entity and component stuff
    print("Adding asset to scene")
    return


def get_greengrass_names(group_arn):
    client = boto3.client('greengrassv2')
    response = client.list_core_devices(
        thingGroupArn=group_arn,
        status='HEALTHY',
        maxResults=5,
        nextToken='string'
    )
    logger.info(response)
    return response


def associate_thing_with_greengrass_group(thing_name):
    client = boto3.client('greengrassv2')
    logger.info(f'Thing group ARN is {os.environ["GGCD_GROUP_ARN"]}')
    core_devices = get_greengrass_names(os.environ["GGCD_GROUP_ARN"])
    logger.info(core_devices)
    associated_devices = []
    core_device_list = core_devices['coreDevices']
    if len(core_device_list) > 0:
        for device in core_device_list:
            logger.info(device)
            logger.info(device['coreDeviceThingName'])
            associated_device = client.batch_associate_client_device_with_core_device(
                entries=[
                    {
                        'thingName': f'{thing_name}'
                    },
                    ],
                    coreDeviceThingName=device['coreDeviceThingName']
        )
            associated_devices.append(associated_device)
        return associated_devices
    else:
        return True
        

def trigger_onboarding(thing_name):
    logger.info("Associating client device")
    associate = associate_thing_with_greengrass_group(thing_name)
    logger.info(associate)
    logger.info("Adding sitewise asset")
    onboard = onboard_sitewise_asset(thing_name)
    logger.info(onboard)
    logger.info("Adding twinmaker model")
    logger.info("Registering with Dynamo DB table")
    logger.info("Sending SNS notification")
    send_sns(thing_name, generate_onboarding_message(thing_name))
    return True


def on_event(event, context):
    logger.info("event: {}".format(json.dumps(event, indent=2)))
    thing_name = event["thingName"]
    logger.info(thing_name)
    try:
        response = trigger_onboarding(thing_name)
        logger.info(response)
    except Exception as error:
        logger.exception(error)
        response = {
            'status': 500,
            'error': {
                'type': type(error).__name__,
                'description': str(error),
            },
        }
    finally:
        return response

