# Deployment Guide

## Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **Node.js and npm** installed
3. **Serverless Framework** (will be installed automatically)

## Quick Deployment

### 1. Deploy Infrastructure
```bash
# Deploy to dev environment
./deploy.sh dev us-east-1

# Deploy to production
./deploy.sh prod us-east-1
```

### 2. Deploy Application
```bash
# Deploy app to dev environment
./deploy-app.sh dev us-east-1

# Deploy app to production
./deploy-app.sh prod us-east-1
```

## Manual Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Deploy Infrastructure
```bash
serverless deploy --stage dev --region us-east-1
```

### 3. SSH into EC2 and Deploy App
```bash
# Get EC2 IP from AWS Console or CloudFormation outputs
ssh -i ~/.ssh/ecom-service-dev-key.pem ec2-user@<EC2_IP>

# On EC2 instance:
cd /opt/ecom-service
# Upload your code here
npm install --production
npm run db:migrate
npm run db:seed
pm2 start index.js --name ecom-service
```

## Infrastructure Components

- **VPC** with public/private subnets
- **EC2 instance** (t3.micro) in public subnet
- **RDS MySQL** (db.t3.micro) in private subnet
- **Security Groups** for EC2 and RDS
- **SSM Parameters** for sensitive data

## Environment Variables

The following environment variables are automatically configured:
- `DB_HOST` - RDS endpoint
- `DB_USER` - Database username
- `DB_PASSWORD` - From SSM Parameter Store
- `DB_NAME` - Database name
- `NEW_RELIC_LICENSE_KEY` - From SSM Parameter Store

## Cleanup

```bash
serverless remove --stage dev --region us-east-1
```