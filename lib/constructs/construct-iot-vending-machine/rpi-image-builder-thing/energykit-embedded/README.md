# EnergyKit Embedded Demo Software

## Summary

This embedded python software package includes scripts for managing sensors and actuators, and connecting with AWS IoT Services.

## 📚 What is included?

This package includes:

1. Sensor scripts to collect sensor data
2. Actuator scripts to turn motors and vibration motors on and off
3. Utility scripts
4. Demo Scripts to demo the components
5. Test Scripts to test on setup
6. Setup Scripts to automate setup
7. AWS IoT Scripts for connecting to IoT Core and IoT Greengrass
8. Dependencies such as AWS IoT Device SDK for Python v2

## 🏛️ Architecture



## 🛠 How to set up this software

### 0/ Recommended: Code Pipeline Build

The simplest way to use this package is by automating build and setup through the EnergyKit Vending machine. This allows you to build all dependencies and setup scripts into an automated startup process that lets you provision devices and all associated software on first startup. Please review the [EnergyKit main documentation](../../../../../README.md) for more on this process.

### 1/ Run setup.sh

Run the `setup.sh` script to install all dependencies and packages. Note that you will only need to do this if you set up the script manually. We recommend automating this process using a `firstboot.sh` script and as part of the EneryKit IoT vending machine package we have provided the needed scripts.

```sh
sh setup.sh # you may have to run this with sudo
```

### 2/ Run the local test script

To make sure that all sensors are sensing and all actuators are working run the local test script. This will do the following:
    - Make sure all your i2c devices are properly configured at the right addresses
    - Test all sensors and write sensor readings to a log file and the console
    - Test all actuators and write all actuator test outputs to a log file

```sh
python3 energykit_test.py
```

If the script is successful you should see the following message:

```sh
Success! All sensors are configured, connected, and set up for the correct i2c addresses 
Success! Sensors are taking readings and the readings can be read and published
Success! You motors and actuators are all working. You should have seen them in action.
Success! All local tests have passed. This EnergyKit embedded device is functioning locally
Next up... time to run your connected tests...
```

### 3/ Run the connected test script

__WIP - this has not yet been implemented__

To make sure your device is connected, has an IP address, and can communicate with your local network and the AWS Cloud IoT Services run the connected test script. This will do the following:
    - Check that you your `etc/certs` directory has AWS IoT Core certs in it
    - Check that you can communicate with your local network
    - Check that you can communicate with AWS IoT Core
    - Send a "hello world" message via MQTT to AWS IoT Core at the `energy-kit/embedded/hello-world` topic
    - Write all outputs to a local log file
    - Write all outputs to the local console

```sh
python3 energykit_connect_test.py
```

If the script is successful you should see the following message:

```sh
Success! Found your AWS IoT Certs and they are active!
Success! You are connected to a local network and your IP address is: <ip-address>
Success! You are connected to the internet and you can communicate with AWS IoT Core
Success! You have sent a "hello world" message to the AWS IoT Core service at the address `energy-kit/embedded/hello-world` topic
Success! You can connect and communicate with a local AWS IoT Greengrass Core Device
Success! All connected tests have passed. This EnergyKit embedded device is connected and ready to go!
```
# What it doe


## 🚀 How to use this software

### 1/ Plug in and set up wifi network

Your wifi network will need to match what you have provided in your build script.

## 2/ Plug in the Greengrass Core Device

