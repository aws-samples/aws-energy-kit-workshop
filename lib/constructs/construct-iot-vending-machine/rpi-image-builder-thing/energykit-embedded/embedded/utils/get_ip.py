import subprocess

def get_device_ip_address():
    ip_address = subprocess.check_output(["hostname", "-I"]).decode("utf-8")
    ip_address = ip_address.lstrip('\'').rstrip(" \n")
    ip_address = ip_address.split(" ")
    ip_address = ip_address[0]
    print(str(ip_address))
    return ip_address