import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { GrafanaDeploymentSelfHosted } from '../../constructs/construct-grafana-deployment-self-hosted/construct-grafana-deployment-self-hosted';
import { TimeStreamReader } from '../../constructs/construct-timestream-reader/construct-timestream-reader';
import { TimeStream } from '../../constructs/construct-timestream/construct-timestream';
import { TwinmakerDeploymentSmg } from '../../constructs/construct-twinmaker-deployment-smg/construct-twinmaker-deployment-smg';

interface TwinmakerStackStackProps extends StackProps {
  assetName: string;
  virtual?: boolean;
}

// Adds twinmaker stack to application
export class TwinmakerStack extends Stack {

  constructor(scope: Construct, id: string, props: TwinmakerStackStackProps) {
    super(scope, id, props);
    
    const timestream = new TimeStream(this, 'TimeStream');
    const timestreamReader = new TimeStreamReader(this, 'TimeStreamReader', { table: timestream.table });
    const twinmaker = new TwinmakerDeploymentSmg(this, 'TwinMaker', { assetName: props.assetName, timestreamReaderArn: timestreamReader.lambda.functionArn });
    const grafana = new GrafanaDeploymentSelfHosted(this, 'Grafana', { assetName: props.assetName, twinmakerId: twinmaker.workspace.workspaceId, region: this.region, datasourceRole: twinmaker.twinmakerDatasourceRole});
    twinmaker.createScenes();
  }
}