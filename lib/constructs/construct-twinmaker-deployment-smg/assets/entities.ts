// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct } from 'constructs';
import * as twinmaker from 'aws-cdk-lib/aws-iottwinmaker';

type EntitiesProps = {
  workspace: twinmaker.CfnWorkspace;
  assetName: string;
};

export class Entities extends Construct {
  constructor(scope: Construct, id: string, props: EntitiesProps) {
    super(scope, id);
    const { workspace, assetName } = props;
    this.node.addDependency(workspace);

    const turbineSceneEntity = new twinmaker.CfnEntity(this, 'TurbineSceneEntity', {
      workspaceId: workspace.workspaceId,
      entityId: 'energyKit',
      entityName: 'EnergyKit',
    });

  }
}
