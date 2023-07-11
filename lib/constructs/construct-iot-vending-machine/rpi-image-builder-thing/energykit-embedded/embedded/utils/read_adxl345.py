# be sure to install sudo pip3 install adafruit-circuitpython-adxl34x
import time
import board
import adafruit_adxl34x

i2c = board.I2C()  # uses board.SCL and board.SDA

# For ADXL343
accelerometer = adafruit_adxl34x.ADXL343(i2c)
# For ADXL345
# accelerometer = adafruit_adxl34x.ADXL345(i2c)
def acceleration_test():
    while True:
        print("%f %f %f" % accelerometer.acceleration)
        time.sleep(0.1)

def read_acceleration():
    return accelerometer.acceleration[2]