import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path'

type TimeStreamReaderProps = {
  table: timestream.CfnTable;
};

export class TimeStreamReader extends Construct {
  lambda: lambda.Function;

  constructor(scope: Construct, id: string, props: TimeStreamReaderProps) {
    super(scope, id);
    const { table } = props;

    this.lambda = new lambda.Function(this, 'TimestreamReaderUDQ', {
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: "udq_data_reader.lambda_handler",
      layers: [
        new lambda.LayerVersion(this, 'UdqUtilsLayer', {
          code: lambda.Code.fromAsset(path.join(__dirname, './layer')),
          compatibleRuntimes: [lambda.Runtime.PYTHON_3_9],
          description: 'A layer to support Timestream reader for ',
        }),
      ],
      memorySize: 256,
      role: new iam.Role(this, 'TimestreamUdqRole', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromManagedPolicyArn(this, 'lambdaExecRole', 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'), //TODO: Do we need this ?
          iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonTimestreamReadOnlyAccess'),
        ],
      }),
      timeout: Duration.minutes(15),
      environment: {
        TIMESTREAM_DATABASE_NAME: `${table.databaseName}`,
        TIMESTREAM_TABLE_NAME: `${table.tableName}`,
      },
    });
  }
}