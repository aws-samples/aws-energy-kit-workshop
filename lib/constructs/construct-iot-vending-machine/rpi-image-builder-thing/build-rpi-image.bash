#!/bin/bash

echo '############################################' 
echo '########## OPEN SSL INSTALL CHECK ##########' 
echo '############################################'

RASPBIAN_DOWNLOAD_FILENAME="raspios.img.xz"
RASPBIAN_SOURCE_URL="https://downloads.raspberrypi.org/raspios_lite_armhf/images/raspios_lite_armhf-2023-02-22/2023-02-21-raspios-bullseye-armhf-lite.img.xz"
RASPBIAN_URL_BASE="https://downloads.raspberrypi.org/raspios_lite_armhf/images/"
SDCARD_MOUNT="/mnt/sdcard"

# Download raspios, unzip it and SHA verify the download
wget $RASPBIAN_SOURCE_URL -O $RASPBIAN_DOWNLOAD_FILENAME
VERSION="$( wget -q $RASPBIAN_URL_BASE -O - | xmllint --html --xmlout --xpath 'string(/html/body/table/tr[last()-1]/td/a/@href)' - )"
RASPBIAN_SOURCE_SHA256_FILE=$( wget -q $RASPBIAN_URL_BASE/$VERSION -O - | xmllint --html --xmlout --xpath 'string(/html/body/table/tr/td/a[contains(@href, "256")])' - )
RASPBIAN_SOURCE_SHA256=$( wget -q "$RASPBIAN_URL_BASE/$VERSION/$RASPBIAN_SOURCE_SHA256_FILE" -O - | awk '{print $1}' )
RASPBIAN_DOWNLOAD_SHA256=$( sha256sum $RASPBIAN_DOWNLOAD_FILENAME |awk '{printf $1}' )
if [ ! -z $RASPBIAN_SOURCE_SHA256 ] && [ "$RASPBIAN_DOWNLOAD_SHA256" != "$RASPBIAN_SOURCE_SHA256" ]; then echo "Build aborted.  SHA256 does not match"; exit 2; fi
xz -d -v $RASPBIAN_DOWNLOAD_FILENAME

# Find the extracted image and set it to the extracted image variable
EXTRACTED_IMAGE=$( ls | awk '/raspios.img$/ {print $NF}' )
echo $EXTRACTED_IMAGE

# Create device mapper entries for boot disk and root disk
KPARTX_OUTPUT=$( kpartx -v -a "$EXTRACTED_IMAGE" )
BOOT_DISK=$( echo $KPARTX_OUTPUT | grep -o 'loop.p1' )
ROOT_DISK=$( echo $KPARTX_OUTPUT | grep -o 'loop.p2' )

# Mount boot disk
mkdir -p $SDCARD_MOUNT
mount /dev/mapper/${BOOT_DISK} $SDCARD_MOUNT

# Configure Wifi
echo "ctrl_interface=DIR=/var/run/wpa_suplicant GROUP=netdev
update_config=1
country=$WIFI_COUNTRY

network={
scan_ssid=1
ssid=\"$WIFI_SSID\"
psk=\"$WIFI_PASSWORD\"
key_mgmt=WPA-PSK
}" > "$SDCARD_MOUNT/wpa_supplicant.conf"

echo '##########################################' 
echo '########## SET PI USER AND PASS ##########' 
echo '##########################################'

# set pass and encrypt with openssl
USER='turbine'
PASS="EnergyDemo"
PI_PASS=$(python -c "import crypt; print(crypt.crypt('$PASS', crypt.METHOD_SHA512))")

echo '############################################' 
echo '########## ECHO PI_PASS ENCRPYTED ##########' 
echo '############################################'
echo $PI_PASS

# add pipass to boot disk image
echo "$USER:$PI_PASS" > "$SDCARD_MOUNT/userconf.txt"

cat "$SDCARD_MOUNT/userconf.txt"

# Enable ssh by adding to boot disk
touch "$SDCARD_MOUNT/ssh"

