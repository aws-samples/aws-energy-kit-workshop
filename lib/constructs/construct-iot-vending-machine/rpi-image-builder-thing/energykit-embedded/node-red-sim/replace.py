import argparse
import json

parser = argparse.ArgumentParser(description="Replace some JSON to format a node-red flow")

parser.add_argument("--tag", required=True)
parser.add_argument("--original", required=True)
parser.add_argument("--replacement", required=True)
parser.add_argument("--path", required=True)
args = parser.parse_args()

# python3 replace.py --tag broker --original localhost --replacement "$IP_ADDRESS" --path ./flows.json


def replace(key_tag, original, replacement, path):
    file = open(path, 'r')
    print(f"Replace {key_tag}:{original} with {replacement}")
    data = json.load(file)
    for item in data:
        for key, value in item.items():
            #print(f'{key}:{value}')
            if key == key_tag and value == original:
                print(f'{key}:{value}')
                print(key)
                print(value)
                print(item[key_tag])
                item[key_tag] = replacement
    output = json.dumps(data, indent=4)
    file = open(path, 'w')
    file.write(output)
    file.close()
    print("Done!")

   
replace(args.tag, args.original, args.replacement, args.path)