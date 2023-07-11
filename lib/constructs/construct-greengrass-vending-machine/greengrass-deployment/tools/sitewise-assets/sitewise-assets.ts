/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { aws_iotsitewise as sitewise, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export class SitewiseAssets extends Construct {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id);

        const machine_model = new sitewise.CfnAssetModel(this, "GenericMachineModel", {
            assetModelName: "Generic Machine Model",
            assetModelDescription: "Asset model for a industrial bottling line machine.",
            assetModelProperties: [
                {
                    dataType: "INTEGER",
                    logicalId: "MachineState",
                    name: "Machine State",
                    type: {
                        typeName: "Measurement",
                    }
                },
                {
                    dataType: "INTEGER",
                    logicalId: "MachineMode",
                    name: "Machine Mode",
                    type: {
                        typeName: "Measurement",
                    }
                },
                {
                    dataType: "DOUBLE",
                    logicalId: "CurrentSpeed",
                    name: "Current Speed",
                    type: {
                        typeName: "Measurement",
                    },
                    unit: "Bottles per minute",
                },
                {
                    dataType: "BOOLEAN",
                    logicalId: "MachineBlocked",
                    name: "Machine Blocked",
                    type: {
                        typeName: "Measurement",
                    }
                },
                {
                    dataType: "BOOLEAN",
                    logicalId: "MachineStarved",
                    name: "Machine Starved",
                    type: {
                        typeName: "Measurement",
                    }
                },
                {
                    dataType: "INTEGER",
                    logicalId: "StopReason",
                    name: "Machine Stop Reason Code",
                    type: {
                        typeName: "Measurement",
                    }
                },
                {
                    dataType: "INTEGER",
                    logicalId: "ProdProcessedCount",
                    name: "OEE - Total count",
                    type: {
                        typeName: "Measurement",
                    },
                    unit: "Bottles"
                },
                {
                    dataType: "INTEGER",
                    logicalId: "ProdDefectiveCount",
                    name: "OEE - Bad count",
                    type: {
                        typeName: "Measurement",
                    },
                    unit: "Bottles"
                },
                {
                    dataType: "DOUBLE",
                    logicalId: "MachineStateEnumProducing",
                    name: "Producing",
                    type: {
                        typeName: "Transform",
                        transform: {
                            expression:
                                "if(eq(var_machine_state, 1), 1, 0)",
                            variables: [
                                {
                                    name: "var_machine_state",
                                    value: {
                                        propertyLogicalId: "MachineState",
                                    },
                                },
                            ],
                        },
                    }
                },
                {
                    dataType: "DOUBLE",
                    logicalId: "MachineStateEnumIdle",
                    name: "Idle",
                    type: {
                        typeName: "Transform",
                        transform: {
                            expression:
                                "if(eq(var_machine_state, 2), 1, 0)",
                            variables: [
                                {
                                    name: "var_machine_state",
                                    value: {
                                        propertyLogicalId: "MachineState",
                                    },
                                },
                            ],
                        },
                    }
                },
                {
                    dataType: "DOUBLE",
                    logicalId: "MachineStateEnumStarved",
                    name: "Starved",
                    type: {
                        typeName: "Transform",
                        transform: {
                            expression:
                                "if(eq(var_machine_state, 3), 1, 0)",
                            variables: [
                                {
                                    name: "var_machine_state",
                                    value: {
                                        propertyLogicalId: "MachineState",
                                    },
                                },
                            ],
                        },
                    }
                },
                {
                    dataType: "DOUBLE",
                    logicalId: "MachineStateEnumBlocked",
                    name: "Blocked",
                    type: {
                        typeName: "Transform",
                        transform: {
                            expression:
                                "if(eq(var_machine_state, 4), 1, 0)",
                            variables: [
                                {
                                    name: "var_machine_state",
                                    value: {
                                        propertyLogicalId: "MachineState",
                                    },
                                },
                            ],
                        },
                    }
                },
                {
                    dataType: "DOUBLE",
                    logicalId: "MachineStateEnumChangeover",
                    name: "Changeover",
                    type: {
                        typeName: "Transform",
                        transform: {
                            expression:
                                "if(eq(var_machine_state, 5), 1, 0)",
                            variables: [
                                {
                                    name: "var_machine_state",
                                    value: {
                                        propertyLogicalId: "MachineState",
                                    },
                                },
                            ],
                        },
                    }
                },
                {
                    dataType: "DOUBLE",
                    logicalId: "MachineStateEnumStopped",
                    name: "Stopped",
                    type: {
                        typeName: "Transform",
                        transform: {
                            expression:
                                "if(eq(var_machine_state, 6), 1, 0)",
                            variables: [
                                {
                                    name: "var_machine_state",
                                    value: {
                                        propertyLogicalId: "MachineState",
                                    },
                                },
                            ],
                        },
                    }
                },
                {
                    dataType: "DOUBLE",
                    logicalId: "MachineStateEnumFaulted",
                    name: "Faulted",
                    type: {
                        typeName: "Transform",
                        transform: {
                            expression:
                                "if(eq(var_machine_state, 7), 1, 0)",
                            variables: [
                                {
                                    name: "var_machine_state",
                                    value: {
                                        propertyLogicalId: "MachineState",
                                    },
                                },
                            ],
                        },
                    }
                },
                {
                    dataType: "STRING",
                    logicalId: "MachineStateIndicatorStarved",
                    name: "Starved Indicator",
                    type: {
                        typeName: "Transform",
                        transform: {
                            expression:
                                "if(var_machine_state_starved, 'YES', 'NO')",
                            variables: [
                                {
                                    name: "var_machine_state_starved",
                                    value: {
                                        propertyLogicalId: "MachineStateEnumStarved",
                                    },
                                },
                            ],
                        },
                    }
                },
                {
                    dataType: "STRING",
                    logicalId: "MachineStateIndicatorBlocked",
                    name: "Blocked Indicator",
                    type: {
                        typeName: "Transform",
                        transform: {
                            expression:
                                "if(var_machine_state_blocked, 'YES', 'NO')",
                            variables: [
                                {
                                    name: "var_machine_state_blocked",
                                    value: {
                                        propertyLogicalId: "MachineStateEnumBlocked",
                                    },
                                },
                            ],
                        },
                    }
                },
                {
                    dataType: "STRING",
                    logicalId: "MachineModeEnum",
                    name: "Machine Mode Enum",
                    type: {
                        typeName: "Transform",
                        transform: {
                            expression:
                                "if(eq(var_machine_mode, 1), 'AUTOMATIC').elif(eq(var_machine_mode, 2), 'MAINTENANCE', if(eq(var_machine_mode, 3), 'MANUAL', none))",
                            variables: [
                                {
                                    name: "var_machine_mode",
                                    value: {
                                        propertyLogicalId: "MachineMode",
                                    },
                                },
                            ],
                        },
                    }
                },
                {
                    dataType: "STRING",
                    logicalId: "MachineStateEnum",
                    name: "Machine State Enum",
                    type: {
                        typeName: "Transform",
                        transform: {
                            expression:
                                "if(var_machine_state_producing, 'PRODUCING').elif(var_machine_state_idle, 'IDLE').elif(var_machine_state_starved, 'STARVED').elif(var_machine_state_blocked, 'BLOCKED').elif(var_machine_state_changeover, 'CHANGEOVER').elif(var_machine_state_stopped, 'STOPPED').elif(var_machine_state_faulted, 'FAULTED', none)",
                            variables: [
                                {
                                    name: "var_machine_state_producing",
                                    value: {
                                        propertyLogicalId: "MachineStateEnumProducing",
                                    },
                                },
                                {
                                    name: "var_machine_state_idle",
                                    value: {
                                        propertyLogicalId: "MachineStateEnumIdle",
                                    },
                                },
                                {
                                    name: "var_machine_state_starved",
                                    value: {
                                        propertyLogicalId: "MachineStateEnumStarved",
                                    },
                                },
                                {
                                    name: "var_machine_state_blocked",
                                    value: {
                                        propertyLogicalId: "MachineStateEnumBlocked",
                                    },
                                },
                                {
                                    name: "var_machine_state_changeover",
                                    value: {
                                        propertyLogicalId: "MachineStateEnumChangeover",
                                    },
                                },
                                {
                                    name: "var_machine_state_stopped",
                                    value: {
                                        propertyLogicalId: "MachineStateEnumStopped",
                                    },
                                },
                                {
                                    name: "var_machine_state_faulted",
                                    value: {
                                        propertyLogicalId: "MachineStateEnumFaulted",
                                    },
                                },
                            ],
                        },
                    }
                },
            ]
        });

        const machines = [
            {
                id: "UN01",
                name: "Washing Machine",
            },
            {
                id: "UN02",
                name: "Filling Machine",
            },
            {
                id: "UN03",
                name: "Capping Machine",
            },
            {
                id: "UN04",
                name: "Labelling Machine",
            },
            {
                id: "UN05",
                name: "Case Packing Machine",
            },
            {
                id: "UN06",
                name: "Palletizing Machine",
            },
        ];

        const machine_assets = machines.map(machine=> new sitewise.CfnAsset(this, machine.name.replace(/\s/g, ""), {
                assetModelId: machine_model.attrAssetModelId,
                assetName: machine.name,
                assetProperties: [
                    {
                        logicalId: "MachineState",
                        alias: `/Bottling Line/${machine.id}/Status/StateCurrent`,
                        notificationState: "DISABLED",
                    },
                    {
                        logicalId: "MachineMode",
                        alias: `/Bottling Line/${machine.id}/Status/ModeCurrent`,
                        notificationState: "DISABLED",
                    },
                    {
                        logicalId: "CurrentSpeed",
                        alias: `/Bottling Line/${machine.id}/Status/CurMachSpeed`,
                        notificationState: "DISABLED",
                    },
                    {
                        logicalId: "MachineBlocked",
                        alias: `/Bottling Line/${machine.id}/Status/Blocked`,
                        notificationState: "DISABLED",
                    },
                    {
                        logicalId: "MachineStarved",
                        alias: `/Bottling Line/${machine.id}/Status/Starved`,
                        notificationState: "DISABLED",
                    },
                    {
                        logicalId: "StopReason",
                        alias: `/Bottling Line/${machine.id}/Admin/StopReasonCode`,
                        notificationState: "DISABLED",
                    },
                    {
                        logicalId: "ProdProcessedCount",
                        alias: `/Bottling Line/${machine.id}/Admin/ProcessedCount`,
                        notificationState: "DISABLED",
                    },
                    {
                        logicalId: "ProdDefectiveCount",
                        alias: `/Bottling Line/${machine.id}/Admin/DefectiveCount`,
                        notificationState: "DISABLED",
                    },
                ]
            })
        );
    }
}