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
    AttachPolicyCommand,
    AttachThingPrincipalCommand,
    CreateKeysAndCertificateCommand,
    CreatePolicyCommand,
    CreateThingCommand,
    DeleteCertificateCommand,
    DeletePolicyCommand,
    DeletePolicyVersionCommand,
    DeleteThingCommand,
    DetachPolicyCommand,
    DetachThingPrincipalCommand,
    DescribeEndpointCommand,
    IoTClient,
    ListAttachedPoliciesCommand,
    ListPolicyVersionsCommand,
    ListPrincipalThingsCommand,
    ListTargetsForPolicyCommand,
    ListThingPrincipalsCommand,
    UpdateCertificateCommand
} from "@aws-sdk/client-iot";
import { DeleteParametersCommand, PutParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { 
    CloudFormationCustomResourceEvent,
    CloudFormationCustomResourceCreateEvent,
    CloudFormationCustomResourceUpdateEvent,
    CloudFormationCustomResourceDeleteEvent,
    Context 
} from 'aws-lambda';

const iotClient = new IoTClient({ maxAttempts: 10, defaultsMode: "standard"});
const ssmClient = new SSMClient({ maxAttempts: 10, defaultsMode: "standard"});

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
            ThingName: thing_name, 
            IotPolicyName: policy_name, 
            IotPolicy: policy_document, 
            StackName: stack_name
        } = event.ResourceProperties;
        let physical_resource_id = '';
        let certificate_arn!: string;
        let certificate_pem!: string;
        let credential_provider_endpoint_address!: string;
        let data_ats_endpoint_address!: string;
        const parameter_private_key = `/${stack_name}/${thing_name}/private_key`;
        const parameter_certificate_pem = `/${stack_name}/${thing_name}/certificate_pem`;
        let policy_arn!: string;
        let private_key!: string;
        let thing_arn!: string;

        // Create IoT thing
        try {
            const input = { thingName: thing_name };
            const command = new CreateThingCommand(input);
            const response = await iotClient.send(command);
            thing_arn = response.thingArn!;
        } catch (error) {
            console.error("Error creating thing: ", thing_name, error);
            process.exitCode = 1;
        } 

        // Create IoT certificate and keys
        try {
            const input = { setAsActive: true };
            const command = new CreateKeysAndCertificateCommand(input);
            const response = await iotClient.send(command);
            certificate_arn = response.certificateArn!;
            certificate_pem = response.certificatePem!;
            physical_resource_id = response.certificateId!;
            private_key = response.keyPair!.PrivateKey!;
        } catch (error) {
            console.error("Error creating certificate and keys: ", error);
            process.exitCode = 1;
        }

        // Create IoT policy
        try {
            const input = {
                policyDocument: policy_document,
                policyName: policy_name
            };
            const command = new CreatePolicyCommand(input);
            const response = await iotClient.send(command);
            policy_arn = response.policyArn!;
        } catch (error) {
            console.error("Error creating policy: ", policy_name, error);
            process.exitCode = 1;
        }

        // Attach certificate and policy
        try {
            const input = {
                policyName: policy_name,
                target: certificate_arn
            };
            const command = new AttachPolicyCommand(input);
            await iotClient.send(command);
        } catch (error) {
            console.error(`Error attaching certificate: ${certificate_arn} to policy: ${policy_name}: `, error);
            process.exitCode = 1;
        }

        // Attach thing and certificate
        try {
            const input = {
                thingName: thing_name,
                principal: certificate_arn
            };
            const command = new AttachThingPrincipalCommand(input);
            await iotClient.send(command);
        } catch (error) {
            console.error(`Error attaching certificate: ${certificate_arn} to thing: ${thing_name}: `, error);
            process.exitCode = 1;
        }

        // Store certificate and private key in SSM param store
        try {
            let input, command;
            // Private key
            input = {
                Name: parameter_private_key,
                Description: `Certificate private key for IoT thing ${thing_name}`,
                Value: private_key,
                Type: "SecureString",
                Tier: "Advanced"
            };
            command = new PutParameterCommand(input);
            await ssmClient.send(command);

            // Certificate pem
            input = {
                Name: parameter_certificate_pem,
                Description: `Certificate PEM for IoT thing ${thing_name}`,
                Value: certificate_pem,
                Type: "String",
                Tier: "Advanced"
            };
            command = new PutParameterCommand(input);
            await ssmClient.send(command);
        } catch (error) {
            console.error("Error creating secure string parameters: ", error);
            process.exitCode = 1;
        }

        // Additional data - these calls and responses are used in other constructs or external applications

        // Get the IoT-Data endpoint
        try {
            const input = { endpointType: "iot:Data-ATS" };
            const command = new DescribeEndpointCommand(input);
            const response = await iotClient.send(command);
            data_ats_endpoint_address = response.endpointAddress!;
        } catch (error) {
            console.error("Could not obtain iot:Data-ATS endpoint: ", error);
            data_ats_endpoint_address = "stack_error: see log files";
        }

        // Get the Credential Provider endpoint
        try {
            const input = { endpointType: "iot:CredentialProvider" };
            const command = new DescribeEndpointCommand(input);
            const response = await iotClient.send(command);
            credential_provider_endpoint_address = response.endpointAddress!;
        } catch (error) {
            console.error("Could not obtain iot:CredentialProvider endpoint: ", error);
            credential_provider_endpoint_address = "stack_error: see log files";
        }

        return {
            PhysicalResourceId: physical_resource_id,
            Data: {
                ThingArn: thing_arn,
                ThingName: thing_name,
                CertificateArn: certificate_arn,
                IotPolicyArn: policy_arn,
                PrivateKeySecretParameter: parameter_private_key,
                CertificatePemParameter: parameter_certificate_pem,
                DataAtsEndpointAddress: data_ats_endpoint_address,
                CredentialProviderEndpointAddress: credential_provider_endpoint_address
            }
        };
    }
};

