# Bell Streaming 🎥 

> **Note:** This is an academic project designed to demonstrate a scalable, microservices-based architecture for a video streaming platform.

Bell Streaming is a comprehensive video streaming platform built with a modern tech stack. It features a distributed microservices architecture, infrastructure as code (IaC), container orchestration, and comprehensive monitoring capabilities.

## 🏗 Architecture & Tech Stack

This project is managed as a monorepo using npm workspaces and Nx, divided into several independent modules.

### Frontend 🖥️
- **Admin UI**: Dashboard for content management (Vite/React).
- **Frontend UI**: User-facing application for browsing and viewing videos (Vite/React).
- **Shared UI**: Shared component library for consistent design across frontends.

### Backend Microservices ⚙️
- **Auth Service**: Manages user authentication and authorization (Node.js).
- **Video Metadata Service**: Handles video details, search, and categorization (Node.js).
- **Video Upload Service**: Manages video ingestion and raw file storage (Node.js).
- **Streaming Service**: Delivers video content to clients (Node.js).
- **API Gateway**: Nginx reverse proxy and load balancer.

### Infrastructure & DevOps 🚀
- **Containerization**: Docker & Docker Compose (`docker-compose.yml`) for local development and testing.
- **Orchestration**: Kubernetes manifests (`kubernetes/` folder) for scalable deployments.
- **Public Cloud (AWS)**: CloudFormation templates (`infra/`) to provision infrastructure on EC2 and ECS.
- **CI/CD**: Automated build and push pipelines via GitHub Actions.

### Observability & Monitoring 📊
Located in the `monitoring/` directory:
- **Metrics**: Prometheus
- **Log Aggregation**: Grafana Loki & Promtail
- **Telemetry Collector**: Grafana Alloy
- **Visualization**: Grafana 

## 📂 Project Structure

```text
bellStreaming/
├── .github/              # CI/CD Workflows
├── infra/                # AWS CloudFormation templates (EC2 & ECS)
├── kubernetes/           # Kubernetes deployment manifests
├── monitoring/           # Prometheus, Grafana, Loki, and Alloy configs
├── nginx/                # API Gateway configuration
├── packages/             # Monorepo workspaces
│   ├── admin-ui/
│   ├── auth-service/
│   ├── frontend-ui/
│   ├── shared-ui/
│   ├── streaming-service/
│   ├── video-metadata-service/
│   └── video-upload-service/
├── scripts/              # Build and deployment utilities
├── docker-compose.*.yml  # Docker Compose files for different environments
└── package.json          # Root configuration and workspace scripts
```

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### Setup

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Build all packages:**
   ```bash
   npm run build:all
   ```

3. **Run the application:**
   The recommended way to boot the entire stack (including monitoring and database dependencies) is using Docker Compose:
   ```bash
   npm run dev:compose
   # which runs: docker compose up --build -d
   ```
   
   *Alternatively, run services locally (useful for debugging):*
   ```bash
   npm run dev:all    # Runs all backend & frontend services concurrently
   ```

## ☁️ Deployment

Deployment configurations are included for multiple targets:
1. **Docker Compose**: `docker-compose.yml` for local testing.
2. **Kubernetes**: Run `kubectl apply -f kubernetes/` to deploy the microservices architecture on any K8s cluster.
3. **AWS CloudFormation**: Navigate to `infra/dev/` or `infra/prod/` to provision resources using EC2 or ECS templates.

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) (if available) for more detailed cloud deployment instructions.

## 📝 License
MIT