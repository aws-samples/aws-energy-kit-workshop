import json
import logging
import sys
import boto3
import os

# Configure logging
logger = logging.getLogger()

for h in logger.handlers:
    logger.removeHandler(h)
h = logging.StreamHandler(sys.stdout)

FORMAT = "[%(asctime)s - %(levelname)s - %(filename)s:%(lineno)s - %(funcName)s - %(message)s"
h.setFormatter(logging.Formatter(FORMAT))

logger.addHandler(h)
logger.setLevel(logging.INFO)

THINGNAME_STARTSWITH = "energykit"

def verify_serial(thing_name):
    if thing_name.startswith(THINGNAME_STARTSWITH):
        logger.info("greengrass core device {} verification succeeded - starts with {}".format(thing_name, THINGNAME_STARTSWITH))
        return True
    
    logger.error("core device {} verification failed - does not start with {}".format(thing_name, THINGNAME_STARTSWITH))
    return False

def generate_onboarding_message(thing_name):
    return f'{thing_name} has been onboarded as a AWS IoT Greengrass Core Device to EnergyKit!'

def send_sns(thing_name, message):
    client = boto3.client("sns")
    response = client.publish(
        TopicArn=os.environ["SNS_TOPIC"], Message=message, Subject=thing_name)
    logger.info(response)
    return response

def trigger_onboarding(thing_name):
    logger.info("Associating client device")
    logger.info("Adding sitewise asset")
    logger.info("Adding twinmaker model")
    logger.info("Registering with Dynamo DB table")
    logger.info("Sending SNS notification")
    send_sns(thing_name, generate_onboarding_message(thing_name))
    return True
    

def on_event(event, context):
    logger.info("event: {}".format(json.dumps(event, indent=2)))

    if not "ThingName" in event["parameters"]:
        logger.error("ThingName not provided")
        send_sns("null", "There was no thing name with the provisioning payload, so could not provision a thing!")
        response = {'allowProvisioning': False}
    else:
        thing_name = event["parameters"]["ThingName"]
        trigger_onboarding(thing_name)
        if verify_serial(thing_name):
            response = {'allowProvisioning': True}
    
    logger.info("response: {}".format(response))
    return response