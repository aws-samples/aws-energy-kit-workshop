import time
import gpiozero

RELAY_PIN = 24

relay = gpiozero.OutputDevice(RELAY_PIN, active_high=True, initial_value=False)

while True:
    what_to_do = input("on or off? ")
    if what_to_do == "on":
        relay.on()
        "It's on!"
    if what_to_do == "off":
        relay.off()
        "It's off!"