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

def exception_handler(e):
    # exception to status code mapping goes here...
    status_code = 400
    return {
        'statusCode': status_code,
        'body': json.dumps(str(e))
    }

AWS_REGION = os.environ['AWS_REGION']
MQTT_COMMAND_TOPIC = os.environ['MQTT_COMMAND_TOPIC']

SIMULATE = {"simulate": 1, "anomaly": "True"}

def publish_mqtt(message, topic):
    client = boto3.client('iot-data', region_name=AWS_REGION)
    logger.info(message)

    response = client.publish(
        topic=topic,
        qos=1,
        payload=json.dumps(message)
    )
    print(response)
    return response
    

def on_event(event, context):
    try:
        response = {'allowProvisioning': False}
        logger.info("event: {}".format(json.dumps(event, indent=2)))
        response = publish_mqtt(SIMULATE, MQTT_COMMAND_TOPIC)
        logger.info("response: {}".format(response))
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': "Successfully published a message to simulate turbine without anomaly!"
        }
    except Exception as e:
        logger.error(e)
        return exception_handler(e)