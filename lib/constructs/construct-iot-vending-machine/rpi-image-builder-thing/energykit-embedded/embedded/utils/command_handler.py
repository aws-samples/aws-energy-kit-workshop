import random
import threading
import os
import json
from . import turbine_motor_run
import logging

with open(os.path.join(os.path.dirname(__file__), 'config.json'), "r") as f:
    config = json.load(f)

logging.basicConfig(filename='/etc/energykit-embedded/logs/pubsub.log', encoding='utf-8', level=logging.DEBUG, format="%(levelname)s | %(asctime)s | %(message)s")


def handleCommand(payload):
    '''
    Handles an incoming command triggered by an MQTT payload

            Parameters:
                    payload (string): A JSON object formatted as a string
                            simulate (string): 0 or 1
                            anomaly (string): True or False
            Evaluations:
                    1. evaluates whether payload complies to required inputs
            Actions:
                    1. Sets throttle
                    2. Sets rpm as environmental variable
                    3. Runs turbine motors with or without simulated anomaly       
            Exceptions:
                    handles any stdout or stderr messages and logs that using debug
                    errors will occur if there are any errors running motors    
            Returns:
                    None
    '''
    try:
        print("Command received!")
        rpm_rating = config["rpm_rating"]
        throttle = 0.5
        rpm = int(throttle * rpm_rating)
        os.environ["RPM"] = str(rpm)
        if "msg" in payload:
            payload = payload['msg']
        if "simulate" in payload:
            if payload["simulate"] == 0:
                print("Shutting off!")
                shutoff = threading.Thread(target=turbine_motor_run.turbine_motor_shutoff(1))
                print("Shutting off start")
                shutoff.start()
            elif payload["simulate"] == 1:
                if "anomaly" in payload and payload["anomaly"] == 'True':
                    anomaly = True
                    motor = threading.Thread(target=turbine_motor_run.turbine_motor_run, args=(anomaly,throttle,))
                    motor.start()
                else:
                    anomaly = False
                    motor = threading.Thread(target=turbine_motor_run.turbine_motor_run, args=(anomaly,throttle,))
                    motor.start()
            else:
                error = (f'The following payload does not correspond with a command \n {payload}')
                logging.error(error, exc_info=True)
        else:
            error = (f'The following payload does not correspond with a command \n {payload}')
            logging.error(error, exc_info=True)
    except Exception as error:
        logging.error(error, exc_info=True)