import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Names, RemovalPolicy } from 'aws-cdk-lib'
import * as twinmaker from 'aws-cdk-lib/aws-iottwinmaker'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Components } from './assets/components'
import { Entities } from './assets/entities'
import { Scenes } from './assets/scenes'

type TwinmakerProps = {
  timestreamReaderArn: string
  assetName: string
}

export class TwinmakerDeploymentSmg extends Construct {
  workspace: twinmaker.CfnWorkspace
  bucket: s3.Bucket
  twinmakerDatasourceRole: iam.Role

  constructor(scope: Construct, id: string, props: TwinmakerProps) {
    super(scope, id)
    const { timestreamReaderArn, assetName } = props

    this.bucket = new s3.Bucket(this, 'TwinmakerBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
            s3.HttpMethods.HEAD,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    })

    const role = new iam.Role(this, 'TwinmakerRole', {
      assumedBy: new iam.ServicePrincipal('iottwinmaker.amazonaws.com'),
    })
    this.bucket.grantReadWrite(role)
    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['lambda:InvokeFunction'],
        resources: [timestreamReaderArn],
      })
    )
    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['iotsitewise:*'],
        resources: ['*'],
      })
    )

    const workspace = new twinmaker.CfnWorkspace(this, 'Workspace', {
      role: role.roleArn,
      s3Location: this.bucket.bucketArn,
      workspaceId: 'EK' + Names.uniqueId(this),
    })
    workspace.node.addDependency(this.bucket)
    workspace.node.addDependency(role)

    //const components = new Components(this, 'Components', { workspace, timestreamReaderArn });
    const entities = new Entities(this, 'Entities', { workspace, assetName })
    //entities.node.addDependency(components);

    this.workspace = workspace

    this.twinmakerDatasourceRole = new iam.Role(this, 'DataSourceRole', {
      assumedBy: new iam.ServicePrincipal('grafana.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonKinesisVideoStreamsFullAccess'),
      ],
    })

    this.twinmakerDatasourceRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['iottwinmaker:*'],
        resources: ['*'],
      })
    )
  }

  createScenes() {
    const workspace = this.workspace
    const bucket = this.bucket
    const scenes = new Scenes(this, 'Scenes', { workspace, bucket })
    scenes.node.addDependency(workspace)
  }
}
