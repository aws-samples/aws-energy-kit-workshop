from __future__ import print_function
import time
import sys
import math
import qwiic_scmd
import random
from itertools import cycle, islice
import threading
import json
import os
import logging

with open(os.path.join(os.path.dirname(__file__), 'config.json'), "r") as f:
    config = json.load(f)
    
logging.basicConfig(filename='/etc/energykit-embedded/logs/pubsub.log', encoding='utf-8', level=logging.DEBUG, format="%(levelname)s | %(asctime)s | %(message)s")

myMotor = qwiic_scmd.QwiicScmd()
max_drive_strength = 255
unit_drive_strength = 255/100
R_MTR = 0
L_MTR = 1
FWD = 0
BWD = 1

def runMotor(throttle):
    if myMotor.connected == False:
        print("Motor Driver not connected. Check connections.", file=sys.stderr)
        return
    
    myMotor.begin()
    print(f"Motor running at {throttle*100}% throttle")
    time.sleep(.05)

    # Zero Motor Speeds
    myMotor.set_drive(0,0,0)
    myMotor.set_drive(1,0,0)
    speed = throttle * max_drive_strength
    myMotor.enable()
    myMotor.set_drive(R_MTR,FWD,speed)



def curve_vibration():
    if myMotor.connected == False:
        print("Motor Driver not connected. Check connections.",\
        file=sys.stderr)
        return
    else:
        vibration_speed = 20
        for vibration_speed in range(20,255):
            myMotor.set_drive(L_MTR,FWD,vibration_speed)
            time.sleep(random.uniform(0.1,5))
            myMotor.set_drive(L_MTR,random.choice([FWD,BWD]),0)
        for vibration_speed in range(254,20, -1):
            myMotor.set_drive(L_MTR,FWD,vibration_speed)
            time.sleep(random.uniform(0.1,5))
            myMotor.set_drive(L_MTR,random.choice([FWD,BWD]),0)
            


def steady_vibration():
    if myMotor.connected == False:
        print("Motor Driver not connected. Check connections.",\
        file=sys.stderr)
        return
    else:
        vibration_speed = random.choice([0,10,20,30,40,50])
        myMotor.set_drive(L_MTR,FWD,vibration_speed)


def spiky_vibration():
    if myMotor.connected == False:
        print("Motor Driver not connected. Check connections.",\
        file=sys.stderr)
        return
    else:
        start = 0
        vibration_speed = random.choice([10,100,40,20,30,50,60,70,80,90])
        myMotor.set_drive(L_MTR,random.choice([FWD,BWD]),vibration_speed)
        time.sleep(random.uniform(1,5))
        myMotor.set_drive(L_MTR,random.choice([FWD,BWD]),0)


def random_vibration():
    if myMotor.connected == False:
        print("Motor Driver not connected. Check connections.",\
        file=sys.stderr)
        return
    else:
        myMotor.set_drive(L_MTR,random.choice([FWD,BWD]),random.randint(10,255))
        time.sleep(random.uniform(0.1,10))
        myMotor.set_drive(L_MTR,random.choice([FWD,BWD]),0)


def stop_vibration():
    if myMotor.connected == False:
        print("Motor Driver not connected. Check connections.",\
        file=sys.stderr)
        return
    else:
        myMotor.set_drive(L_MTR,FWD,0)
        print("vibration stopped")
        return


def turbine_motor_shutoff(time_to_shutoff):
    time.sleep(time_to_shutoff)
    print("\nTurbine stopped")
    myMotor.disable()
    os.environ["RPM"] = "0"
    print("  throttle:", 0)
    print("\nStopped Vibration Simulator\n")
    print("  vibration:", 0)
    return


def vibration_motor_run(duration, vibration_type):
    if vibration_type == "curve":
        curve_vibration()
    if vibration_type == "steady":
        steady_vibration()
    if vibration_type == "spiky":
        spiky_vibration()
    if vibration_type == "random":
        random_vibration()
    print(f"Beginning {vibration_type} vibration")
    time.sleep(period)
    stop_vibration()
    return


def turbine_motor_run(anomaly: bool, throttle, anomaly_detection_shutoff_seconds=360):
    '''
    Runs turbine motors

            Parameters:
                    anomaly (bool): Assigns a vibration anomaly to the simulation loop      
            Exceptions:
                    keyboard interrupt: if any keys are pressed manually the motor will stop
                    exceptions: logs full debug output to log file if there is an exception caused by any issues with turbine motor 
            Returns:
                    None
    '''
    rpm_rating = config["rpm_rating"]
    rpm = throttle * rpm_rating
    print(f'Throttle is: {throttle}')
    windspeed = round(pow(rpm,1/2),2)
    print("***Starting Turbine***")
    print(f"Turbine start at {rpm} RPM, simulating windspeed of {windspeed} m/s")
    try:
        try:
            run_motor = threading.Thread(target=runMotor(throttle))
            run_motor.start()
            if anomaly == True:
                print("Get ready for anomoly...")
                sleep = random.randint(60,90)
                print(f"Anomoly will be triggered after {sleep} seconds")
                time.sleep(sleep)
                vibration_duration = random.randint(30,120)
                vibration_type = random.choice(["random","curve", "steady", "spiky"])
                print(f"Get ready for {vibration_type} vibration...")
                vibrate = threading.Thread(target = vibration_motor_run, args= (vibration_duration, vibration_type,))
                vibrate.start()
                print(f"Get ready for {vibration_type} vibration...")
                turbine_motor_shutoff(anomaly_detection_shutoff_seconds)
            else:
                turbine_motor_shutoff(anomaly_detection_shutoff_seconds) 
        except (KeyboardInterrupt, SystemExit) as exErr:
            print("Motor manually interrupted.")
            myMotor.disable()
            sys.exit(0)
    except Exception as error:
        logging.error(error, exc_info=True)