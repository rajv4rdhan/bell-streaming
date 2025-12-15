# Monitoring Stack - Grafana, Prometheus & Loki

This project includes a complete monitoring stack for the Bell Streaming platform.

## Components

### 1. **Grafana** (Port 3000)
- Web-based analytics and monitoring dashboard
- Default credentials: `admin` / `admin123`
- Access: http://localhost:3000

### 2. **Prometheus** (Port 9090)
- Time-series database for metrics collection
- Access: http://localhost:9090

### 3. **Loki** (Port 3100)
- Log aggregation system
- Access: http://localhost:3100

### 4. **Promtail**
- Log shipping agent that scrapes Docker container logs
- Sends logs to Loki

### 5. **cAdvisor** (Port 8080)
- Container metrics collector
- Access: http://localhost:8080

## Quick Start

### Start the entire stack:
```bash
docker-compose up -d
```

### Start only monitoring services:
```bash
docker-compose up -d prometheus loki promtail grafana cadvisor
```

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f grafana
docker-compose logs -f prometheus
docker-compose logs -f loki
```

### Stop the stack:
```bash
docker-compose down
```

### Remove volumes (clean restart):
```bash
docker-compose down -v
```

## Accessing Grafana

1. Open http://localhost:3000
2. Login with `admin` / `admin123`
3. Datasources are automatically configured:
   - **Prometheus** - Metrics
   - **Loki** - Logs

## Using Grafana

### View Logs (Loki)

1. Go to **Explore** (compass icon in left sidebar)
2. Select **Loki** datasource
3. Use LogQL queries:
   ```
   # All logs from video-upload-service
   {container="video-upload-service-1"}
   
   # Error logs only
   {container="video-upload-service-1"} |= "error"
   
   # Filter by service label
   {service="video-upload-service"}
   
   # Logs from multiple services
   {service=~"video-.*"}
   ```

### View Metrics (Prometheus)

1. Go to **Explore**
2. Select **Prometheus** datasource
3. Use PromQL queries:
   ```
   # Container CPU usage
   rate(container_cpu_usage_seconds_total[5m])
   
   # Container memory usage
   container_memory_usage_bytes
   
   # Network I/O
   rate(container_network_receive_bytes_total[5m])
   ```

### Import Dashboards

1. Click **+** → **Import** (or go to Dashboards → Import)
2. Enter dashboard ID:
   - **193** - Docker Containers
   - **1860** - Node Exporter Full
   - **12633** - Loki Dashboard
   - **893** - Docker and System Monitoring

## Configuration Files

```
monitoring/
├── prometheus/
│   └── prometheus.yml          # Prometheus configuration
├── loki/
│   └── loki-config.yml         # Loki configuration
├── promtail/
│   └── promtail-config.yml     # Promtail configuration
└── grafana/
    └── provisioning/
        ├── datasources/
        │   └── datasources.yml # Auto-configured datasources
        └── dashboards/
            └── dashboard.yml   # Dashboard provider config
```

## Adding Metrics to Your Services

To expose metrics from your Node.js services:

### 1. Install prom-client
```bash
npm install prom-client
```

### 2. Create metrics middleware
```typescript
// src/middleware/metrics.ts
import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.path, res.statusCode.toString())
      .observe(duration);
  });
  next();
};

export const metricsEndpoint = async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};
```

### 3. Add to your Express app
```typescript
import { metricsMiddleware, metricsEndpoint } from './middleware/metrics';

app.use(metricsMiddleware);
app.get('/metrics', metricsEndpoint);
```

### 4. Update prometheus.yml
Uncomment the service in `monitoring/prometheus/prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'video-upload-service'
    static_configs:
      - targets: ['video-upload-service:3004']
    metrics_path: '/metrics'
```

### 5. Restart Prometheus
```bash
docker-compose restart prometheus
```

## Troubleshooting

### Grafana can't connect to datasources
```bash
# Check if services are running
docker-compose ps

# Check Grafana logs
docker-compose logs grafana

# Verify network connectivity
docker-compose exec grafana ping prometheus
docker-compose exec grafana ping loki
```

### Promtail not collecting logs
```bash
# Check Promtail logs
docker-compose logs promtail

# Verify Docker socket is mounted
docker-compose exec promtail ls -la /var/run/docker.sock
```

### Prometheus not scraping targets
1. Open http://localhost:9090/targets
2. Check target status
3. Verify service names in prometheus.yml match docker-compose service names

## Data Retention

### Prometheus
- Default: 15 days
- To change, add to prometheus command:
  ```yaml
  command:
    - '--storage.tsdb.retention.time=30d'
  ```

### Loki
- Configured in `loki-config.yml`
- Adjust `retention_period` in the config

## Security Notes

⚠️ **Important for Production:**

1. Change Grafana admin password
2. Use proper authentication for Prometheus/Loki
3. Consider using SSL/TLS
4. Restrict access with firewalls
5. Use secrets management for sensitive data

## Resources

- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [LogQL Query Language](https://grafana.com/docs/loki/latest/logql/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
