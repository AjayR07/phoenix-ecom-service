#!/bin/bash

# Deployment script for ecom-service

set -e

STAGE=${1:-dev}
REGION=${2:-us-east-1}

echo "Deploying ecom-service to stage: $STAGE, region: $REGION"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "Error: AWS CLI not configured. Please run 'aws configure'"
    exit 1
fi

# Check if Serverless Framework is installed
if ! command -v serverless &> /dev/null; then
    echo "Installing Serverless Framework..."
    npm install -g serverless
fi

# Create SSM parameters for sensitive data
echo "Setting up SSM parameters..."

# Prompt for database password
read -s -p "Enter database password: " DB_PASSWORD
echo

# Prompt for New Relic license key
read -s -p "Enter New Relic license key: " NEWRELIC_KEY
echo

# Store parameters in SSM
aws ssm put-parameter \
    --name "/ecom-service/$STAGE/db-password" \
    --value "$DB_PASSWORD" \
    --type "SecureString" \
    --overwrite \
    --region $REGION

aws ssm put-parameter \
    --name "/ecom-service/$STAGE/newrelic-license-key" \
    --value "$NEWRELIC_KEY" \
    --type "SecureString" \
    --overwrite \
    --region $REGION

echo "SSM parameters created successfully"

# Deploy infrastructure
echo "Deploying infrastructure..."
DB_PASSWORD="$DB_PASSWORD" NEWRELIC_KEY="$NEWRELIC_KEY" serverless deploy --stage $STAGE --region $REGION

# Get EC2 instance details
EC2_IP=$(aws cloudformation describe-stacks \
    --stack-name ecom-service-$STAGE \
    --query 'Stacks[0].Outputs[?OutputKey==`EC2PublicIP`].OutputValue' \
    --output text \
    --region $REGION)

echo "Infrastructure deployed successfully!"
echo "EC2 Public IP: $EC2_IP"
echo ""
echo "Next steps:"
echo "1. SSH into the EC2 instance: ssh -i ~/.ssh/ecom-service-$STAGE-key.pem ec2-user@$EC2_IP"
echo "2. Deploy your application code to /opt/ecom-service"
echo "3. Run: npm install && npm run db:migrate && npm run db:seed && pm2 start index.js"
echo "4. Access your application at: http://$EC2_IP:3000"