const onUpdate = async (event: CloudFormationCustomResourceUpdateEvent) => {
    console.info('Update existing resource with properties: ', event.ResourceProperties);

    const { ThingName: thing_name } = event.ResourceProperties;
    const physical_resource_id = event.PhysicalResourceId;
    console.info('No update required for already generated IoT keys, certificate, policy for: ', thing_name);

    return {
        PhysicalResourceId: physical_resource_id,
        Data: {}
    };
};

const onDelete = async (event: CloudFormationCustomResourceDeleteEvent) => {
    console.info('Delete existing resource with properties: ', event.ResourceProperties);

    // Delete thing, certificate, and policy in reverse order.
    // Check for modifications since create (policy versions, etc.)
    const {
        CertificateArn: certificate_arn,
        ThingName: thing_name,
        IotPolicyName: policy_name,
        StackName: stack_name
    } = event.ResourceProperties;
    const physical_resource_id = event.PhysicalResourceId;
    const parameter_private_key = `/${stack_name}/${thing_name}/private_key`;
    const parameter_certificate_pem = `/${stack_name}/${thing_name}/certificate_pem`;

    // Delete certificate and private key from SSM param store
    try {
        const input = { Names: [parameter_private_key, parameter_certificate_pem] };
        const command = new DeleteParametersCommand(input);
        await ssmClient.send(command);
    } catch (error) {
        console.error("Unable to delete parameter store values: ", error);
    }

    // Delete policy (prune versions, detach from targets)
    // Delete all non active policy versions
    try {
        const input = { policyName: policy_name };
        const command = new ListPolicyVersionsCommand(input);
        const response = await iotClient.send(command);

        for (const version of response.policyVersions!) {
            if (!version.isDefaultVersion) {
                const input = { policyName: policy_name, policyVersionId: version.versionId };
                const command = new DeletePolicyVersionCommand(input);
                await iotClient.send(command);
            }
        }
    } catch (error) {
        console.error(`Unable to delete policy versions for policy ${policy_name}: `, error);
    }

    // Detach any principals
    try {
        const input = { policyName: policy_name };
        const command = new ListTargetsForPolicyCommand(input);
        const response = await iotClient.send(command);

        for (const target of response.targets!) {
            const input = { policyName: policy_name, target: target };
            const command = new DetachPolicyCommand(input);
            await iotClient.send(command);
        }
    } catch (error) {
        console.error(`Unable to detach targets from policy ${policy_name}: `, error);
    }

    // Delete policy
    try {
        const input = { policyName: policy_name };
        const command = new DeletePolicyCommand(input);
        await iotClient.send(command);
    } catch (error) {
        console.error(`Unable to delete policy ${policy_name}: `, error);
    }

    // Delete cert
    // Detach all policies and things from cert
    try {
        let input, command, response;
        input = { principal: certificate_arn };
        command = new ListPrincipalThingsCommand(input);
        response = await iotClient.send(command);

        for (const thing of response.things!) {
            const input = { thingName: thing_name, principal: certificate_arn };
            const command = new DetachThingPrincipalCommand(input);
            await iotClient.send(command);
        }

        input = { target: certificate_arn };
        command = new ListAttachedPoliciesCommand(input);
        response =  await iotClient.send(command);

        for (const policy of response.policies!) {
            const input = { policyName: policy.policyName, target: certificate_arn };
            const command = new DetachPolicyCommand(input);
            await iotClient.send(command);
        } 
    } catch (error) {
        console.error(`Unable to list or detach things or policies from certificate ${certificate_arn}: `, error);
    }

    try {
        let input, command;
        input = { certificateId: physical_resource_id, newStatus: "REVOKED" };
        command = new UpdateCertificateCommand(input);
        await iotClient.send(command);

        input = { certificateId: physical_resource_id };
        command = new DeleteCertificateCommand(input);
        await iotClient.send(command);
    } catch (error) {
        console.error(`Unable to delete certificate ${certificate_arn}: `, error);
    }

    // Delete thing
    // Check and detach principals attached to thing
    try {
        const input = { thingName: thing_name };
        const command = new ListThingPrincipalsCommand(input);
        const response = await iotClient.send(command);

        for (const principal of response.principals!) {
            const input = { thingName: thing_name, principal: principal };
            const command = new DetachThingPrincipalCommand(input);
            await iotClient.send(command);
        } 
    } catch (error) {
        console.error(`Unable to list or detach principals from ${thing_name}: `, error);
    }

    try {
        const input = { thingName: thing_name };
        const command = new DeleteThingCommand(input);
        await iotClient.send(command);
    } catch (error) {
        console.error(`Error calling iot.DeleteThingCommand() for thing ${thing_name}: `, error);
    }
    
    return {
        PhysicalResourceId: physical_resource_id,
        Data: {}
    };
};