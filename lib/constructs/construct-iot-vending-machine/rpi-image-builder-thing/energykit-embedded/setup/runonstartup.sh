#! /bin/sh
sudo echo "
[Unit]
Description=Run TurbineTelemetryDemoPubSubScript
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/pi/sensor-pi-demo/ggadpubsub.py
Restart=always
RestartSec=10s
KillMode=process
TimeoutSec=infinity

[Install]
WantedBy=multi-user.target
" > /lib/systemd/system/turbinetelemetrydemopubsub.service

sudo systemctl daemon-reload

sudo systemctl enable turbinetelemetrydemopubsub.service

# if you need to check the logs
#journalctl -u turbinetelemetrydemopubsub.log

# if you need to troubleshoot
#systemctl status turbinetelemetrydemopubsub.service