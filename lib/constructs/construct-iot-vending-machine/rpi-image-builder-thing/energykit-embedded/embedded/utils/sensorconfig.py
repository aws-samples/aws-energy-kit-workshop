import socket
import fnmatch
import os
import json

#location_data = location.get_location()

def match_filename(pattern, directory):
    for file in os.listdir(directory):
        if fnmatch.fnmatch(file, pattern):
            return f'{directory}/{file}'


thing_name = socket.gethostname()
rpm_rating = 100
voltage_rating = 6
current_rating = 2
location = "Virginia"
lat = 39.017388
long = -77.468037
last_maintenance = "2021-07-13 18:32:00"
read_topic = f"energykit/wind/telemetry/{thing_name}"
command_topic = "energykit/wind/command/all/simulate"
certificate_path = match_filename(
    "*.pem.crt", "/etc/energykit-embedded/certs")
private_key_path = match_filename(
    "*.pem.key", "/etc/energykit-embedded/certs")
root_ca_path = match_filename(
    "*.pem", "/etc/energykit-embedded/certs")
region = "us-east-1"