- Make sure it powers on
- Check that it is connected to AWS IoT Core. The status should show updated within the last few minutes. Note that “healthy” does not mean it’s connected. It just means the deployment is not broken.
  - If you do not see it connecting:
          1. Log in to the GLInet Wifi Router: 192.168.1 pw EnergyDemo
          2. Click on “clients” → you should see a device with energykit-ggcd...
          3. If device is connected to wifi but not to AWS this is likely a network issue and may mean the network you are bridging into is blocking port 8443
          4. If this is the case we recommend using a wifi hotspot and operating the GLI router in bridge mode (<https://docs.gl-inet.com/en/3/tutorials/setup_the_router_as_a_bridge/>)
  - If you need to connect to the Greengrass Core Device for troubleshooting or to make changes...
        1. ssh greengrass@<core-device-thing-name>.lan
        2. password EnergyDemo
        3. sudo tail -f /greengrass/v2/logs/greengrass.log
        4. Send this log to the EnergyKit group #energykit-interest and tag @sambiddl
  - As long as the device shows that the deployment is “healthy” your devices will be able to authenticate

### 3/ Connect to the Turbines (Greengrass Client Devices)

- Check that the IoT Things are connecting in the IoT Core Console Page
- Check that the turbines are sending MQTT data to IoT Core with the MQTT Test Client
        1. [Visit MQTT Test Client](https://eu-west-1.console.aws.amazon.com/iot/home?region=eu-west-1#/test) in your region
        2. Subscribe to `energykit/wind/telemetry/+`
        3. You will see data coming in from the simulator, but you should also see data coming in from the physical turbines. They each have unique thing-names that do not include “simulator” in the title. You will also see the same thingnames on your wifi network if you look in the GLInet console
        4. If you do not see data coming from these turbines
  - `ssh turbine@<thing-name>.lan`
  
### 4/ Test Turbine Communication

1. Start with Anomaly (switch true/false to turn vibration anomaly on/off)
2. Publish to energykit/wind/command/all/simulate

   ``` json
    {
        "simulate": 1,
        "anomaly": "True"
    }
    ```

    ``` json
    {
        "simulate": 0,
        "anomaly": "True"
    }
    ```
             

## 🙀 Troubleshooting Tips and FAQ&A

### A/ Turbines do not connect via MQTT and successfully send data

Diagnosis

1. ssh into greengrass core device and tail logs using these steps:
    1. Connect to AWSeuFieldDemo (or LAN used by devices if different)
    2. ssh greengrass@<core-device-thing-name> and/or IP address if router does not resolve local hostnames
    3. password EnergyDemo
    4. sudo tail -f /greengrass/v2/logs/greengrass.log
2. Keep this terminal open while you do the following…
3. Turn each turbine off, then on. If any logs come up in Greengrass please review github issues to see if another similar issue has come up and been resolved. If you cannot find a resolution there please post an issue with as much detail as you can.
4. ssh into each turbine using these steps
    1. Connect to AWSeuFieldDemo (or LAN used by devices if different)
    2. Check your turbine thing-names in the AWS console or on your local network. The physical turbines are the things that begin with turbine-.... and DO NOT have the term “simulator“ in them
    3. ssh turbine@<turbine-thing-name> and/or IP address if router does not resolve local hostnames
    4. password EnergyDemo
5. Check turbine setup and pubsub logs
    1. sudo cat /etc/energykit-embedded/logs/provision-setup.log
    2. sudo tail -f /etc/energykit-embedded/logs/provision-setup.log
    3. sudo cat /etc/energykit-embedded/logs/pubsub.log
    4. sudo tail -f /etc/energykit-embedded/logs/pubsub.log
    5. Send these logs to the EnergyKit group #energykit-interest and tag @sambiddl
6. Check status of systemctl startup script
    1. sudo systemctl status awsiotpubsub
    2. sudo cat /etc/systemd/system/awsiotpubsub.service
7. check the status of systemctl script

### B/ Startup Pubsub Script is Masked

The cause of this issue is currently unknown but it can be solved by simply manually creating a new startup script following the commands below.

To test communication run the telemetry script, but first make sure:

* The greengrass core device is online and connected
* SSH into the device and tail the logs so that you can see what is going on
* SSH into each each turbine and execute the following command...

python3 /etc/energykit-embedded/energykit_run_telemetry.py
#you may have to use chmod +x /etc/energykit-embedded/energykit_run_telemetry.py if you get a permission error

As a result of this action you should see that each device connects and authenticates with your greengrass core device in the greengrass logs. You should also see each device sending mqtt messages and printing them to the console that you are sshed into. If you receive any errors in this process it is likely because a sensor is not connected. If you receive any errors please copy/paste the terminal output and send to #energykit-interest and tag @sambiddl

To permanently replace the startup scrip SSH into each turbine and execute the following commands...


sudo systemctl daemon-reload

sudo echo "
[Unit]
Description=awsiotpubsub Service
After=network.target
[Service]
Type=idle
User=turbine
ExecStart=/usr/bin/python3 /etc/energykit-embedded/energykit_run_telemetry.py
Restart=always
[Install]
WantedBy=multi-user.target
" > /lib/systemd/system/awsiotpubsub.service 
sudo systemctl enable energykitiotpubsub.service 
sudo systemctl daemon-reload

Reboot the rasperry pi by either unplugging it and plugging back in or by entering sudo reboot in the terminal window

The expected behavior now is that each turbine should automatically connect to Greengrass core via client auth, send mqtt messages, and respond to mqtt commands.