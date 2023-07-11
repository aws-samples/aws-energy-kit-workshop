import { aws_iotsitewise as sitewise, StackProps } from "aws-cdk-lib";

export const mqttPrefix = "wind";
export const sitewiseAliasPrefix = mqttPrefix;
export const sitewiseAssetAlias = `/energykit/wind/`
export const telemetryMqttPath = `energykit/${mqttPrefix}/telemetry/+`
export const commandMqttPath = `energykit/${mqttPrefix}/command/+`
export const commandControlPanelMqttPath = `energykit/${mqttPrefix}/command/all/simulate`

export const telemetryDataModel = {
    "sensorTimestamp" : "",
    "assetId": "",
    "temp": "",
    "pressure" :"",
    "humidity" : "",
    "altitude" : "",
    "current" : "",
    "voltage" : "",
    "power" : "",
    "rpm": "",
    "gearboxVibration": "",
    "city": "",
    "country": "",
    "countryCode": "",
    "zip": "",
    "lat": "",
    "long": "",
    "region": "",
    "status": "",
    "lastMaintenance": ""
};

export const commandDataModel = {
    "simulate": "1/0",
    "anomaly": "True/False"

};

export const assetModelName = `energykit-${mqttPrefix}`;

export const assetModelProperties = [
                {
                    dataType: "DOUBLE",
                    logicalId: "rpm",
                    name: "rpm",
                    type: {
                        typeName: "Measurement",
                    },
                    unit: "RPM",
                },
                {
                    dataType: "DOUBLE",
                    logicalId: "vibration",
                    name: "vibration",
                    type: {
                        typeName: "Measurement",
                    },
                    unit: "m/s2",
                },
                {
                    dataType: "DOUBLE",
                    logicalId: "temp",
                    name: "temp",
                    type: {
                        typeName: "Measurement",
                    },
                    unit: "F",
                }
            ]


export function constructAssetProperties(machine:any){
    const assetProperties = [
        {
            logicalId: "CurrentSpeed",
            alias: `/energykit/wind/telemetry/rpm`,
            notificationState: "DISABLED",
        },
        {
            logicalId: "CurrentVibration",
            alias: `/energykit/wind/telemetry/vibration`,
            notificationState: "DISABLED",
        },
        {
            logicalId: "CurrentTemp",
            alias: `/energykit/wind/telemetry/temp`,
            notificationState: "DISABLED",
        },
    ];
    return assetProperties;
}