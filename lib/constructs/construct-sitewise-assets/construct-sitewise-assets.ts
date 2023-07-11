import { aws_iotsitewise as sitewise, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as turbineModel from "../../../resources/energy-assets/wind-turbines/asset-models/turbine-model"

interface SitewiseAssetProps extends StackProps {
    assetModelName: string;
}
        

export class SitewiseAssets extends Construct {
    public readonly sitewiseAssetId: string;
    constructor(scope: Construct, id: string, props: SitewiseAssetProps) {
        super(scope, id);

        const machine_model = new sitewise.CfnAssetModel(this, "WindTurbineMachineModel", {
            assetModelName: `${props.assetModelName}-telemetry`,
            assetModelDescription:`Asset model for EnergyKit Wind Turbines ${props.assetModelName}`,
            assetModelProperties: turbineModel.assetModelProperties
        });

        this.sitewiseAssetId = machine_model.attrAssetModelId;

    }
}