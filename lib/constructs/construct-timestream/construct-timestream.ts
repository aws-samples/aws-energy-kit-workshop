import { Construct } from 'constructs';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Names } from 'aws-cdk-lib';

export class TimeStream extends Construct {
  table: timestream.CfnTable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const database = new timestream.CfnDatabase(this, 'Database', {
      databaseName: Names.uniqueId(this) + 'Turbine',
    });
    const table = new timestream.CfnTable(this, 'Table', {
      databaseName: database.databaseName!,
      tableName: Names.uniqueId(this) + 'Telemetry',
    });
    table.node.addDependency(database);

    const timeStreamAccessRole = new iam.Role(this, 'topicIotTimeStreamRole', {
      assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonTimestreamFullAccess')],
    });

    this.table = table;
  }
}