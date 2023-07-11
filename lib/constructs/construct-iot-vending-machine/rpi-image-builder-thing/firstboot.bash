#!/bin/bash

error_exit()
{
    echo "Error: $1"
    exit 1
}

touch /etc/energykit-embedded/logs/provision-setup.log

echo '######################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '########## RESET NAMESERVER ##########' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '######################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
sudo echo "static domain_name_servers=8.8.4.4 8.8.8.8" >> /etc/dhcpcd.conf 
sudo cat /etc/dhcpcd.conf >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

PI_SN=$(cat /sys/firmware/devicetree/base/serial-number)
wait
BASE_NAME="turbine"
wait
NEW_NAME="$BASE_NAME-$PI_SN"
echo $NEW_NAME >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
wait
sudo chmod 777 /etc/hostname >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
wait
sudo echo $NEW_NAME > /etc/hostname
wait
sudo sed -i "s/raspberrypi/$NEW_NAME/g" /etc/hosts
wait
sudo hostname $NEW_NAME
wait
echo "updated hostname to $NEW_NAME"
echo $HOSTNAME
wait
sleep 10

echo '#############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## CONFIRM HOSTNAME UPDATE ##################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '#############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

counter=0
until [ "$HOSTNAME" = "$NEW_NAME" ]
do
    echo "Waiting to confirm hostname change..." >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
    sleep 1
    if [[ $counter -eq 5 ]]
    then
    
        ##   terminates the loop.
        break
    fi
    echo "$counter"
    ((counter++))
    echo $counter >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
done

echo '#############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## CONFIRM DNS RESOLUTION ###################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '#############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

IOT_ENDPOINT=$(sed -nr "/^\[SETTINGS\]/ { :l /^IOT_ENDPOINT[ ]*=/ { s/[^=]*=[ ]*//; p; q;}; n; b l;}" /etc/aws-iot-fleet-provisioning/config.ini)

echo IOT_ENDPOINT >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

host $IOT_ENDPOINT >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

counter=0
until host $IOT_ENDPOINT
do
    echo "Waiting to confirm DNS resolution..." >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
    sleep 1
    if [[ $counter -eq 30 ]]
    then
    
        ##   terminates the loop.
        break
    fi
    echo "$counter"
    ((counter++))
    echo $counter >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
done

sleep 10

cd /etc/aws-iot-fleet-provisioning

echo '#############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## PROVISION DEVICE BY CLAIM ################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '#############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

if sudo python3 main.py "${NEW_NAME}" >> /etc/energykit-embedded/logs/provision-setup.log 2>&1; then
    sudo chmod 777 /etc/energykit-embedded/certs/claim-certificate.pem.crt
    sudo chmod 777 /etc/energykit-embedded/certs/claim-private.pem.key
    echo '##############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
    echo '################## MOVE CERTS FOR ONGOING USE ################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
    echo '##############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
    # store iot certificates
    sudo mkdir /etc/energykit-embedded/certs
    sudo mv ./certs/* /etc/energykit-embedded/certs/
    echo "Successfully completed provisioning of $NEW_NAME" >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
    sleep 1

    echo '#############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
    echo '################## MOVE CLAIM CERTIFICATES ##################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
    echo '#############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
    sudo mv /etc/energykit-embedded/certs/claim-certificate.pem.crt /etc/aws-iot-fleet-provisioning/certs
    wait
    sleep 1
    sudo mv /etc/energykit-embedded/certs/claim-private.pem.key /etc/aws-iot-fleet-provisioning/certs
    wait
    sleep 1
else
    echo "failed to successfully provision" >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
fi



echo '#################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## GENERATE TURBINE CONFIG ######################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '#################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo chmod +x /etc/energykit-embedded/embedded/utils/setup_sensorconfig.py
sudo chmod 777 /etc/energykit-embedded/embedded/utils
sudo python3 /etc/energykit-embedded/embedded/utils/setup_sensorconfig.py

echo '#################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## ENABLE PUBSUB ON STARTUP #####################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '#################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo chmod 777 /lib/systemd/system/

echo '################################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## CREATE PUBSUB SCRIPT WITH NO LOGGING ########################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo chmod 777 ./

sudo echo "
[Unit]
Description= publish and subscribe to AWS IoT MQTT messages
After=network.target

[Service]
Type=idle
RemainAfterExit=yes
ExecStart=/usr/bin/python3 /etc/energykit-embedded/energykit_run_telemetry.py
Restart=always
RestartSec=10s
KillMode=process
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
" > ./awsiotpubsub.service
wait

echo '##############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## CAT PUBSUB SCRIPT ########################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '##############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo cat ./awsiotpubsub.service >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

echo '##############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## MOVE PUBSUB SCRIPT ########################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '##############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo mv ./awsiotpubsub.service /lib/systemd/system >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

echo '##############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## CAT MOVED SCRIPT ##########################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '##############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo cat /lib/systemd/system/awsiotpubsub.service >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

echo '#################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## RELOAD MOVED SCRIPT ##########################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '#################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo systemctl daemon-reload >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
wait 5

echo '#################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## INSTALL AND SET UP RASPI BLINKA ##############' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '#################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

## cd /etc/energykit-embedded/setup
## echo n | sudo python3 raspi-blinka.py
## wait
## sleep 1
## cd -

echo '#################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## ENABLE I2C ##################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '#################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo raspi-config nonint do_i2c 0 >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

echo '#################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## ENABLE I2C ##################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '#################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo sh /etc/energykit-embedded/setup/i2c-setup.sh >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

echo '#################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## TEST AND DETECT I2C SENSORS ##################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '#################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo i2cdetect -y 1 >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

echo '##################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## ENABLE PUBSUB SCRIPT ##########################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '##################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo systemctl enable awsiotpubsub.service >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

echo '########################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## CHECK PUBSUB SCRIPT STATUS ##########################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '########################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo systemctl status awsiotpubsub >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo systemctl start awsiotpubsub >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
wait 5

echo '#############################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## CHECK PUBSUB SCRIPT AFTER START ##########################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '#############################################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo systemctl status awsiotpubsub >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

echo '##############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '################## RESTART SYSTEM!!!!!!! #####################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '##############################################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

sudo shutdown -r 1 "reboot in 1 minute" >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
