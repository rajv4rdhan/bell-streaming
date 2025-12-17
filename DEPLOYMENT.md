# Bell Streaming Platform Deployment

This repository contains the deployment configuration and documentation for the Bell Streaming Platform Docker images.

## Overview

The Bell Streaming Platform is a modular, scalable solution for video streaming, including authentication, video metadata management, video upload, streaming, thumbnail generation, and an NGINX reverse proxy.

## Docker Images

- **auth-service**: Handles authentication and user management.
- **video-metadata-service**: Manages video metadata and related operations.
- **video-upload-service**: Handles video uploads and storage.
- **streaming-service**: Streams video content to users.
- **thumbnail-generator**: Generates video thumbnails.
- **nginx**: Serves as a reverse proxy for the platform services.

## Usage

Each service is available as a Docker image on Docker Hub under the `rajv4rdhan/bell-streaming-<service>` naming convention. See the documentation for each service for more details.

---

_This file is used to update the Docker Hub description via GitHub Actions._
