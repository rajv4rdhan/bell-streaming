# CloudFormation Infrastructure

This folder contains modular CloudFormation templates for deploying the Bell Streaming application.

## Structure

- **main.yml** - Main orchestration stack that deploys nested stacks
- **network.yml** - VPC, subnets, Internet Gateway, route tables
- **security.yml** - Security groups
- **iam.yml** - IAM roles and instance profiles
- **compute.yml** - EC2 instance with user data
- **parameters.yml** - Reference for all parameters (not used directly)

## Deployment Options

### Option 1: Using Nested Stacks (Recommended for Production)

1. Upload all templates to an S3 bucket:
   ```bash
   aws s3 cp network.yml s3://YOUR-BUCKET/cloudformation/network.yml
   aws s3 cp security.yml s3://YOUR-BUCKET/cloudformation/security.yml
   aws s3 cp iam.yml s3://YOUR-BUCKET/cloudformation/iam.yml
   aws s3 cp compute.yml s3://YOUR-BUCKET/cloudformation/compute.yml
   ```

2. Deploy the main stack:
   ```bash
   aws cloudformation create-stack \
     --stack-name bell-streaming \
     --template-body file://main.yml \
     --capabilities CAPABILITY_IAM \
     --parameters \
       ParameterKey=KeyName,ParameterValue=your-key-name \
       ParameterKey=InstanceType,ParameterValue=t3.2xlarge \
       ParameterKey=MongoDbUri,ParameterValue=your-mongodb-uri \
       ParameterKey=JwtSecret,ParameterValue=your-jwt-secret \
       ParameterKey=JwtRefreshSecret,ParameterValue=your-jwt-refresh-secret \
       ParameterKey=AwsAccessKeyId,ParameterValue=your-access-key \
       ParameterKey=AwsSecretAccessKey,ParameterValue=your-secret-key \
       ParameterKey=S3BucketName,ParameterValue=your-s3-bucket \
       ParameterKey=TemplatesBucketName,ParameterValue=YOUR-BUCKET
   ```

### Option 2: Deploy Individual Stacks

Deploy each stack in order:

```bash
# 1. Network Stack
aws cloudformation create-stack \
  --stack-name bell-streaming-network \
  --template-body file://network.yml

# 2. Security Stack
aws cloudformation create-stack \
  --stack-name bell-streaming-security \
  --template-body file://security.yml \
  --parameters \
    ParameterKey=VPCId,ParameterValue=$(aws cloudformation describe-stacks --stack-name bell-streaming-network --query 'Stacks[0].Outputs[?OutputKey==`VPCId`].OutputValue' --output text)

# 3. IAM Stack
aws cloudformation create-stack \
  --stack-name bell-streaming-iam \
  --template-body file://iam.yml \
  --capabilities CAPABILITY_IAM

# 4. Compute Stack
aws cloudformation create-stack \
  --stack-name bell-streaming-compute \
  --template-body file://compute.yml \
  --parameters \
    ParameterKey=KeyName,ParameterValue=your-key-name \
    ParameterKey=SubnetId,ParameterValue=$(aws cloudformation describe-stacks --stack-name bell-streaming-network --query 'Stacks[0].Outputs[?OutputKey==`PublicSubnetId`].OutputValue' --output text) \
    ParameterKey=SecurityGroupId,ParameterValue=$(aws cloudformation describe-stacks --stack-name bell-streaming-security --query 'Stacks[0].Outputs[?OutputKey==`SecurityGroupId`].OutputValue' --output text) \
    ParameterKey=InstanceProfile,ParameterValue=$(aws cloudformation describe-stacks --stack-name bell-streaming-iam --query 'Stacks[0].Outputs[?OutputKey==`InstanceProfileName`].OutputValue' --output text) \
    # ... other parameters
```

## Required Parameters

- **KeyName**: EC2 Key Pair name for SSH access
- **InstanceType**: EC2 instance type (default: t3.2xlarge)
- **MongoDbUri**: MongoDB connection string
- **JwtSecret**: JWT secret key
- **JwtRefreshSecret**: JWT refresh secret key
- **AwsAccessKeyId**: AWS access key for S3
- **AwsSecretAccessKey**: AWS secret key for S3
- **S3BucketName**: S3 bucket for video storage

## Outputs

After deployment, you'll receive:
- Instance Public IP
- Nginx URL (port 8081)
- Grafana URL (port 3000)
- Prometheus URL (port 9090)
- cAdvisor URL (port 8080)
- SSH command

## Clean Up

```bash
# If using nested stacks
aws cloudformation delete-stack --stack-name bell-streaming

# If using individual stacks (delete in reverse order)
aws cloudformation delete-stack --stack-name bell-streaming-compute
aws cloudformation delete-stack --stack-name bell-streaming-iam
aws cloudformation delete-stack --stack-name bell-streaming-security
aws cloudformation delete-stack --stack-name bell-streaming-network
```
