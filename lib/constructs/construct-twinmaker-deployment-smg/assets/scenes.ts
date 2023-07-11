import { readFileSync } from 'fs'
import { Construct } from 'constructs'
import * as twinmaker from 'aws-cdk-lib/aws-iottwinmaker'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'

type ScenesProps = {
  workspace: twinmaker.CfnWorkspace
  bucket: s3.Bucket
}

export class Scenes extends Construct {
  constructor(scope: Construct, id: string, props: ScenesProps) {
    super(scope, id)
    const { workspace, bucket } = props

    const sceneTypes = ['simulator', 'telemetry']

    for (const type of sceneTypes) {
      console.log(`Creating ${type} scenes...`)
      new twinmaker.CfnScene(this, `${type}SummaryView`, {
        workspaceId: workspace.workspaceId,
        contentLocation: bucket.s3UrlForObject('summaryView.json'),
        sceneId: `${type}summaryView`,
      })

      new twinmaker.CfnScene(this, `${type}TopView`, {
        workspaceId: workspace.workspaceId,
        contentLocation: bucket.s3UrlForObject('topView.json'),
        sceneId: `${type}topView`,
      })

      new twinmaker.CfnScene(this, `${type}CrossSectionView`, {
        workspaceId: workspace.workspaceId,
        contentLocation: bucket.s3UrlForObject('crossSectionView.json'),
        sceneId: `${type}crossSectionView`,
      })

      new twinmaker.CfnScene(this, `${type}DriveSystemView`, {
        workspaceId: workspace.workspaceId,
        contentLocation: bucket.s3UrlForObject('driveSystemView.json'),
        sceneId: `${type}driveSystemView`,
      })
    }
    const summaryView = readFileSync('resources/energy-assets/wind-turbines/twinmaker-data/scenes/summaryView.json')
      .toString()
      .replace(/\${bucket}/g, bucket.s3UrlForObject())
    const topView = readFileSync('resources/energy-assets/wind-turbines/twinmaker-data/scenes/topView.json')
      .toString()
      .replace(/\${bucket}/g, bucket.s3UrlForObject())
    const crossSectionView = readFileSync(
      'resources/energy-assets/wind-turbines/twinmaker-data/scenes/crossSectionView.json'
    )
      .toString()
      .replace(/\${bucket}/g, bucket.s3UrlForObject())
    const driveSystemView = readFileSync(
      'resources/energy-assets/wind-turbines/twinmaker-data/scenes/driveSystemView.json'
    )
      .toString()
      .replace(/\${bucket}/g, bucket.s3UrlForObject())

    new s3deploy.BucketDeployment(this, 'UploadResources', {
      sources: [
        s3deploy.Source.data('summaryView.json', summaryView),
        s3deploy.Source.data('topView.json', topView),
        s3deploy.Source.data('crossSectionView.json', crossSectionView),
        s3deploy.Source.data('driveSystemView.json', driveSystemView),
        s3deploy.Source.asset('resources/energy-assets/wind-turbines/twinmaker-data/models'),
      ],
      destinationBucket: bucket,
      retainOnDelete: false,
    })
  }
}
