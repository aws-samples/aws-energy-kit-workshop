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

import {
    AddThingToThingGroupCommand,
    CreateThingGroupCommand,
    DeleteThingGroupCommand,
    IoTClient
} from "@aws-sdk/client-iot";
import { 
    CloudFormationCustomResourceEvent,
    CloudFormationCustomResourceCreateEvent,
    CloudFormationCustomResourceUpdateEvent,
    CloudFormationCustomResourceDeleteEvent,
    Context 
} from 'aws-lambda';

const iotClient = new IoTClient({ maxAttempts: 10, defaultsMode: "standard"});

// Note, responses are *not* lambda results, they are sent to the event ResponseURL.
export const handler = async (event: CloudFormationCustomResourceEvent, context: Context) => {
    console.info('Received event: ', event);

    let result = {};

    switch (event.RequestType) {
        case 'Create':
            result = onCreate(event);
            break;
        case 'Update':
            result = onUpdate(event);
            break;
        case 'Delete':
            result = onDelete(event);
            break;

        default:
            throw new Error('Invalid request type');
    }

    console.info("Output from Lambda: ", result);
    return result;
};

const onCreate = async (event: CloudFormationCustomResourceCreateEvent) => {
    // Check if we're failing Creates
    if (event.ResourceProperties.FailCreate ?? false) {
        throw new Error("Create failure requested, logging");
    } else {
        console.info('Create new resource with properties: ', event.ResourceProperties);

        const {
            ThingGroupName: group_name,
            ThingGroupDescription: group_description,
            ThingArnList: thing_list
        } = event.ResourceProperties;
        let physical_resource_id = '';
        let group_arn!: string;
        let group_id!: string;

        // Create AWS IoT thing group, and add any listed things to it
        try {
            const input = {
                thingGroupName: group_name,
                thingGroupProperties: {
                    thingGroupDescription: group_description
                }
            };
            const command = new CreateThingGroupCommand(input);
            const response = await iotClient.send(command);
            group_arn = response.thingGroupArn!;
            group_id = response.thingGroupId!;
            physical_resource_id = group_id;
        } catch (error) {
            console.error("Unable to create thing group: ", group_name, error);
            process.exitCode = 1;
        }

        // Add things to group
        try {
            for (const thing of thing_list) {
                const input = { thingGroupName: group_name, thingArn: thing };
                const command = new AddThingToThingGroupCommand(input);
                await iotClient.send(command);
            }
        } catch (error) {
            console.error(`Error adding things ${thing_list} to thing group ${group_name}: `, error);
            process.exitCode = 1;
        }

        return {
            PhysicalResourceId: physical_resource_id,
            Data: {
                ThingGroupName: group_name,
                ThingGroupArn: group_arn,
                ThingGroupId: group_id
            }
        };
    }

};

const onUpdate = async (event: CloudFormationCustomResourceUpdateEvent) => {
    console.info('Update existing resource with properties: ', event.ResourceProperties);

    const { ThingGroupName: group_name } = event.ResourceProperties;
    const physical_resource_id = event.PhysicalResourceId;
    console.info('No update required for already created IoT thing group: ', group_name);

    return {
        PhysicalResourceId: physical_resource_id,
        Data: {}
    };
}

const onDelete = async (event: CloudFormationCustomResourceDeleteEvent) => {
    console.info('Delete existing resource with properties: ', event.ResourceProperties);

    // Delete thing group - No need to remove things first
    const { ThingGroupName: group_name } = event.ResourceProperties;
    const physical_resource_id = event.PhysicalResourceId;

    try {
        const input = { thingGroupName: group_name };
        const command = new DeleteThingGroupCommand(input);
        await iotClient.send(command);
    } catch (error) {
        console.error(`Unable to delete thing group ${group_name}: `, error);
    }

    return {
        PhysicalResourceId: physical_resource_id,
        Data: {}
    };
}