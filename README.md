# Bell Streaming Monorepo

Microservices architecture for video streaming platform with authentication, metadata management, and secure video uploads.

## 🏗️ Architecture

### Services
1. **Auth Service** (Port 3001) - User authentication, JWT, RBAC
2. **Video Metadata Service** (Port 3002) - Video metadata CRUD, visibility, stats
3. **Video Upload Service** (Port 3003) - S3 presigned URLs, secure uploads

## 🚀 Quick Start

### Install All Dependencies
```bash
npm run install:all
```

### Run All Services Simultaneously
```bash
npm run dev:all
```

This will start all three services with color-coded output:
- 🔵 AUTH (Port 3001)
- 🟣 METADATA (Port 3002)
- 🟡 UPLOAD (Port 3003)

### Run Individual Services
```bash
# Auth service only
npm run dev:auth

# Metadata service only
npm run dev:metadata

# Upload service only
npm run dev:upload
```

### Build All Services
```bash
npm run build:all
```

## 📦 Services Overview

### 1. Auth Service (`:3001`)
- User registration & login
- JWT with refresh tokens
- Role-based access control (User, Moderator, Admin)
- Password hashing with bcrypt
- Zod validation

**Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/profile`
- `POST /api/auth/logout`

### 2. Video Metadata Service (`:3002`)
- Video metadata CRUD operations
- Visibility management (public/private)
- Upload status tracking
- Video statistics
- Admin-only access

**Endpoints:**
- `POST /api/videos` - Create video
- `GET /api/videos` - List all videos
- `GET /api/videos/:id` - Get video
- `PATCH /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video
- `PATCH /api/videos/:id/visibility` - Set visibility
- `PATCH /api/videos/:id/upload-status` - Update upload status
- `GET /api/videos/:id/stats` - Get statistics

### 3. Video Upload Service (`:3003`)
- S3 presigned URL generation
- Secure file upload validation
- File type & size verification
- Upload confirmation
- Admin-only access

**Endpoints:**
- `POST /api/uploads/presigned-url` - Get upload URL
- `POST /api/uploads/confirm` - Confirm upload
- `POST /api/uploads/failed` - Report failure

## 🔧 Environment Setup

Each service needs its own `.env` file. Copy from examples:

```bash
# Auth Service
cp packages/auth-service/.env.example packages/auth-service/.env

# Metadata Service
cp packages/video-metadata-service/.env.example packages/video-metadata-service/.env

# Upload Service
cp packages/video-upload-service/.env.example packages/video-upload-service/.env
```

### Required Configuration

**Auth Service:**
- MongoDB connection
- JWT secrets
- Port (3001)

**Metadata Service:**
- MongoDB connection
- JWT secret
- Port (3002)

**Upload Service:**
- AWS credentials (S3)
- JWT secret
- Video metadata service URL
- Port (3003)

## 🔄 Complete Workflow Example

### 1. User Registration & Login
```bash
# Register admin user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "secure123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'

# Login to get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "secure123"
  }'
```

### 2. Create Video Metadata
```bash
curl -X POST http://localhost:3002/api/videos \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Video",
    "description": "Test video",
    "tags": ["tutorial", "tech"]
  }'
```

### 3. Upload Video
```bash
# Get presigned URL
curl -X POST http://localhost:3003/api/uploads/presigned-url \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "<video-id-from-step-2>",
    "filename": "video.mp4",
    "contentType": "video/mp4",
    "fileSize": 104857600
  }'

# Upload to S3 using presigned URL
curl -X PUT "<presigned-url>" \
  -H "Content-Type: video/mp4" \
  --data-binary @video.mp4

# Confirm upload
curl -X POST http://localhost:3003/api/uploads/confirm \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "<video-id>",
    "s3Key": "<s3-key-from-presigned-response>"
  }'
```

### 4. Make Video Public
```bash
curl -X PATCH http://localhost:3002/api/videos/<video-id>/visibility \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"visibility": "public"}'
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Run all services with concurrently |
| `npm run dev:auth` | Run auth service only |
| `npm run dev:metadata` | Run metadata service only |
| `npm run dev:upload` | Run upload service only |
| `npm run build:all` | Build all services |
| `npm run install:all` | Install dependencies for all services |

## 🛠️ Technology Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Database:** MongoDB + Mongoose
- **Validation:** Zod
- **Authentication:** JWT + bcrypt
- **Cloud Storage:** AWS S3
- **Security:** Helmet, CORS, Rate Limiting
- **Monorepo:** npm workspaces

## 📚 Service Documentation

Detailed documentation for each service:
- [Auth Service](./packages/auth-service/README.md)
- [Video Metadata Service](./packages/video-metadata-service/README.md)
- [Video Upload Service](./packages/video-upload-service/README.md)

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing (bcrypt)
- File type validation (magic bytes)
- S3 presigned URLs
- Server-side encryption
- Rate limiting
- CORS protection
- Security headers (Helmet)
- Input validation (Zod)

## 🚦 Service Dependencies

```
Auth Service (3001)
    ↓
