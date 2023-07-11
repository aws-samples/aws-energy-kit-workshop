import datetime
import fnmatch
import json
import os
import random
import socket
import requests


'''
A module for writing the sensor config json file
Outputs a new config.json file with updated values
Currently only runs on firststart, but can be run or triggered manually
'''

with open(os.path.join(os.path.dirname(__file__), 'awsRegion.json'), "r") as f:
    regionConfig = json.load(f)


def get_ip():
    response = requests.get('https://api64.ipify.org?format=json').json()
    return response["ip"]


def get_location():
    ip_address = get_ip()
    response = requests.get(f'https://ipapi.co/{ip_address}/json/').json()
    print(response)
    location_data = {
        "ip": ip_address,
        "city": response.get("city"),
        "region": response.get("region"),
        "country": response.get("country_name"),
        "lat": response.get("latitude"),
        "long": response.get("longitude")
    }
    return location_data


def match_filename(pattern, directory):
    for file in os.listdir(directory):
        if fnmatch.fnmatch(file, pattern):
            return f'{directory}/{file}'

       
def generate_maintenance_date():
    today = datetime.datetime.now()
    delta = random.randrange(0, 365)
    d = datetime.timedelta(days=delta)
    return (today-d).strftime("%Y-%m-%d %H:%M:%S")


def generate_config():
    location = get_location()
    thing_name = socket.gethostname()
    config = {
        "thing_name": thing_name,
        "rpm_rating": 100,
        "voltage_rating": 6,
        "current_rating": 2,
        "location": location["region"],
        "lat": location["lat"],
        "long": location["long"],
        "last_maintenance": generate_maintenance_date(),
        "read_topic": f"energykit/wind/telemetry/{thing_name}",
        "command_topic": "energykit/wind/command/all/simulate",
        "certificate_path": match_filename(
            "*.pem.crt", "/etc/energykit-embedded/certs"),
        "private_key_path": match_filename(
            "*.pem.key", "/etc/energykit-embedded/certs"),
        "root_ca_path": match_filename(
            "*.pem", "/etc/energykit-embedded/certs"),
        "region": regionConfig["awsRegion"]
    }
    return config


def save_config():
    '''
    
    '''
    data = generate_config()
    
    with open(os.path.join(os.path.dirname(__file__), 'config.json'), "w") as outfile:
        json.dump(data, outfile, indent=4)
    print("Complete!")
    return data


# triggers the function to save the configuration
save_config()
