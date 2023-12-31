# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import boto3
import json
import logging
import zipfile
import io

CERTS_FOLDER = 'aws-iot-greengrass-provisioning/certs'
CERT_FILENAME = 'claim-certificate.pem.crt'
KEY_FILENAME = 'claim-private.pem.key'
CONFIG_LOCATION = 'aws-iot-greengrass-provisioning/config/config.yaml'

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

s3_client = boto3.client('s3')
iot_client = boto3.client('iot')


def get_iot_endpoint():
    result = iot_client.describe_endpoint(
        endpointType='iot:Data-ATS'
    )
    return result['endpointAddress']

def get_iot_credential_endpoint():
    result = iot_client.describe_endpoint(
        endpointType='iot:CredentialProvider'
    )
    return result['endpointAddress']

def create_provisioning_client_config(provisioning_template_name, greengrass_region, greengrass_group_name, greengrass_token_exchange_role_alias):
    return f"""
system:
  rootCaPath: "/greengrass/v2/certs/AmazonRootCA1.pem"
services:
  aws.greengrass.Nucleus:
    version: "2.7.0"
  aws.greengrass.FleetProvisioningByClaim:
    configuration:
      rootCaPath: "/greengrass/v2/certs/AmazonRootCA1.pem"
      rootPath: "/greengrass/v2"
      awsRegion: {greengrass_region}
      iotDataEndpoint: {get_iot_endpoint()}
      iotCredentialEndpoint: {get_iot_credential_endpoint()}
      iotRoleAlias: {greengrass_token_exchange_role_alias}
      provisioningTemplate: {provisioning_template_name}
      claimCertificatePath: "/greengrass/v2/certs/{CERT_FILENAME}"
      claimCertificatePrivateKeyPath: "/greengrass/v2/certs/{KEY_FILENAME}"
      templateParameters:
        ThingGroupName: {greengrass_group_name}
        ThingName: "energyKitGreengrassThing"
"""

def create_configured_rpi_image_builder_archive(
    claim_certificate,
    config,
    rpi_image_builder_bucket_name,
    rpi_image_builder_object_key,
    configured_rpi_image_builder_bucket_name,
    configured_rpi_image_builder_object_key,
):

    logger.info("Downloading client code")
    rpi_image_builder_object = s3_client.get_object(
        Bucket=rpi_image_builder_bucket_name,
        Key=rpi_image_builder_object_key,
    )

    with io.BytesIO(rpi_image_builder_object['Body'].read()) as rpi_image_builder_archive:
        # rewind the file
        rpi_image_builder_archive.seek(0)

        logger.info("Adding claim certificate and configuration to rpi image builder archive")
        with zipfile.ZipFile(rpi_image_builder_archive, mode='a') as zipf:
            zipf.writestr(f'{CERTS_FOLDER}/{CERT_FILENAME}',
                          claim_certificate['certificatePem'])
            zipf.writestr(f'{CERTS_FOLDER}/{KEY_FILENAME}',
                          claim_certificate['keyPair']['PrivateKey'])
            zipf.writestr(CONFIG_LOCATION, config)

        # rewind the file
        rpi_image_builder_archive.seek(0)

        logger.info("Uploading configured rpi image builder archive to s3")
        s3_client.put_object(
            Bucket=configured_rpi_image_builder_bucket_name,
            Key=configured_rpi_image_builder_object_key,
            Body=rpi_image_builder_archive
        )


def configure_rpi_image_builder(
    fleet_provisioning_policy_name,
    provisioning_template_name,
    greengrass_region, 
    greengrass_group_name,
    rpi_image_builder_bucket_name,
    rpi_image_builder_object_key,
    configured_rpi_image_builder_bucket_name,
    configured_rpi_image_builder_object_key,
    greengrass_token_exchange_role_alias
):
    """
    1/ Create claim certificate and provisioning client config
    2/ Download the provisioning client
    3/ Inject config and claim certificate in provisioning client
    4/ Upload configured provisioning client to S3
    """
    logger.info("Generating claim certificate")
    claim_certificate = iot_client.create_keys_and_certificate(
        setAsActive=True,
    )

    logger.info("Attaching fleet provisioning policy to certificate")
    iot_client.attach_policy(
        policyName=fleet_provisioning_policy_name,
        target=claim_certificate['certificateArn'],
    )

    logger.info("Creating provisioning client config")
    config = create_provisioning_client_config(
        provisioning_template_name,
        greengrass_region,
        greengrass_group_name,
        greengrass_token_exchange_role_alias
        )

    logger.info(f"Creating configured RPI image builder archive and uploading it to S3")
    create_configured_rpi_image_builder_archive(
        claim_certificate,
        config,
        rpi_image_builder_bucket_name,
        rpi_image_builder_object_key,
        configured_rpi_image_builder_bucket_name,
        configured_rpi_image_builder_object_key,
    )


def on_event(event, context):
    """
    Function that configures the raspberry pi image builder and stores it on S3.
    Triggered when the corresponding custom resource gets updated.
    """
    logger.info(f'New event {json.dumps(event, indent=2)}')

    fleet_provisioning_policy_name = event['ResourceProperties']['FLEET_PROVISIONING_POLICY_NAME']
    provisioning_template_name = event['ResourceProperties']['PROVISIONING_TEMPLATE_NAME']
    greengrass_group_name = event['ResourceProperties']['GREENGRASS_GROUP_NAME']
    greengrass_region = event['ResourceProperties']['GREENGRASS_REGION']
    rpi_image_builder_bucket_name = event['ResourceProperties']['RPI_IMAGE_BUILDER_BUCKET_NAME']
    rpi_image_builder_object_key = event['ResourceProperties']['RPI_IMAGE_BUILDER_OBJECT_KEY']
    configured_rpi_image_builder_bucket_name = event['ResourceProperties']['CONFIGURED_RPI_IMAGE_BUILDER_BUCKET_NAME']
    configured_rpi_image_builder_object_key = event['ResourceProperties']['CONFIGURED_RPI_IMAGE_BUILDER_OBJECT_KEY']
    greengrass_token_exchange_role_alias = event['ResourceProperties']['GREENGRASS_TOKEN_EXCHANGE_ROLE_ALIAS']

    request_type = event['RequestType']
    if request_type == 'Create' or request_type == 'Update':
        configure_rpi_image_builder(
            fleet_provisioning_policy_name,
            provisioning_template_name,
            greengrass_region,
            greengrass_group_name,
            rpi_image_builder_bucket_name,
            rpi_image_builder_object_key,
            configured_rpi_image_builder_bucket_name,
            configured_rpi_image_builder_object_key,
            greengrass_token_exchange_role_alias
        )
    elif request_type == 'Delete':
        logger.info("Provisioning client deletion")
        # We should remove the client from the bucket here
        pass
    else:
        raise Exception("Invalid request type: %s" % request_type)
