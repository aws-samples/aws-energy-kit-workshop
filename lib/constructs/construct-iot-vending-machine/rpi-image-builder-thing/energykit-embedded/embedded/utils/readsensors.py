import datetime
import time
import json
import board
from adafruit_bme280 import basic as adafruit_bme280
from . import read_lis3dh
import os
import random
import json
import logging

with open(os.path.join(os.path.dirname(__file__), 'config.json'), "r") as f:
    config = json.load(f)

logging.basicConfig(filename='/etc/energykit-embedded/logs/pubsub.log', encoding='utf-8', level=logging.DEBUG, format="%(levelname)s | %(asctime)s | %(message)s")

# Create sensor object, using the board's default I2C bus.
i2c = board.I2C()  # uses board.SCL and board.SDA
bme280 = adafruit_bme280.Adafruit_BME280_I2C(i2c)
# ina260 = adafruit_ina260.INA260(i2c)

# OR create sensor object, using the board's default SPI bus.
# spi = board.SPI()
# bme_cs = digitalio.DigitalInOut(board.D10)
# bme280 = adafruit_bme280.Adafruit_BME280_SPI(spi, bme_cs)

# change this to match the location's pressure (hPa) at sea level
bme280.sea_level_pressure = 1013.25

os.environ["RPM"] = "0"


def read_sensors(throttle):
    '''
    Reads all sensor values

            Parameters:
                    throttle (float): A floating point number between 0.00 and 100.00       
            Exceptions:
                    handles any stdout or stderr messages and logs that using debug
                    errors will be logged if there are any errors reading from sensors
                    with exception this function will log a debug message to the assigned log 
            Returns:
                    turbine_reading (dictionary): a dictionary containing all readings from active sensors
    '''
    try:
        timestamp = (datetime.datetime.now()).strftime("%Y-%m-%d %H:%M:%S")
        temp = round(bme280.temperature, 3)
        humidity = round(bme280.relative_humidity, 3)
        pressure = round(bme280.pressure, 3)
        altitude = round(bme280.altitude, 3)
        current = (config["current_rating"])*0.05
        voltage = (config["current_rating"])*0.05
        power = current*voltage
        vibration_1 = read_lis3dh.vibration_output(1,550)
        rpm = int(os.environ["RPM"])
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
                'gearboxVibration': vibration_1["rmsAcceleration"],
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
    except Exception as error:
        logging.error(error, exc_info=True)
        error_reading = {
            "error": f"ERROR: {logging.error(error, exc_info=True)}"
        }
        return error_reading
    