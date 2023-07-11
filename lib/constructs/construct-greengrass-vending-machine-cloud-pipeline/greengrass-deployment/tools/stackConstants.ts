
export const greengrassCoreMinimalIoTPolicy = `{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["iot:Connect"],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": ["iot:Receive", "iot:Publish"],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": ["iot:Subscribe"],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": ["iot:GetThingShadow", "iot:UpdateThingShadow", "iot:DeleteThingShadow"],
            "Resource": ["arn:aws:iot:<%= region %>:<%= account %>:thing/<%= thingname %>*"]
        },
        {
            "Effect": "Allow",
            "Action": "iot:AssumeRoleWithCertificate",
            "Resource": "arn:aws:iot:<%= region %>:<%= account %>:rolealias/<%= rolealiasname %>"
        },
        {
            "Effect": "Allow",
            "Action": ["greengrass:GetComponentVersionArtifact", "greengrass:ResolveComponentCandidates", "greengrass:GetDeploymentConfiguration"],
            "Resource": "*"
        }
    ]
}`;