from embedded import synthetic, telemetry

try:
    print("########### STARTING PUBSUB WITH TELEMETRY ###########")
    telemetry.pubsub_telemetry()
except RuntimeError as e1:
    print(e1)
    print("########### NO SENSOR CONNECTION ###########")
    print("Switching to synthetic data mode")
    print("########### STARTING PUBSUB WITH SYNTHETIC DATA ###########")
    synthetic.pubsub_synthetic()
finally:
    print("Could not connect. Check your certs and Greengrass device")