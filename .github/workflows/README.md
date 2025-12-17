# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Workflows

### 1. Build and Push (`build-push.yml`)

Builds and pushes Docker images to Docker Hub.

**Triggers:**
- Push to `main` or `develop` branches (when service files change)
- Pull requests to `main` or `develop`
- Manual trigger via workflow_dispatch

**Features:**
- Automatic change detection per service
- Only builds services that have changes
- Supports building all services or specific ones via manual trigger
- Multi-platform support (linux/amd64)
- Docker layer caching for faster builds
- Automatic tagging (latest, branch name, PR number, SHA)

**Required Secrets:**
- `DOCKER_PASSWORD` - Docker Hub password/token

**Manual Trigger:**
```bash
# Via GitHub UI: Actions > Build and Push Docker Images > Run workflow
# Or via GitHub CLI:
gh workflow run build-push.yml -f services=all
gh workflow run build-push.yml -f services=nginx,auth-service
```

### 2. Deploy CloudFormation (`deploy-cloudformation.yml`)

Deploys infrastructure to AWS using CloudFormation.

**Triggers:**
- Manual trigger only (workflow_dispatch)

**Features:**
- Creates, updates, or deletes CloudFormation stacks
- Uploads templates to S3 automatically
- Configurable stack name, instance type, and region
- Displays stack outputs after deployment

**Required Secrets:**
- `AWS_ACCESS_KEY_ID` - AWS access key for CloudFormation
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for CloudFormation
- `EC2_KEY_NAME` - EC2 key pair name
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `AWS_S3_ACCESS_KEY_ID` - AWS access key for S3 (application)
- `AWS_S3_SECRET_ACCESS_KEY` - AWS secret key for S3 (application)
- `S3_BUCKET_NAME` - S3 bucket for video storage
- `FREEPIK_API_KEY` - Freepik API key (optional)
- `WEBHOOK_URL` - Webhook URL (optional)

**Manual Trigger:**
```bash
# Create stack
gh workflow run deploy-cloudformation.yml \
  -f stack-name=bell-streaming \
  -f action=create \
  -f instance-type=t3.2xlarge \
  -f region=us-east-1

# Update stack
gh workflow run deploy-cloudformation.yml \
  -f stack-name=bell-streaming \
  -f action=update

# Delete stack
gh workflow run deploy-cloudformation.yml \
  -f stack-name=bell-streaming \
  -f action=delete
```

## Setting Up Secrets

Add these secrets in GitHub repository settings:

1. Go to Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Add each required secret

## Complete Deployment Flow

1. **Build and Push Images:**
   ```bash
   # Automatically triggered on push to main/develop
   # Or manually trigger to rebuild all images
   gh workflow run build-push.yml -f services=all
   ```

2. **Deploy Infrastructure:**
   ```bash
   # Create new stack
   gh workflow run deploy-cloudformation.yml \
     -f stack-name=bell-streaming-prod \
     -f action=create \
     -f instance-type=t3.2xlarge \
     -f region=us-east-1
   ```

3. **Update Stack (after code changes):**
   ```bash
   # Images are automatically rebuilt on push
   # Then update the stack to pull new images
   gh workflow run deploy-cloudformation.yml \
     -f stack-name=bell-streaming-prod \
     -f action=update
   ```

## Monitoring Workflows

- View workflow runs: `gh run list`
- Watch a workflow: `gh run watch`
- View logs: `gh run view <run-id> --log`

## Best Practices

1. **Use environment-specific stacks:** 
   - `bell-streaming-dev`
   - `bell-streaming-staging`
   - `bell-streaming-prod`

2. **Test in dev first:**
   - Deploy to dev stack first
   - Verify functionality
   - Then deploy to staging/prod

3. **Use semantic versioning for releases:**
   - Tag releases: `git tag v1.0.0`
   - Push tags: `git push --tags`
   - Images will be tagged with version

4. **Monitor deployments:**
   - Check GitHub Actions logs
   - Monitor CloudFormation events in AWS Console
   - Check EC2 instance logs via SSH or CloudWatch
