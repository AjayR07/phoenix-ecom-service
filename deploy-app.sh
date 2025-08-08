#!/bin/bash

# Application deployment script for EC2 instance

set -e

STAGE=${1:-dev}
REGION=${2:-us-east-1}
EC2_IP=${3}

if [ -z "$EC2_IP" ]; then
    # Get EC2 IP from CloudFormation stack
    EC2_IP=$(aws cloudformation describe-stacks \
        --stack-name ecom-service-$STAGE \
        --query 'Stacks[0].Outputs[?OutputKey==`EC2PublicIP`].OutputValue' \
        --output text \
        --region $REGION)
fi

echo "Deploying application to EC2 instance: $EC2_IP"

# Create deployment package
echo "Creating deployment package..."
tar -czf ecom-service.tar.gz \
    --exclude=node_modules \
    --exclude=.idea \
    --exclude=.serverless \
    --exclude=.git \
    --exclude=logs \
    --exclude=*.log \
    --exclude=ecom-service.tar.gz \
    .

# Copy files to EC2
echo "Copying files to EC2..."
scp -i ~/.ssh/ecom-service-$STAGE-key.pem ecom-service.tar.gz ec2-user@$EC2_IP:/tmp/

# Deploy on EC2
echo "Deploying on EC2..."
ssh -i ~/.ssh/ecom-service-$STAGE-key.pem ec2-user@$EC2_IP << 'EOF'
    # Install Node.js manually for Amazon Linux 2
    if ! command -v node &> /dev/null; then
        curl -fsSL https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.xz | sudo tar -xJ -C /usr/local --strip-components=1
        sudo ln -sf /usr/local/bin/node /usr/bin/node
        sudo ln -sf /usr/local/bin/npm /usr/bin/npm
    fi
    
    # Create app directory if it doesn't exist
    sudo mkdir -p /opt/ecom-service
    sudo chown ec2-user:ec2-user /opt/ecom-service
    
    # Extract new code
    cd /opt/ecom-service
    tar --no-xattrs --no-same-owner -xzf /tmp/ecom-service.tar.gz 2>/dev/null || tar -xzf /tmp/ecom-service.tar.gz
    
    # Install dependencies
    npm install --production
    
    # Run database migrations and seeds
    npm run db:migrate
    npm run db:seed
    
    # Start application directly with nohup
    pkill -f "node index.js" || true
    nohup node index.js > app.log 2>&1 &
    
    echo "Application deployed successfully!"
    echo "Application is running on port 3000"
EOF

# Cleanup
rm ecom-service.tar.gz

echo "Deployment completed!"
echo "Application URL: http://$EC2_IP:3000"