import datetime
import time
import json
import os

import random

import json

with open(os.path.join(os.path.dirname(__file__), 'config.json'), "r") as f:
    config = json.load(f)

def read_sensors_synthetic(throttle):
    timestamp = (datetime.datetime.now()).strftime("%Y-%m-%d %H:%M:%S")
    temp = random.randrange(2, 20)
    humidity = random.randrange(2, 20)
    pressure = random.randrange(2, 20)
    altitude = random.randrange(2, 20)
    current = (config["current_rating"])*0.05
    voltage = (config["current_rating"])*0.05
    power = current*voltage
    rpm = throttle * config["rpm_rating"]
    turbine_reading = {
            'sensorTimestamp': str(timestamp),
            "assetId": config["thing_name"],
            'temp': temp,
            'pressure': pressure,
            'humidity': humidity,
            'altitude': altitude,
            'current': current,
            'voltage': 15,
            'power': power,
            'rpm': rpm,
            'gearboxVibration': random.randrange(2, 20),
            "city": config["location"],
            "country": "United States",
            "countryCode": "US",
            "zip": "N/A",
            "lat": config["lat"],
            "long": config["long"],
            "region": config["location"],
            "status": "active",
            "lastMaintenance": config["last_maintenance"]
                        }
    return turbine_reading