# Bell Streaming Platform - ECS CloudFormation

This directory contains AWS CloudFormation templates for deploying the Bell Streaming Platform on Amazon ECS (Elastic Container Service) with Fargate.

## Architecture

- **ECS Fargate**: Serverless container orchestration
- **Application Load Balancer**: Distributes traffic to services
- **CloudWatch Logs**: Centralized logging
- **Docker Hub**: Container images source
- **VPC**: Network isolation with public subnets across 2 AZs

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **Docker Hub Account** with your images pushed:
   - `{username}/bell-auth-service:latest`
   - `{username}/bell-video-metadata-service:latest`
   - `{username}/bell-video-upload-service:latest`
   - `{username}/bell-streaming-service:latest`
   - `{username}/bell-thumbnail-generator:latest`
   - `{username}/bell-nginx:latest`

3. **Environment Secrets**:
   - MongoDB URI
   - JWT Secret
   - Cloudflare Tunnel Token
   - AWS credentials (for S3)

## Docker Images

### Build and Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Build and tag images
docker build -f packages/auth-service/Dockerfile -t {username}/bell-auth-service:latest .
docker build -f packages/video-metadata-service/Dockerfile -t {username}/bell-video-metadata-service:latest .
docker build -f packages/video-upload-service/Dockerfile -t {username}/bell-video-upload-service:latest .
docker build -f packages/streaming-service/Dockerfile -t {username}/bell-streaming-service:latest .
docker build -f packages/thumbnail-generator/Dockerfile -t {username}/bell-thumbnail-generator:latest .
docker build -f nginx/Dockerfile -t {username}/bell-nginx:latest .

# Push images
docker push {username}/bell-auth-service:latest
docker push {username}/bell-video-metadata-service:latest
docker push {username}/bell-video-upload-service:latest
docker push {username}/bell-streaming-service:latest
docker push {username}/bell-thumbnail-generator:latest
docker push {username}/bell-nginx:latest
```

## Deployment Steps

### 1. Upload Templates to S3

```bash
# Create S3 bucket for templates
aws s3 mb s3://bell-streaming-cfn-templates

# Upload templates
aws s3 cp network.yml s3://bell-streaming-cfn-templates/ecs/
aws s3 cp security.yml s3://bell-streaming-cfn-templates/ecs/
aws s3 cp ecs-cluster.yml s3://bell-streaming-cfn-templates/ecs/
aws s3 cp main.yml s3://bell-streaming-cfn-templates/ecs/
```

### 2. Deploy Stack

```bash
aws cloudformation create-stack \
  --stack-name bell-streaming-ecs \
  --template-body file://main.yml \
  --parameters \
    ParameterKey=DockerHubUsername,ParameterValue=rajv4rdhan \
    ParameterKey=ImageTag,ParameterValue=latest \
    ParameterKey=MongoDBURI,ParameterValue="mongodb+srv://..." \
    ParameterKey=JWTSecret,ParameterValue="your-jwt-secret" \
    ParameterKey=CloudflareTunnelToken,ParameterValue="your-token" \
  --capabilities CAPABILITY_IAM
```

### 3. Monitor Deployment

```bash
# Watch stack creation
aws cloudformation describe-stacks --stack-name bell-streaming-ecs

# Get outputs
aws cloudformation describe-stacks \
  --stack-name bell-streaming-ecs \
  --query 'Stacks[0].Outputs' \
  --output table
```

## Stack Outputs

- **ClusterName**: ECS cluster name
- **LoadBalancerDNS**: ALB DNS name for accessing the application
- **LoadBalancerURL**: Full HTTP URL to the application

## Services Deployed

1. **auth-service** (Port 3001)
2. **video-metadata-service** (Port 3002)
3. **streaming-service** (Port 3003)
4. **video-upload-service** (Port 3004)
5. **thumbnail-generator** (Port 8080)
6. **nginx** (Port 80) - Frontend proxy
7. **cloudflared** - Cloudflare tunnel

## Cost Optimization

- **Fargate Spot**: Consider using Fargate Spot for non-critical services
- **Auto Scaling**: Configure based on CPU/Memory metrics
- **Reserved Capacity**: For production workloads

## Update Stack

```bash
aws cloudformation update-stack \
  --stack-name bell-streaming-ecs \
  --template-body file://main.yml \
  --parameters \
    ParameterKey=DockerHubUsername,UsePreviousValue=true \
    ParameterKey=ImageTag,ParameterValue=v2.0 \
  --capabilities CAPABILITY_IAM
```

## Delete Stack

```bash
aws cloudformation delete-stack --stack-name bell-streaming-ecs
```

## Troubleshooting

### Check Service Status
```bash
aws ecs describe-services \
  --cluster bell-streaming-cluster \
  --services auth-service video-metadata-service
```

### View Logs
```bash
aws logs tail /ecs/bell-streaming/auth-service --follow
```

### Check Task Health
```bash
aws ecs list-tasks --cluster bell-streaming-cluster
aws ecs describe-tasks --cluster bell-streaming-cluster --tasks {task-arn}
```

## Service Discovery

For service-to-service communication in ECS, use AWS Cloud Map or configure nginx to route based on ALB target groups.

## Security Best Practices

1. Use AWS Secrets Manager for sensitive data
2. Enable VPC Flow Logs
3. Implement WAF rules on ALB
4. Use private subnets for services (update template)
5. Enable ECS Exec for debugging only

## Notes

- All services run on Fargate (serverless)
- Logs are retained for 7 days in CloudWatch
- Public IPs are assigned for internet access
- For production, consider using private subnets with NAT Gateway
- Update Cloudflare tunnel to point to ALB DNS or use AWS-issued certificate
