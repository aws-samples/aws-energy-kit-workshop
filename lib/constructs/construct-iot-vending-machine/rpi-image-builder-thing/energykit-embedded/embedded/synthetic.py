# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0.
import argparse
import time
import uuid
import json
import os
from concurrent.futures import Future
from awscrt import io, mqtt, auth, http
from awscrt.io import LogLevel
from awscrt.mqtt import Connection, Client, QoS
from awsiot.greengrass_discovery import DiscoveryClient, DiscoverResponse
from awsiot import mqtt_connection_builder
import threading
import json
import logging
import time
from .utils import readsensors_synthetic, command_handler, get_ip
import json

with open(os.path.join(os.path.dirname(__file__), './utils/config.json'), "r") as f:
    config = json.load(f)

# This sample uses the Message Broker for AWS IoT to send and receive messages
# through an MQTT connection. On startup, the device connects to the server,
# subscribes to a topic, and begins publishing messages to that topic.
# The device should receive those same messages back from the message broker,
# since it is subscribed to that same topic.


logging.basicConfig(filename='/etc/energykit-embedded/logs/pubsub.log', encoding='utf-8', level=logging.INFO)

port = 8883
certificate_path = config["certificate_path"]
private_key_path = config["private_key_path"]
root_ca_path = config["root_ca_path"]
thing_name = config["thing_name"]
topic = config["read_topic"]
command_topic = config["command_topic"]
count = 0
use_websocket= False
proxy_host = False
proxy_port = False
region = config["region"]
verbosity = 'Warn'
mode = 'both'

received_count = 0
received_all_event = threading.Event()

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0.


allowed_actions = ['both', 'publish', 'subscribe']


io.init_logging(getattr(LogLevel, verbosity), 'stderr')

event_loop_group = io.EventLoopGroup(1)
host_resolver = io.DefaultHostResolver(event_loop_group)
client_bootstrap = io.ClientBootstrap(event_loop_group, host_resolver)

tls_options = io.TlsContextOptions.create_client_with_mtls_from_path(certificate_path, private_key_path)
if root_ca_path:
    tls_options.override_default_trust_store_from_path(None, root_ca_path)
tls_context = io.ClientTlsContext(tls_options)


socket_options = io.SocketOptions()

logging.info('Performing greengrass discovery...')
discovery_client = DiscoveryClient(client_bootstrap, socket_options, tls_context, region)
resp_future = discovery_client.discover(thing_name)
discover_response = resp_future.result()

logging.info(discover_response)


def on_connection_interupted(connection, error, **kwargs):
    logging.info('connection interrupted with error {}'.format(error))


# Callback when an interrupted connection is re-established.
def on_connection_resumed(connection, return_code, session_present, **kwargs):
    logging.info("Connection resumed. return_code: {} session_present: {}".format(return_code, session_present))

    if return_code == mqtt.ConnectReturnCode.ACCEPTED and not session_present:
        logging.info("Session did not persist. Resubscribing to existing topics...")
        resubscribe_future, _ = connection.resubscribe_existing_topics()

        # Cannot synchronously wait for resubscribe result because we're on the connection's event-loop thread,
        # evaluate result with a callback instead.
        resubscribe_future.add_done_callback(on_resubscribe_complete)

def on_resubscribe_complete(resubscribe_future):
        resubscribe_results = resubscribe_future.result()
        logging.info("Resubscribe results: {}".format(resubscribe_results))

        for topic, qos in resubscribe_results['topics']:
            if qos is None:
                sys.exit("Server rejected resubscribe to topic: {}".format(topic))

def try_iot_endpoints():
    for gg_group in discover_response.gg_groups:
        logging.info(gg_group)
        for gg_core in gg_group.cores:
            for connectivity_info in gg_core.connectivity:
                try:
                    logging.info('Trying core {} at host {} port {}'.format(gg_core.thing_arn, connectivity_info.host_address, connectivity_info.port))
                    mqtt_connection = mqtt_connection_builder.mtls_from_path(
                        endpoint=connectivity_info.host_address,
                        port=connectivity_info.port,
                        cert_filepath=certificate_path,
                        pri_key_filepath=private_key_path,
                        client_bootstrap=client_bootstrap,
                        ca_bytes=gg_group.certificate_authorities[0].encode('utf-8'),
                        on_connection_interrupted=on_connection_interupted,
                        on_connection_resumed=on_connection_resumed,
                        client_id=thing_name,
                        clean_session=False,
                        keep_alive_secs=30)

                    connect_future = mqtt_connection.connect()
                    connect_future.result()
                    logging.info('Connected!')
                    return mqtt_connection

                except Exception as e:
                    logging.info('Connection failed with exception {}'.format(e))
                    continue

    exit('All connection attempts failed')

mqtt_connection = try_iot_endpoints()

if mode == 'both' or mode == 'subscribe':

    def on_publish(topic, payload, dup, qos, retain, **kwargs):
        logging.info('Publish received on topic {}'.format(topic))
        logging.info(payload)

    def on_message_received(topic, payload, dup, qos, retain, **kwargs):
        logging.info("Received message from topic '{}': {}".format(topic, payload))
        payload = json.loads(payload)
        #handle_command = threading.Thread(target=commandHandler.handleCommand(payload), daemon=True)
        logging.info(f"Handled incoming command!")
        #handle_command.start()
        #handle_command.join()
        global received_count
        received_count += 1
        logging.info(f"Received messages:{received_count}")

    # Subscribe
    logging.info("Subscribing to topic {}...".format(command_topic))
    subscribe_future, packet_id = mqtt_connection.subscribe(
        topic=command_topic,
        qos=mqtt.QoS.AT_LEAST_ONCE,
        callback=on_message_received)

    subscribe_result = subscribe_future.result()
    logging.info("Subscribed with {}".format(str(subscribe_result['qos'])))


def pubsub():
    publish_count = 0
    logging.info(f"Publishing to topic {topic}")
    print(f"Publishing to topic {topic}")
    while True:
        if mode == 'both' or mode == 'publish':
            message = readsensors_synthetic.read_sensors_synthetic(0.5)
            print("############################################")
            print(message)
            print("############################################")
            print("############################################")
            messageJson = json.dumps(message)
            pub_future, _ = mqtt_connection.publish(topic, messageJson, QoS.AT_MOST_ONCE)
            pub_future.result()
            publish_count += 1
        time.sleep(5)

   
def pubsub_synthetic():
    print(f'Publishing to {topic}')
    synthetic = threading.Thread(target=pubsub)
    synthetic.start()