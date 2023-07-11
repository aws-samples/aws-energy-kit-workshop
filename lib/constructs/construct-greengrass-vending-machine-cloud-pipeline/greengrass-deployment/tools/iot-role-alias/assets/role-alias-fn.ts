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
    CreateRoleAliasCommand,
    DeleteRoleAliasCommand,
    IoTClient
} from "@aws-sdk/client-iot";
import { 
    CloudFormationCustomResourceEvent,
    CloudFormationCustomResourceCreateEvent,
    CloudFormationCustomResourceUpdateEvent,
    CloudFormationCustomResourceDeleteEvent} from 'aws-lambda';

const iotClient = new IoTClient({ maxAttempts: 10, defaultsMode: "standard"});

// Note, responses are *not* lambda results, they are sent to the event ResponseURL.
export const handler = async (event: CloudFormationCustomResourceEvent) => {
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
            IotRoleAliasName: role_alias,
            IamRoleArn: role_arn
        } = event.ResourceProperties;
        let physical_resource_id = '';
        let role_alias_arn!: string;

        // Create AWS IoT role alias
        try {
            const input = {
                roleAlias: role_alias,
                roleArn: role_arn
            };
            const command = new CreateRoleAliasCommand(input);
            const response = await iotClient.send(command);
            role_alias_arn = response.roleAliasArn!;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            physical_resource_id = response.roleAlias!;
        } catch (error) {
            console.error("Unable to create IoT role alias: ", role_alias, error);
            process.exitCode = 1;
        }

        return {
            PhysicalResourceId: physical_resource_id,
            Data: {
                RoleAliasArn: role_alias_arn
            }
        };
    }

};

const onUpdate = async (event: CloudFormationCustomResourceUpdateEvent) => {
    console.info('Update existing resource with properties: ', event.ResourceProperties);

    const { IotRoleAliasName: role_alias } = event.ResourceProperties;
    const physical_resource_id = event.PhysicalResourceId;
    console.info('No update required for already created IoT role alias: ', role_alias);

    return {
        PhysicalResourceId: physical_resource_id,
        Data: {}
    };
}

const onDelete = async (event: CloudFormationCustomResourceDeleteEvent) => {
    console.info('Delete existing resource with properties: ', event.ResourceProperties);
    
    const { IotRoleAliasName: role_alias } = event.ResourceProperties;
    const physical_resource_id = event.PhysicalResourceId;

    // Delete AWS IoT role alias
    try {
        const input = { roleAlias: role_alias };
        const command = new DeleteRoleAliasCommand(input);
        await iotClient.send(command);
    } catch (error) {
        console.error("Unable to delete IoT role alias: ", role_alias, error);
    }

    return {
        PhysicalResourceId: physical_resource_id,
        Data: {}
    };
}