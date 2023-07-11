import time
import board
import adafruit_lis3dh
import argparse
import time
import uuid
import os
import threading
import json
import logging
import time
from . import command_handler

i2c = board.I2C()  # uses board.SCL and board.SDA
lis3dh = adafruit_lis3dh.LIS3DH_I2C(i2c, address=0x18)

# Set range of accelerometer (can be RANGE_2_G, RANGE_4_G, RANGE_8_G or RANGE_16_G).
lis3dh.range = adafruit_lis3dh.RANGE_8_G

# Set tap detection to double taps.  The first parameter is a value:
#  - 0 = Disable tap detection.
#  - 1 = Detect single taps.
#  - 2 = Detect double taps.
# The second parameter is the threshold and a higher value means less sensitive
# tap detection.  Note the threshold should be set based on the range above:
#  - 2G = 40-80 threshold
#  - 4G = 20-40 threshold
#  - 8G = 10-20 threshold
#  - 16G = 5-10 threshold
lis3dh.set_tap(2, 60)


def deploy_run_on_tap():
# Loop forever printing if a double tap is detected.
    while True:
        if lis3dh.tapped:
            payload = {
                "simulate": 1,
                "anomaly": "False",
                # "duration": 10
                }
            print(
                "Turbine start initiated with double tap. Beginning simulation."
                )
            handle_command = threading.Thread(
                target=command_handler.handleCommand(payload), 
                daemon=True
                )
            logging.info("Sent command to command handler")
            handle_command.start()
            handle_command.join()
            time.sleep(0.01)

