#!/usr/bin/env python3
from time import sleep
from . import readsensors
import os
import json


'''
This test module runs some basic tests to make sure all sensors and actuators are working
You can run the module from the command line by running python3 sensor-pi-demo/testsensors.py
'''


def run_test():
        '''
        This test module runs some basic tests to make sure all sensors and actuators are working
        You can run the module from the command line by running python3 sensor-pi-demo/testsensors.py
        '''
        print("Testing some sensors. Get ready!")
        print("If this works the sensors should produce a series of readings and print them to the console.")
        print("####################### BEGIN TEST #######################")

        # test the sensors once
        print("Testing a single reading output.")
        print("This function uses the read_sensors module and calls the read_sensors() function.")
        print("The only required input for this function is the throttle of the motor.")
        print("If it works as expected it will write a single reading as a dictionary to the console.")
        print(readsensors.read_sensors(0.5))
        print("Success! It worked!")

        # test a series of sensor readings
        print("Now testing a sensor reading by looping through every second for 10 seconds.")

        loop_count = 10
        for x in range(loop_count):
                print(readsensors.read_sensors(0.75))
                sleep(1)
                print("Success!")
        print("That's it! Test is finished!")