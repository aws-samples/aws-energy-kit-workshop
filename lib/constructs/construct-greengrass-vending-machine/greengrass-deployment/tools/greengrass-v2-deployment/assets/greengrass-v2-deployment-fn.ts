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

import { CancelDeploymentCommand, CreateDeploymentCommand, GreengrassV2Client } from '@aws-sdk/client-greengrassv2';
import { 
    CloudFormationCustomResourceEvent,
    CloudFormationCustomResourceCreateEvent,
    CloudFormationCustomResourceUpdateEvent,
    CloudFormationCustomResourceDeleteEvent,
    Context 
} from 'aws-lambda';
import { stringify } from 'querystring';

const greengrassv2Client = new GreengrassV2Client({ maxAttempts: 10, defaultsMode: "standard"});

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
}

const onCreate = async (event: CloudFormationCustomResourceCreateEvent) => {
    // Check if we're failing Creates
    if (event.ResourceProperties.FailCreate ?? false) {
        throw new Error("Create failure requested, logging");
    } else {
        console.info('Create new resource with properties: ', event.ResourceProperties);

        const {
            TargetArn: target_arn,
            DeploymentName: deployment_name,
            Components: components
        } = event.ResourceProperties;
        let physical_resource_id = '';
        let deployment_id!: string;
        let iot_job_id!: string;
        let iot_job_arn!: string;

        // Create deployment
        try {
            const input = { 
                targetArn: target_arn,
                deploymentName: deployment_name,
                components: components
            };
            const command = new CreateDeploymentCommand(input);
            const response = await greengrassv2Client.send(command);
            deployment_id = response.deploymentId!;
            iot_job_id = response.iotJobId!;
            iot_job_arn = response.iotJobArn!;
            physical_resource_id = response.deploymentId!;
        } catch (error) {
            throw new Error(`Error calling create_deployment for target ${target_arn}, error: ${error}`);
        }

        return {
            PhysicalResourceId: physical_resource_id,
            Data: {
                DeploymentId: deployment_id,
                IotJobId: iot_job_id,
                IotJobArn: iot_job_arn
            }
        };
    }
}

const onUpdate = async (event: CloudFormationCustomResourceUpdateEvent) => {
    console.info('Update existing resource with properties: ', event.ResourceProperties);

    const { DeploymentId: deployment_id } = event.ResourceProperties;
    const physical_resource_id = event.PhysicalResourceId;
    console.info('No update required for already created greengrass v2 deployment: ', deployment_id);

    return {
        PhysicalResourceId: physical_resource_id,
        Data: {}
    };
}

const onDelete = async (event: CloudFormationCustomResourceDeleteEvent) => {
    console.info('Delete existing resource with properties: ', event.ResourceProperties);

    const { DeploymentId: deployment_id } = event.ResourceProperties;
    const physical_resource_id = event.PhysicalResourceId;

    // Cancel the deployment
    try {
        const input = { deploymentId: deployment_id };
        const command = new CancelDeploymentCommand(input);
        const response = await greengrassv2Client.send(command);
        console.info(`Successfully canceled Greengrass deployment ${deployment_id}, response was: `, response);
    } catch (error) {
        console.warn(`Error calling greengrassv2.CancelDeploymentCommand() for deployment id ${deployment_id}, error:`, error);
    }

    console.info(`Delete Request: Greengrass deployment ${deployment_id} successfully cancelled`);

    return {
        PhysicalResourceId: physical_resource_id,
        Data: {}
    };
}