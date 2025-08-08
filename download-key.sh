#!/bin/bash

STAGE=${1:-dev}
REGION=${2:-us-east-1}

echo "Downloading EC2 key pair for stage: $STAGE"

# Get the key pair material from AWS
aws ec2 describe-key-pairs \
    --key-names "ecom-service-$STAGE-key" \
    --query 'KeyPairs[0].KeyPairId' \
    --output text \
    --region $REGION > /dev/null

if [ $? -eq 0 ]; then
    # Create SSH directory if it doesn't exist
    mkdir -p ~/.ssh
    
    # Get the private key material
    aws ssm get-parameter \
        --name "/ec2/keypair/$(aws ec2 describe-key-pairs --key-names "ecom-service-$STAGE-key" --query 'KeyPairs[0].KeyPairId' --output text --region $REGION)" \
        --with-decryption \
        --query 'Parameter.Value' \
        --output text \
        --region $REGION > ~/.ssh/ecom-service-$STAGE-key.pem
    
    # Set proper permissions
    chmod 400 ~/.ssh/ecom-service-$STAGE-key.pem
    
    echo "Key downloaded to: ~/.ssh/ecom-service-$STAGE-key.pem"
else
    echo "Error: Key pair not found. Make sure infrastructure is deployed first."
    exit 1
fi