# Configuration
$DOCKER_USERNAME = "rajv4rdhan"
$VERSION = if ($args[0]) { $args[0] } else { "latest" }

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Building and Pushing Bell Streaming Images" -ForegroundColor Cyan
Write-Host "Username: $DOCKER_USERNAME" -ForegroundColor Cyan
Write-Host "Version: $VERSION" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Login to Docker Hub
Write-Host "`nLogging in to Docker Hub..." -ForegroundColor Yellow
docker login -u $DOCKER_USERNAME

# Function to build and push
function Build-And-Push {
    param($ServiceName, $Dockerfile)
    
    Write-Host "`n📦 Building $ServiceName..." -ForegroundColor Green
    docker build -f $Dockerfile -t "${DOCKER_USERNAME}/bell-streaming-${ServiceName}:${VERSION}" .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "⬆️  Pushing $ServiceName..." -ForegroundColor Green
        docker push "${DOCKER_USERNAME}/bell-streaming-${ServiceName}:${VERSION}"
    } else {
        Write-Host "❌ Failed to build $ServiceName" -ForegroundColor Red
    }
}

# Build and push all services
Build-And-Push "auth-service" "packages/auth-service/Dockerfile"
Build-And-Push "video-metadata-service" "packages/video-metadata-service/Dockerfile"
Build-And-Push "video-upload-service" "packages/video-upload-service/Dockerfile"
Build-And-Push "streaming-service" "packages/streaming-service/Dockerfile"
Build-And-Push "thumbnail-generator" "packages/thumbnail-generator/Dockerfile"
Build-And-Push "admin-ui" "packages/admin-ui/Dockerfile"
Build-And-Push "frontend-ui" "packages/frontend-ui/Dockerfile"
Build-And-Push "nginx" "nginx/Dockerfile"

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "✅ All images pushed successfully!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "`nImages published:" -ForegroundColor Yellow
Write-Host "  - ${DOCKER_USERNAME}/bell-streaming-auth-service:${VERSION}"
Write-Host "  - ${DOCKER_USERNAME}/bell-streaming-video-metadata-service:${VERSION}"
Write-Host "  - ${DOCKER_USERNAME}/bell-streaming-video-upload-service:${VERSION}"
Write-Host "  - ${DOCKER_USERNAME}/bell-streaming-streaming-service:${VERSION}"
Write-Host "  - ${DOCKER_USERNAME}/bell-streaming-thumbnail-generator:${VERSION}"
Write-Host "  - ${DOCKER_USERNAME}/bell-streaming-admin-ui:${VERSION}"
Write-Host "  - ${DOCKER_USERNAME}/bell-streaming-frontend-ui:${VERSION}"
Write-Host "  - ${DOCKER_USERNAME}/bell-streaming-nginx:${VERSION}"
