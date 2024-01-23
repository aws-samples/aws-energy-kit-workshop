const awsConfig = {
    "aws_project_region": import.meta.env.VITE_REGION,
    "aws_cognito_region": import.meta.env.VITE_REGION,
    "aws_cognito_identity_pool_id": import.meta.env.VITE_IDENTITY_POOL_ID,
    "aws_user_pools_id": import.meta.env.VITE_USER_POOL_ID,
    "aws_user_pools_web_client_id": import.meta.env.VITE_USER_POOL_WEB_CLIENT_ID,
    "oauth": {},
    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_social_providers": [],
    "aws_cognito_signup_attributes": [
        "EMAIL"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [
        "SMS"
    ],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": []
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ],
    "aws_pubsub_region": import.meta.env.VITE_REGION,
    "aws_pubsub_endpoint": `wss://${import.meta.env.VITE_IOT_ENDPOINT}/mqtt`,
    "pubSubPolicyName": import.meta.env.VITE_PUB_SUB_POLICY_NAME,
    "commandTopic": import.meta.env.VITE_IOT_PUB_TOPIC.replace("/+", "/all/simulate"),
    "telemetryTopic": import.meta.env.VITE_IOT_SUB_TOPIC,
    "telemetryListLength": parseInt(import.meta.env.VITE_TELEMETRY_LIST_LENGTH),
    "amplifyAppId": import.meta.env.VITE_AMPLIFY_APP_ID,
    "amplifyRepoName": import.meta.env.VITE_AMPLIFY_REPO_NAME,
};

export default awsConfig;
