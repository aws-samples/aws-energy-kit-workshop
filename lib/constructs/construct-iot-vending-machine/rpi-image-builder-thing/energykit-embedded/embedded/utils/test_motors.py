#!/usr/bin/env python3
from time import sleep
import os
import json
from . import turbine_motor_run

'''
This test module runs some basic tests to make sure all the motors are working
You can run the module from the command line by running python3 sensor-pi-demo/testsensors.py
'''


def run_test():
    '''
    Runs basic tests
    '''
    print("Testing turbine motor. Get ready!")
    print("If this works the motor should run a series of tests.")
    print("####################### BEGIN TEST #######################")

    # test the motor for a brief moment
    print("Testing a single reading output.")
    print("This function uses the readsensors module and calls the read_sensors() function.")
    print("The only required input for this function is the throttle of the motor.")
    print("If it works as expected it will write a single reading as a dictionary to the console.")
    turbine_motor_run.turbine_motor_run("True", 0.5, 60)
    sleep(10)
    turbine_motor_run.turbine_motor_shutoff(3)
    print("Success! It worked!")

    # test a series of sensor readings
    print("Now let's run it a couple different ways...")

    turbine_motor_run.turbine_motor_run("False", 0.75, 10)
    sleep(5)
    turbine_motor_run.turbine_motor_shutoff(4)
    sleep(5)
    turbine_motor_run.turbine_motor_run("False", 0.6, 10)
    sleep(5)
    turbine_motor_run.turbine_motor_shutoff(4)
    turbine_motor_run.turbine_motor_run("False", 0.25, 10)
    sleep(5)
    turbine_motor_run.turbine_motor_shutoff(4)
    sleep(5)

    print("Completed tests!")
    print("####################### END TEST #######################")