Metadata Service (3002) ← Upload Service (3003)
    ↓
MongoDB
```

Upload Service communicates with Metadata Service to update upload status.

## 🐛 Troubleshooting

### Services won't start
- Ensure MongoDB is running
- Check `.env` files are configured
- Verify ports 3001, 3002, 3003 are available

### Upload fails
- Verify AWS credentials in `.env`
- Check S3 bucket exists and has correct permissions
- Ensure CORS is configured on S3 bucket

### Authentication errors
- Ensure JWT_SECRET matches across services
- Check token expiration settings

## 📈 Next Steps

1. Set up monitoring and logging
2. Add CI/CD pipeline
3. Containerize with Docker
4. Add API Gateway
5. Implement caching (Redis)
6. Add video transcoding
7. Set up CDN for video delivery
8. Add WebSocket for real-time updates

You can build a **durable pipeline** around Kafka.

---

# ❌ **But this is NOT what sends progress to the user UI**

Kafka is for *backend workflow*, not *live UI updates*.

For UI progress: Redis Pub/Sub or WebSockets (covered earlier).

---

# ✅ **3. Analytics & User Behavior Tracking**

Every view event can be sent to Kafka:

```
video_played
video_paused
video_finished
buffering_time
device_type
watch_duration
```

Consumers can process this to:

* build viewer analytics
* compute trending videos
* feed ML models
* power recommendation systems

Big video sites (YouTube, Netflix, TikTok) do exactly this.

---

# ✅ **4. Logging + Event Auditing**

Kafka is perfect for **centralizing logs and events** from all microservices:

* service errors
* billing events
* CDN failures
* slow encoding jobs
* upload failures

Kafka stores them and lets systems consume them for:

* alerting
* dashboards
* anomaly detection

---

# ✅ **5. Recommendation Engine Pipeline**

Based on view events:

* "Users who watched X also watched Y"
* popular videos per region
* personalized feeds

A consumer reads events → updates a model → writes results to a DB.

---

# ✅ **6. CDN Cache Warm-up and Post-Processing**

When encoding finishes:

* emit event `video.ready`
* a CDN cache warmer prefetches video segments
* a notification service alerts followers/subscribers
* audit logs store the final event

Kafka decouples these steps.

---

# ✅ **7. Asset Lifecycle Management**

Useful when you need to handle:

* delete video across storage layers
* expire old media
* regenerate thumbnails
* move cold storage → hot storage

Kafka helps coordinate these workflows across microservices.

---

# 🧱 **Where Kafka Should NOT Be Used in Your Video Service**

| Task                                       | Why Kafka is wrong choice                            | What to use instead                      |
| ------------------------------------------ | ---------------------------------------------------- | ---------------------------------------- |
| User sees real-time encoding progress      | Kafka is high-latency, heavy, not per-user messaging | Redis Pub/Sub, WebSockets                |
| User notifications ("Your video is ready") | Kafka doesn't push to devices                        | WebSockets, Push notifications, Firebase |
| Simple request-response                    | Kafka is async and decoupled                         | REST / gRPC                              |
| Small-scale queues                         | Kafka is overkill                                    | RabbitMQ / SQS / Redis                   |

---

# 🧩 **Putting it Together — Final Recommended Architecture**

![Image](https://cdn.confluent.io/wp-content/uploads/DiagramsSetupEnv2.png?utm_source=chatgpt.com)

![Image](https://www.kai-waehner.de/wp-content/uploads/2017/10/Kafka_Streams_Mesos_DCOS.png?utm_source=chatgpt.com)

### **A. Kafka handles:**

* Upload events
* Processing pipeline
* Analytics
* Logging
* Job orchestration
* Workflow state
* Multi-consumer event fan-out

### **B. Redis/WS handles:**

* Real-time encoding progress bar
* Real-time UI events

---

# 🥇 **Short Answer Summary**

Kafka is NOT for real-time UI updates.
Kafka IS for your **backend event-driven infrastructure**.

### Use Kafka for:

✔ video.uploaded events
✔ triggering encoding workflows
✔ storing analytics events
✔ building recommendations
✔ multi-stage media processing
✔ microservice communication
✔ scalable async pipelines

### Do NOT use Kafka for:

❌ sending progress to users
❌ direct messaging
❌ client notifications

---

# If you'd like:

I can give you:

✅ a complete architecture diagram
✅ sample Kafka events for your encoding pipeline
✅ a blueprint for Redis/WebSocket progress updates
✅ microservice-by-microservice breakdown

Would you like a **full architecture design** for your video hosting platform?
