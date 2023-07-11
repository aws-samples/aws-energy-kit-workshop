#!/bin/bash
# MIT License 
# Copyright (c) 2017 Ken Fallon http://kenfallon.com
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

# renames the hostname of the Raspberry Pi to a version based on it’s Ethernet MAC address.
device_serial=$( sed 's/://g' /sys/class/net/eth0/address )
sed "s/raspberrypi/${device_serial}/g" -i /etc/hostname /etc/hosts

# generate device key and certificate
cd /etc/aws-iot-fleet-provisioning
pip3 install -r requirements.txt
python3 main.py ${device_serial}

# store iot certificates
mkdir /etc/iot-certificates
mv ./certs/* /etc/iot-certificates/

# install peripheral device dependencies

# install greengrass core device dependencies

# add greengrass users
sudo adduser --system ggc_user
sudo addgroup --system ggc_group

# enable hardlink and softlink
cd /etc/sysctl.d
ls
echo '''
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
''' >> 98-rpi.conf

# enable and mount cgroups
cd /boot/
echo '''
cgroup_enable=memory cgroup_memory=1
''' >> cmdline.txt

# install open jdk dependency for greengrass
apt install openjdk-8-jdk

# install the greengrass device software
apt install aws-iot-greengrass-core aws-iot-greengrass-keyring

systemctl enable greengrass.service

systemctl start greengrass.service

# alternative install method...
# download installer
curl -s https://d2s8p88vqu9w66.cloudfront.net/releases/greengrass-nucleus-latest.zip > greengrass-nucleus-latest.zip && unzip greengrass-nucleus-latest.zip -d GreengrassCore

# run installer and set up device
sudo -E java -Droot="/greengrass/v2" -Dlog.store=FILE -jar ./GreengrassCore/lib/Greengrass.jar --aws-region us-east-1 --thing-name amazon-scs-test  --component-default-user ggc_user:ggc_group --provision true --setup-system-service true --deploy-dev-tools true

# reboot pi
/sbin/shutdown -r 1 "reboot in 1 minute"