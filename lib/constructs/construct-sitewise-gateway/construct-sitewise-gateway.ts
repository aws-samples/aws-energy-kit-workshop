import { aws_iotsitewise as sitewise, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

interface SitewiseGatewayProps extends StackProps {
    assetModelName: string;
    iot_thing_cert_policy: any
}

export class SitewiseGateway extends Construct {
    constructor(scope: Construct, id: string, props: SitewiseGatewayProps) {
        super(scope, id);

        // Create sitewise gateway
const sitewise_gateway = new sitewise.CfnGateway(
    this,
    "SitewiseGateway",
    {
        gatewayName: `${props.iot_thing_cert_policy.thingName}-Gateway`,
        gatewayPlatform: {
            greengrassV2: {
                coreDeviceThingName: props.iot_thing_cert_policy.thingName
            }
        },
        gatewayCapabilitySummaries: [
            {
                capabilityNamespace: "iotsitewise:opcuacollector:2",
                capabilityConfiguration: JSON.stringify({
                    sources: [{
                        name: "Node-Red OPC-UA Server",
                        endpoint: {
                            certificateTrust: { type: "TrustAny" },
                            endpointUri: "opc.tcp://localhost:54845",
                            securityPolicy: "NONE",
                            messageSecurityMode: "NONE",
                            identityProvider: { type: "Anonymous" },
                            nodeFilterRules:[]
                        },
                        measurementDataStreamPrefix: ""
                    }]
                })
            },
            {
                capabilityNamespace: "iotsitewise:publisher:2",
                capabilityConfiguration: JSON.stringify({
                    SiteWisePublisherConfiguration: {
                        publishingOrder: "TIME_ORDER"
                    }
                })
            },
        ]
    }
);

        //site
    }
}