# Copy firstboot script that runs the fleet provisioning client on first boot
cp -v firstboot.bash "$SDCARD_MOUNT/firstboot.bash"
chmod +x "$SDCARD_MOUNT/firstboot.bash"
echo "Copied firstboot script!"

# unmount the boot disk
umount "$SDCARD_MOUNT"

# Mount root disk
mount /dev/mapper/${ROOT_DISK} $SDCARD_MOUNT

ls
echo "Get AWS IoT fleet provisioning client"
# git clone https://github.com/aws-samples/aws-iot-fleet-provisioning.git

wait
cp -rv aws-iot-fleet-provisioning "$SDCARD_MOUNT/etc/"
echo "Copied fleet provisioning client to root disk!"

# Copy the energy-kit-embedded software
cp -rv "energykit-embedded" "$SDCARD_MOUNT/etc/"
echo "copied energykit embedded to root disk!"

# Copy and enable the first boot service that triggers the firstboot script on startup
cp -v firstboot.service "$SDCARD_MOUNT/lib/systemd/system/firstboot.service"
cd "$SDCARD_MOUNT/etc/systemd/system/multi-user.target.wants" && ln -s "/lib/systemd/system/firstboot.service" "./firstboot.service"
cd -

echo "set up firstboot service"

echo '{"awsRegion": "'"$AWS_REGION"'"}' > "$SDCARD_MOUNT/etc/energykit-embedded/embedded/utils/awsRegion.json"

echo "Created aws region config file"

echo '#########################################' 
echo '########## BEGIN CHROOT INSTALL ##########' 
echo '#########################################'

chroot $SDCARD_MOUNT << EOF

mkdir /etc/energykit-embedded/logs/
touch /etc/energykit-embedded/logs/provision-setup.log

echo '#########################################' 
echo '########## UPDATE DEPENDENCIES ##########' 
echo '#########################################' 
apt update -y
wait
apt install git -y
apt install python3-pip -y
apt-get install -y i2c-tools
python3 -m pip install awsiotsdk
python3 -m pip install awscrt
pip3 install --upgrade adafruit-python-shell
cd /etc/energykit-embedded/setup
wget https://raw.githubusercontent.com/adafruit/Raspberry-Pi-Installer-Scripts/master/raspi-blinka.py
wait
cd -

# generate device key and certificate
cd /etc/aws-iot-fleet-provisioning
ls

echo '#############################################################'
echo '########## INSTALL FLEET PROVISIONING REQUIREMENTS ##########'
echo '#############################################################'
pip3 install -r requirements.txt 
wait

echo "Requirements installed and moving on to next step" 
wait

echo '##############################################################' 
echo '################## INSTALL EMBEDDED REQS #####################' 
echo '##############################################################' 
# install peripheral device dependencies
cd /etc/energykit-embedded
# sh /etc/energykit-embedded/setup/setup.sh
wait

echo '%%%%%%%%%% install requirements doc %%%%%%%%%%%'
pip3 install -r requirements.txt

echo '%%%%%%%%%% install individual requirements with pip %%%%%%%%%%%'
pip3 install adafruit-blinka
pip3 install RPi.GPIO
pip3 install adafruit-circuitpython-lis3dh
pip3 install adafruit-circuitpython-bme280
pip3 install sparkfun-qwiic-scmd
wait

echo '%%%%%%%%%% allow pubsub log to be writable %%%%%%%%%%%'
touch /etc/energykit-embedded/logs/pubsub.log
chmod 777 /etc/energykit-embedded/logs/pubsub.log

touch /etc/energykit-embedded/logs/provision-setup.log
chmod 777 /etc/energykit-embedded/logs/provision-setup.log

exit
EOF

# Unmount disk and create the artifact
umount "$SDCARD_MOUNT"

echo "Created artifact! from $EXTRACTED_IMAGE and sending to $ARTIFACT_IMAGE_NAME"

cp -v $EXTRACTED_IMAGE $ARTIFACT_IMAGE_NAME
