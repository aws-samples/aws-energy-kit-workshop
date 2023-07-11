import time
import board
import busio
import adafruit_lis3dh
import math
import datetime

i2c = board.I2C()  # uses board.SCL and board.SDA
lis3dh = adafruit_lis3dh.LIS3DH_I2C(i2c, address=0x18)

# Set range of accelerometer (can be RANGE_2_G, RANGE_4_G, RANGE_8_G or RANGE_16_G).
lis3dh.range = adafruit_lis3dh.RANGE_2_G

def sense_change_vibration(period, rate):
    # Loop forever printing accelerometer values
    vibration_list = []
    interval = period/rate
    count = 0
    while count <= period:
        # Read accelerometer values (in m / s ^ 2).  Returns a 3-tuple of x, y,
        # z axis values.  Divide them by 9.806 to convert to Gs.
        x, y, z = [
            value / adafruit_lis3dh.STANDARD_GRAVITY for value in lis3dh.acceleration
        ]
        meanSquares = (math.pow(x,2) + math.pow(y,2) + math.pow(z,2)) / 3
        rmsAcceleration = math.pow(meanSquares,1/2)
        vibration_list.append(rmsAcceleration)
        # Small delay to keep things responsive but give time for interrupt processing.
        time.sleep(interval)
        count += period
    return vibration_list

def sense_single_vibration():
    x, y, z = [
        value / adafruit_lis3dh.STANDARD_GRAVITY for value in lis3dh.acceleration
    ]
    print(x, y, z)
    return (x, y, z)

def calc_rmsAcceleration(data):
    square_sum = 0
    for item in data:
        square_sum += (math.pow(item, 2))
    rms = math.pow((square_sum/len(data)), 1/2)
    return rms

def calc_accelerationAbsMin(data):
    return abs(min(data))

def calc_accelerationAbsMax(data):
    return abs(max(data))

def vibration_output(period,sample_rate):
    start_time = time.time()
    data = sense_change_vibration(period,sample_rate)
    reading = {
        "rmsAcceleration": calc_rmsAcceleration(data),
        "accelerationAbsMin": calc_accelerationAbsMin(data),
        "accelerationAbsMax": calc_accelerationAbsMax(data)
    }
    return reading
