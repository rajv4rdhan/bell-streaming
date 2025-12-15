#!/bin/bash

# Configuration
DOCKER_USERNAME="rajv4rdhan"
VERSION="${1:-latest}"

echo "========================================="
echo "Building and Pushing Bell Streaming Images"
echo "Username: $DOCKER_USERNAME"
echo "Version: $VERSION"
echo "========================================="

# Login to Docker Hub
echo "Logging in to Docker Hub..."
docker login -u $DOCKER_USERNAME

# Build and push auth-service
echo ""
echo "📦 Building auth-service..."
docker build -f packages/auth-service/Dockerfile -t $DOCKER_USERNAME/bell-streaming-auth-service:$VERSION .
echo "⬆️  Pushing auth-service..."
docker push $DOCKER_USERNAME/bell-streaming-auth-service:$VERSION

# Build and push video-metadata-service
echo ""
echo "📦 Building video-metadata-service..."
docker build -f packages/video-metadata-service/Dockerfile -t $DOCKER_USERNAME/bell-streaming-video-metadata-service:$VERSION .
echo "⬆️  Pushing video-metadata-service..."
docker push $DOCKER_USERNAME/bell-streaming-video-metadata-service:$VERSION

# Build and push video-upload-service
echo ""
echo "📦 Building video-upload-service..."
docker build -f packages/video-upload-service/Dockerfile -t $DOCKER_USERNAME/bell-streaming-video-upload-service:$VERSION .
echo "⬆️  Pushing video-upload-service..."
docker push $DOCKER_USERNAME/bell-streaming-video-upload-service:$VERSION

# Build and push streaming-service
echo ""
echo "📦 Building streaming-service..."
docker build -f packages/streaming-service/Dockerfile -t $DOCKER_USERNAME/bell-streaming-streaming-service:$VERSION .
echo "⬆️  Pushing streaming-service..."
docker push $DOCKER_USERNAME/bell-streaming-streaming-service:$VERSION

# Build and push thumbnail-generator
echo ""
echo "📦 Building thumbnail-generator..."
docker build -f packages/thumbnail-generator/Dockerfile -t $DOCKER_USERNAME/bell-streaming-thumbnail-generator:$VERSION .
echo "⬆️  Pushing thumbnail-generator..."
docker push $DOCKER_USERNAME/bell-streaming-thumbnail-generator:$VERSION

# Build and push admin-ui
echo ""
echo "📦 Building admin-ui..."
docker build -f packages/admin-ui/Dockerfile -t $DOCKER_USERNAME/bell-streaming-admin-ui:$VERSION .
echo "⬆️  Pushing admin-ui..."
docker push $DOCKER_USERNAME/bell-streaming-admin-ui:$VERSION

# Build and push frontend-ui
echo ""
echo "📦 Building frontend-ui..."
docker build -f packages/frontend-ui/Dockerfile -t $DOCKER_USERNAME/bell-streaming-frontend-ui:$VERSION .
echo "⬆️  Pushing frontend-ui..."
docker push $DOCKER_USERNAME/bell-streaming-frontend-ui:$VERSION

# Build and push nginx
echo ""
echo "📦 Building nginx..."
docker build -f nginx/Dockerfile -t $DOCKER_USERNAME/bell-streaming-nginx:$VERSION .
echo "⬆️  Pushing nginx..."
docker push $DOCKER_USERNAME/bell-streaming-nginx:$VERSION

echo ""
echo "========================================="
echo "✅ All images pushed successfully!"
echo "========================================="
echo ""
echo "Images published:"
echo "  - $DOCKER_USERNAME/bell-streaming-auth-service:$VERSION"
echo "  - $DOCKER_USERNAME/bell-streaming-video-metadata-service:$VERSION"
echo "  - $DOCKER_USERNAME/bell-streaming-video-upload-service:$VERSION"
echo "  - $DOCKER_USERNAME/bell-streaming-streaming-service:$VERSION"
echo "  - $DOCKER_USERNAME/bell-streaming-thumbnail-generator:$VERSION"
echo "  - $DOCKER_USERNAME/bell-streaming-admin-ui:$VERSION"
echo "  - $DOCKER_USERNAME/bell-streaming-frontend-ui:$VERSION"
echo "  - $DOCKER_USERNAME/bell-streaming-nginx:$VERSION"
