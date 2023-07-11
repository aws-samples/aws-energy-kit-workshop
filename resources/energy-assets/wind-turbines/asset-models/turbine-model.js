"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructAssetProperties = exports.assetModelProperties = exports.assetModelName = exports.commandDataModel = exports.telemetryDataModel = exports.commandControlPanelMqttPath = exports.commandMqttPath = exports.telemetryMqttPath = exports.sitewiseAssetAlias = exports.sitewiseAliasPrefix = exports.mqttPrefix = void 0;
exports.mqttPrefix = "wind";
exports.sitewiseAliasPrefix = exports.mqttPrefix;
exports.sitewiseAssetAlias = `/energykit/wind/`;
exports.telemetryMqttPath = `energykit/${exports.mqttPrefix}/telemetry/+`;
exports.commandMqttPath = `energykit/${exports.mqttPrefix}/command/+`;
exports.commandControlPanelMqttPath = `energykit/${exports.mqttPrefix}/command/all/simulate`;
exports.telemetryDataModel = {
    "sensorTimestamp": "",
    "assetId": "",
    "temp": "",
    "pressure": "",
    "humidity": "",
    "altitude": "",
    "current": "",
    "voltage": "",
    "power": "",
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
exports.commandDataModel = {
    "simulate": "1/0",
    "anomaly": "True/False"
};
exports.assetModelName = `energykit-${exports.mqttPrefix}`;
exports.assetModelProperties = [
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
];
function constructAssetProperties(machine) {
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
exports.constructAssetProperties = constructAssetProperties;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVyYmluZS1tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInR1cmJpbmUtbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRWEsUUFBQSxVQUFVLEdBQUcsTUFBTSxDQUFDO0FBQ3BCLFFBQUEsbUJBQW1CLEdBQUcsa0JBQVUsQ0FBQztBQUNqQyxRQUFBLGtCQUFrQixHQUFHLGtCQUFrQixDQUFBO0FBQ3ZDLFFBQUEsaUJBQWlCLEdBQUcsYUFBYSxrQkFBVSxjQUFjLENBQUE7QUFDekQsUUFBQSxlQUFlLEdBQUcsYUFBYSxrQkFBVSxZQUFZLENBQUE7QUFDckQsUUFBQSwyQkFBMkIsR0FBRyxhQUFhLGtCQUFVLHVCQUF1QixDQUFBO0FBRTVFLFFBQUEsa0JBQWtCLEdBQUc7SUFDOUIsaUJBQWlCLEVBQUcsRUFBRTtJQUN0QixTQUFTLEVBQUUsRUFBRTtJQUNiLE1BQU0sRUFBRSxFQUFFO0lBQ1YsVUFBVSxFQUFFLEVBQUU7SUFDZCxVQUFVLEVBQUcsRUFBRTtJQUNmLFVBQVUsRUFBRyxFQUFFO0lBQ2YsU0FBUyxFQUFHLEVBQUU7SUFDZCxTQUFTLEVBQUcsRUFBRTtJQUNkLE9BQU8sRUFBRyxFQUFFO0lBQ1osS0FBSyxFQUFFLEVBQUU7SUFDVCxrQkFBa0IsRUFBRSxFQUFFO0lBQ3RCLE1BQU0sRUFBRSxFQUFFO0lBQ1YsU0FBUyxFQUFFLEVBQUU7SUFDYixhQUFhLEVBQUUsRUFBRTtJQUNqQixLQUFLLEVBQUUsRUFBRTtJQUNULEtBQUssRUFBRSxFQUFFO0lBQ1QsTUFBTSxFQUFFLEVBQUU7SUFDVixRQUFRLEVBQUUsRUFBRTtJQUNaLFFBQVEsRUFBRSxFQUFFO0lBQ1osaUJBQWlCLEVBQUUsRUFBRTtDQUN4QixDQUFDO0FBRVcsUUFBQSxnQkFBZ0IsR0FBRztJQUM1QixVQUFVLEVBQUUsS0FBSztJQUNqQixTQUFTLEVBQUUsWUFBWTtDQUUxQixDQUFDO0FBRVcsUUFBQSxjQUFjLEdBQUcsYUFBYSxrQkFBVSxFQUFFLENBQUM7QUFFM0MsUUFBQSxvQkFBb0IsR0FBRztJQUNwQjtRQUNJLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFNBQVMsRUFBRSxLQUFLO1FBQ2hCLElBQUksRUFBRSxLQUFLO1FBQ1gsSUFBSSxFQUFFO1lBQ0YsUUFBUSxFQUFFLGFBQWE7U0FDMUI7UUFDRCxJQUFJLEVBQUUsS0FBSztLQUNkO0lBQ0Q7UUFDSSxRQUFRLEVBQUUsUUFBUTtRQUNsQixTQUFTLEVBQUUsV0FBVztRQUN0QixJQUFJLEVBQUUsV0FBVztRQUNqQixJQUFJLEVBQUU7WUFDRixRQUFRLEVBQUUsYUFBYTtTQUMxQjtRQUNELElBQUksRUFBRSxNQUFNO0tBQ2Y7SUFDRDtRQUNJLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFNBQVMsRUFBRSxNQUFNO1FBQ2pCLElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFO1lBQ0YsUUFBUSxFQUFFLGFBQWE7U0FDMUI7UUFDRCxJQUFJLEVBQUUsR0FBRztLQUNaO0NBQ0osQ0FBQTtBQUdiLFNBQWdCLHdCQUF3QixDQUFDLE9BQVc7SUFDaEQsTUFBTSxlQUFlLEdBQUc7UUFDcEI7WUFDSSxTQUFTLEVBQUUsY0FBYztZQUN6QixLQUFLLEVBQUUsK0JBQStCO1lBQ3RDLGlCQUFpQixFQUFFLFVBQVU7U0FDaEM7UUFDRDtZQUNJLFNBQVMsRUFBRSxrQkFBa0I7WUFDN0IsS0FBSyxFQUFFLHFDQUFxQztZQUM1QyxpQkFBaUIsRUFBRSxVQUFVO1NBQ2hDO1FBQ0Q7WUFDSSxTQUFTLEVBQUUsYUFBYTtZQUN4QixLQUFLLEVBQUUsZ0NBQWdDO1lBQ3ZDLGlCQUFpQixFQUFFLFVBQVU7U0FDaEM7S0FDSixDQUFDO0lBQ0YsT0FBTyxlQUFlLENBQUM7QUFDM0IsQ0FBQztBQW5CRCw0REFtQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhd3NfaW90c2l0ZXdpc2UgYXMgc2l0ZXdpc2UsIFN0YWNrUHJvcHMgfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcblxuZXhwb3J0IGNvbnN0IG1xdHRQcmVmaXggPSBcIndpbmRcIjtcbmV4cG9ydCBjb25zdCBzaXRld2lzZUFsaWFzUHJlZml4ID0gbXF0dFByZWZpeDtcbmV4cG9ydCBjb25zdCBzaXRld2lzZUFzc2V0QWxpYXMgPSBgL2VuZXJneWtpdC93aW5kL2BcbmV4cG9ydCBjb25zdCB0ZWxlbWV0cnlNcXR0UGF0aCA9IGBlbmVyZ3lraXQvJHttcXR0UHJlZml4fS90ZWxlbWV0cnkvK2BcbmV4cG9ydCBjb25zdCBjb21tYW5kTXF0dFBhdGggPSBgZW5lcmd5a2l0LyR7bXF0dFByZWZpeH0vY29tbWFuZC8rYFxuZXhwb3J0IGNvbnN0IGNvbW1hbmRDb250cm9sUGFuZWxNcXR0UGF0aCA9IGBlbmVyZ3lraXQvJHttcXR0UHJlZml4fS9jb21tYW5kL2FsbC9zaW11bGF0ZWBcblxuZXhwb3J0IGNvbnN0IHRlbGVtZXRyeURhdGFNb2RlbCA9IHtcbiAgICBcInNlbnNvclRpbWVzdGFtcFwiIDogXCJcIixcbiAgICBcImFzc2V0SWRcIjogXCJcIixcbiAgICBcInRlbXBcIjogXCJcIixcbiAgICBcInByZXNzdXJlXCIgOlwiXCIsXG4gICAgXCJodW1pZGl0eVwiIDogXCJcIixcbiAgICBcImFsdGl0dWRlXCIgOiBcIlwiLFxuICAgIFwiY3VycmVudFwiIDogXCJcIixcbiAgICBcInZvbHRhZ2VcIiA6IFwiXCIsXG4gICAgXCJwb3dlclwiIDogXCJcIixcbiAgICBcInJwbVwiOiBcIlwiLFxuICAgIFwiZ2VhcmJveFZpYnJhdGlvblwiOiBcIlwiLFxuICAgIFwiY2l0eVwiOiBcIlwiLFxuICAgIFwiY291bnRyeVwiOiBcIlwiLFxuICAgIFwiY291bnRyeUNvZGVcIjogXCJcIixcbiAgICBcInppcFwiOiBcIlwiLFxuICAgIFwibGF0XCI6IFwiXCIsXG4gICAgXCJsb25nXCI6IFwiXCIsXG4gICAgXCJyZWdpb25cIjogXCJcIixcbiAgICBcInN0YXR1c1wiOiBcIlwiLFxuICAgIFwibGFzdE1haW50ZW5hbmNlXCI6IFwiXCJcbn07XG5cbmV4cG9ydCBjb25zdCBjb21tYW5kRGF0YU1vZGVsID0ge1xuICAgIFwic2ltdWxhdGVcIjogXCIxLzBcIixcbiAgICBcImFub21hbHlcIjogXCJUcnVlL0ZhbHNlXCJcblxufTtcblxuZXhwb3J0IGNvbnN0IGFzc2V0TW9kZWxOYW1lID0gYGVuZXJneWtpdC0ke21xdHRQcmVmaXh9YDtcblxuZXhwb3J0IGNvbnN0IGFzc2V0TW9kZWxQcm9wZXJ0aWVzID0gW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwiRE9VQkxFXCIsXG4gICAgICAgICAgICAgICAgICAgIGxvZ2ljYWxJZDogXCJycG1cIixcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJycG1cIixcbiAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZU5hbWU6IFwiTWVhc3VyZW1lbnRcIixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdW5pdDogXCJSUE1cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwiRE9VQkxFXCIsXG4gICAgICAgICAgICAgICAgICAgIGxvZ2ljYWxJZDogXCJ2aWJyYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJ2aWJyYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZU5hbWU6IFwiTWVhc3VyZW1lbnRcIixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdW5pdDogXCJtL3MyXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcIkRPVUJMRVwiLFxuICAgICAgICAgICAgICAgICAgICBsb2dpY2FsSWQ6IFwidGVtcFwiLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcInRlbXBcIixcbiAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZU5hbWU6IFwiTWVhc3VyZW1lbnRcIixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdW5pdDogXCJGXCIsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdHJ1Y3RBc3NldFByb3BlcnRpZXMobWFjaGluZTphbnkpe1xuICAgIGNvbnN0IGFzc2V0UHJvcGVydGllcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbG9naWNhbElkOiBcIkN1cnJlbnRTcGVlZFwiLFxuICAgICAgICAgICAgYWxpYXM6IGAvZW5lcmd5a2l0L3dpbmQvdGVsZW1ldHJ5L3JwbWAsXG4gICAgICAgICAgICBub3RpZmljYXRpb25TdGF0ZTogXCJESVNBQkxFRFwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBsb2dpY2FsSWQ6IFwiQ3VycmVudFZpYnJhdGlvblwiLFxuICAgICAgICAgICAgYWxpYXM6IGAvZW5lcmd5a2l0L3dpbmQvdGVsZW1ldHJ5L3ZpYnJhdGlvbmAsXG4gICAgICAgICAgICBub3RpZmljYXRpb25TdGF0ZTogXCJESVNBQkxFRFwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBsb2dpY2FsSWQ6IFwiQ3VycmVudFRlbXBcIixcbiAgICAgICAgICAgIGFsaWFzOiBgL2VuZXJneWtpdC93aW5kL3RlbGVtZXRyeS90ZW1wYCxcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvblN0YXRlOiBcIkRJU0FCTEVEXCIsXG4gICAgICAgIH0sXG4gICAgXTtcbiAgICByZXR1cm4gYXNzZXRQcm9wZXJ0aWVzO1xufSJdfQ==