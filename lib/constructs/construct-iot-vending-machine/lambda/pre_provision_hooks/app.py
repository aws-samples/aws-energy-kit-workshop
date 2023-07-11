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

THINGNAME_STARTSWITH = "turbine"

def verify_serial(thing_name):
    if thing_name.startswith(THINGNAME_STARTSWITH):
        logger.info("thing_name {} verification succeeded - starts with {}".format(thing_name, THINGNAME_STARTSWITH))
        return True
    
    logger.error("thing_name {} verification failed - does not start with {}".format(thing_name, THINGNAME_STARTSWITH))
    return False

def generate_onboarding_message(thing_name):
    return f'{thing_name} has been onboarded to EnergyKit!'

def send_sns(thing_name, message):
    client = boto3.client("sns")
    response = client.publish(
        TopicArn=os.environ["SNS_TOPIC"],
        Message=message, 
        Subject=f"{thing_name} provisioned!"
        )
    logger.info(response)
    return response

def trigger_onboarding(function_name, thing_name):
    client = boto3.client("lambda")
    payload = json.dumps(
        {"thingName": thing_name}
    )
    response = client.invoke(
        FunctionName=function_name,
        InvocationType='Event',
        LogType='None',
        Payload=payload,
    )
    logger.info(response)
    return response


def on_event(event, context):
    logger.info("event: {}".format(json.dumps(event, indent=2)))

    if "SerialNumber" not in event["parameters"]:
        logger.error("ThingName not provided")
        send_sns("null", "There was no thing name with the provisioning payload, so could not provision a thing!")
        response = {'allowProvisioning': False}
    else:
        thing_name = event["parameters"]["SerialNumber"]
        send_sns(thing_name, f"{thing_name} has been issued a certificate. Now it is moving on to full device onbaording.")
        lambda_name = os.environ["POST_PROVISION_HOOK_LAMBDA_NAME"]
        trigger_onboarding(lambda_name, thing_name)
        if verify_serial(thing_name):
            response = {'allowProvisioning': True}
    
    logger.info("response: {}".format(response))
    return response

