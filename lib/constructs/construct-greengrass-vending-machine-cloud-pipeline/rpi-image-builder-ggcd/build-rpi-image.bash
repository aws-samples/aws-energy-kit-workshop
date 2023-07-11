#!/bin/bash
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0\

RASPBIAN_DOWNLOAD_FILENAME="raspios.img.xz"
RASPBIAN_SOURCE_URL="https://downloads.raspberrypi.org/raspios_lite_armhf/images/raspios_lite_armhf-2022-09-26/2022-09-22-raspios-bullseye-armhf-lite.img.xz"
RASPBIAN_URL_BASE="https://downloads.raspberrypi.org/raspbian/images/"
SDCARD_MOUNT="/mnt/sdcard"

# Download raspbian, unzip it and SHA verify the download
wget $RASPBIAN_SOURCE_URL -O $RASPBIAN_DOWNLOAD_FILENAME
#VERSION="$( wget -q $RASPBIAN_URL_BASE -O - | xmllint --html --xmlout --xpath 'string(/html/body/table/tr[last()-1]/td/a/@href)' - )"
#RASPBIAN_SOURCE_SHA256_FILE=$( wget -q $RASPBIAN_URL_BASE/$VERSION -O - | xmllint --html --xmlout --xpath 'string(/html/body/table/tr/td/a[contains(@href, "256")])' - )
#RASPBIAN_SOURCE_SHA256=$( wget -q "$RASPBIAN_URL_BASE/$VERSION/$RASPBIAN_SOURCE_SHA256_FILE" -O - | awk '{print $1}' )
#RASPBIAN_DOWNLOAD_SHA256=$( sha256sum $RASPBIAN_DOWNLOAD_FILENAME |awk '{printf $1}' )
#if [ ! -z $RASPBIAN_SOURCE_SHA256 ] && [ "$RASPBIAN_DOWNLOAD_SHA256" != "$RASPBIAN_SOURCE_SHA256" ]; then echo "Build aborted.  SHA256 does not match"; exit 2; fi
7z x -y $RASPBIAN_DOWNLOAD_FILENAME

# Find the image name within the zip & set to variable'
EXTRACTED_IMAGE=$( 7z l $RASPBIAN_DOWNLOAD_FILENAME | awk '/raspios.img$/ {print $NF}' )
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

# set pass and encrypt with openssl
user='greengrass'
pass='EnergyDemo'
pipass=$(openssl passwd -6 $pass)
echo "$pipass"

# add pipass to boot disk image
echo "$user:$pipass" > "$SDCARD_MOUNT/userconf.txt"

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

# Copy the fleet provisioning client
cp -rv "aws-iot-greengrass-provisioning" "$SDCARD_MOUNT/etc/"
echo "Copied fleet provisioning client to root disk!"

Copy and enable the first boot service that triggers the firstboot script on startup
cp -v firstboot.service "$SDCARD_MOUNT/lib/systemd/system/firstboot.service"
cd "$SDCARD_MOUNT/etc/systemd/system/multi-user.target.wants" && ln -s "/lib/systemd/system/firstboot.service" "./firstboot.service"
cd -

echo "
Insert RPI fleet provisioning stuff here
" > etc/aws-iot-greengrass-provisioning/config/config.yaml

echo "set up firstboot service"

echo "Created artifact!"
# Unmount disk and create the artifact
umount "$SDCARD_MOUNT"

echo "Created artifact! from $EXTRACTED_IMAGE and sending to $ARTIFACT_IMAGE_NAME"

cp -v $EXTRACTED_IMAGE $ARTIFACT_IMAGE_NAME
