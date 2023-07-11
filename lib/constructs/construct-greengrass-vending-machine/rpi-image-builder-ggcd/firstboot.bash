#!/bin/bash

mkdir /etc/greengrass-setup
mkdir /etc/greengrass-setup/logs
touch /etc/greengrass-setup/logs/setup.log

echo '######################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '########## RESET NAMESERVER ##########' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
echo '######################################' >> /etc/energykit-embedded/logs/provision-setup.log 2>&1
sudo echo "static domain_name_servers=8.8.4.4 8.8.8.8" >> /etc/dhcpcd.conf 
sudo cat /etc/dhcpcd.conf >> /etc/energykit-embedded/logs/provision-setup.log 2>&1

echo '##################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '########## SET HOSTNAME ##########' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '##################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
PI_SN=$(cat /sys/firmware/devicetree/base/serial-number)
wait
BASE_NAME="energykit-ggcd"
wait
NEW_NAME="$BASE_NAME-$PI_SN"
echo $NEW_NAME >> /etc/greengrass-setup/logs/setup.log 2>&1
wait
sudo chmod 777 /etc/hostname >> /etc/greengrass-setup/logs/setup.log 2>&1
wait
sudo echo $NEW_NAME > /etc/hostname
wait
sudo sed -i "s/raspberrypi/$NEW_NAME/g" /etc/hosts
wait
hostname $NEW_NAME
wait
echo "updated hostname as $NEW_NAME" 
wait
sleep 5

echo '#########################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '########## UPDATE DEPENDENCIES ##########' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '#########################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
sudo apt update -y >> /etc/greengrass-setup/logs/setup.log 2>&1
wait
sleep 5
#sudo apt dist-upgrade -y >> /etc/greengrass-setup/logs/setup.log 2>&1
#wait

#sudo apt install python3 -y >> /etc/greengrass-setup/logs/setup.log 2>&1
#wait
sudo apt install git -y >> /etc/greengrass-setup/logs/setup.log 2>&1
wait
sleep 2
sudo apt update >> /etc/greengrass-setup/logs/setup.log 2>&1
wait
sleep 2
sudo apt install python3-pip -y >> /etc/greengrass-setup/logs/setup.log 2>&1
wait
sleep 2

echo '#########################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '########### INSTALL OPEN JDK ############' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '#########################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
# install open jdk dependency for greengrass
sudo apt install openjdk-8-jdk -y >> /etc/greengrass-setup/logs/setup.log 2>&1
wait
sleep 2


echo '#############################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '########### ADD GREENGRASS USERS ############' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '#############################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
# add greengrass users
sudo adduser --system ggc_user >> /etc/greengrass-setup/logs/setup.log 2>&1
wait
sudo addgroup --system ggc_group >> /etc/greengrass-setup/logs/setup.log 2>&1
wait

echo '#############################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '################ ENABLE HARDLINK ############' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '#############################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
# enable hardlink and softlink
sudo cd /etc/sysctl.d
ls
echo '''
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
''' >> 98-rpi.conf

# enable and mount cgroups
sudo cd /boot/
echo '''
cgroup_enable=memory cgroup_memory=1
''' >> cmdline.txt

sudo cgroup_enable=memory cgroup_memory=1 systemd.unified_cgroup_hierarchy=0 >> /etc/greengrass-setup/logs/setup.log 2>&1
sleep 5

# make greengrass directory
sudo mkdir -p /greengrass/v2 >> /etc/greengrass-setup/logs/setup.log 2>&1

sudo chmod 755 /greengrass >> /etc/greengrass-setup/logs/setup.log 2>&1

sudo mkdir /greengrass/v2/certs >> /etc/greengrass-setup/logs/setup.log 2>&1

sudo mv etc/aws-iot-greengrass-provisioning/certs/* greengrass/v2/certs >> /etc/greengrass-setup/logs/setup.log 2>&1

sleep 5
sudo curl -o /greengrass/v2/certs/AmazonRootCA1.pem https://www.amazontrust.com/repository/AmazonRootCA1.pem

sudo chmod 777 ./greengrass/v2/

echo '##################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '################ GET GG CORE SOFTWARE ############' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '##################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
# install the greengrass device software
sudo curl -s https://d2s8p88vqu9w66.cloudfront.net/releases/greengrass-nucleus-latest.zip > greengrass-nucleus-latest.zip
wait
sleep 2
sudo unzip greengrass-nucleus-latest.zip -d ./greengrass/v2/GreengrassInstaller && rm greengrass-nucleus-latest.zip
wait
sleep 2


echo '#############################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '################ GET FLEET PROVISIONING SOFTWARE ############' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '#############################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
# download fleet provisioning client
sudo mkdir ./greengrass/v2/GreengrassFleetProvisionPlugin
wait
sudo chmod 777 ./greengrass/v2/GreengrassFleetProvisionPlugin/
wait
sudo curl -s https://d2s8p88vqu9w66.cloudfront.net/releases/aws-greengrass-FleetProvisioningByClaim/fleetprovisioningbyclaim-latest.jar > ./greengrass/v2/GreengrassFleetProvisionPlugin/FleetProvisioningByClaim.jar
wait
sleep 2
sudo chmod 777 ./greengrass/v2/GreengrassFleetProvisionPlugin/FleetProvisioningByClaim.jar

echo '#############################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '################ CHECK GG INSTALLER VERSION  ################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '#############################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1

sudo java -jar ./greengrass/v2/GreengrassInstaller/lib/Greengrass.jar --version >> /etc/greengrass-setup/logs/setup.log 2>&1
wait
sleep 2

echo '##################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '################ PROVISION GG DEVICE #############' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '##################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
# run greengrass fleet provisioning client
sudo chmod 755 /greengrass/v2 && sudo chmod 755 /greengrass
wait
sleep 1
sudo chmod 755 /greengrass/v2/cert
wait
sleep 1
sudo chmod 777 etc/aws-iot-greengrass-provisioning/config/config.yaml

sudo sed -i "s/energyKitGreengrassThing/${NEW_NAME}/g" etc/aws-iot-greengrass-provisioning/config/config.yaml >> /etc/greengrass-setup/logs/setup.log 2>&1
wait
sleep 5

echo '#######################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '################ INSTALL GG & PROVISION ###############' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '#######################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1

sudo -E java -Droot="/greengrass/v2" -Dlog.store=FILE \
  -jar /greengrass/v2/GreengrassInstaller/lib/Greengrass.jar \
  --trusted-plugin /greengrass/v2/GreengrassFleetProvisionPlugin/FleetProvisioningByClaim.jar \
  --init-config etc/aws-iot-greengrass-provisioning/config/config.yaml \
  --component-default-user ggc_user:ggc_group \
  --start true \
  --setup-system-service true >> /etc/greengrass-setup/logs/setup.log 2>&1

echo '##################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '################ ENABLE GG SERVICE ###############' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '##################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1

systemctl enable greengrass.service >> /etc/greengrass-setup/logs/setup.log 2>&1
sleep 2

echo '##################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '################# START GG SERVICE ###############' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '##################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1

systemctl start greengrass.service >> /etc/greengrass-setup/logs/setup.log 2>&1
sudo chmod 755 /greengrass/v2 && sudo chmod 755 /greengrass

echo '##################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '################# RESTART DEVICE #################' >> /etc/greengrass-setup/logs/setup.log 2>&1
echo '##################################################' >> /etc/greengrass-setup/logs/setup.log 2>&1


# reboot pi
/sbin/shutdown -r 1 "reboot in 1 minute" >> /etc/greengrass-setup/logs/setup.log 2>&1