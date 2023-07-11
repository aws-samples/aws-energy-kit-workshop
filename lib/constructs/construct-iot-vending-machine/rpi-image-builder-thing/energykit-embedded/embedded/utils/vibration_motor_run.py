import time
import board
import busio
import random
import os
import json

import adafruit_drv2605

# diagram is here https://learn.adafruit.com/assets/59463

# Initialize I2C bus and DRV2605 module.
i2c = busio.I2C(board.SCL, board.SDA) 
drv = adafruit_drv2605.DRV2605(i2c)

# Main loop runs forever trying each effect (1-123).
# See table 11.2 in the datasheet for a list of all the effect names and IDs.
#   http://www.ti.com/lit/ds/symlink/drv2605.pdf
def periodic_random(duration, frequency):
    total_time = 0
    range_marker = round(duration/frequency)
    while total_time < duration:
        effect_id = random.randint(0,120)
        period = random.randint(1,range_marker)
        time.sleep(period)
        drv.sequence[0] = adafruit_drv2605.Effect(effect_id)  # Set the effect on slot 0.
            # You can assign effects to up to 7 different slots to combine
            # them in interesting ways. Index the sequence property with a
            # slot number 0 to 6.
            # Optionally, you can assign a pause to a slot. E.g.
            # drv.sequence[1] = adafruit_drv2605.Pause(0.5)  # Pause for half a second
        drv.play()  # play the effect
        time.sleep(1)
        drv.stop()  # and then stop (if it's still running)
        total_time += period
    drv.stop()

def stop_vibration():
    drv.stop()

# To Do - 
def vibration_anomaly(count):
    effect_count = 0
    while effect_count < count:
        effect_id = random.randint(0,123)
        drv.sequence[0] = adafruit_drv2605.Effect(effect_id)  # Set the effect on slot 0.
        # You can assign effects to up to 7 different slots to combine
        # them in interesting ways. Index the sequence property with a
        # slot number 0 to 6.
        # Optionally, you can assign a pause to a slot. E.g.
        # drv.sequence[1] = adafruit_drv2605.Pause(0.5)  # Pause for half a second
        drv.play()  # play the effect
        sleep_time = round(random.uniform(0.5,10), 2)
        
        time.sleep(sleep_time)  # for 0.5 seconds
        drv.stop()  # and then stop (if it's still running)
        
        # Increment effect ID and wrap back around to 1.
        effect_count += 1