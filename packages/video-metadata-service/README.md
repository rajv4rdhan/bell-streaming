# Bell Streaming - Video Metadata Service

Admin-only microservice for complete video metadata management: create, read, update, delete videos, manage visibility (public/private), track upload status, and view stats. Video file upload will be handled by a separate service.

## Features
- ✅ Admin-only access via JWT (role-based)
- 📹 Full CRUD operations for video metadata
- 🔐 Manage visibility: public/private
- 📊 Track upload status: pending/uploading/completed/failed
- 📈 View video statistics (views, likes, dislikes, comments)
- 🎨 Thumbnail prompt field for AI generation
- 🔒 Modular schemas with Zod validation
- 🛡️ Security: Helmet, CORS, rate limiting

## Architecture
This service handles **metadata only**. A separate upload service will:
- Accept video files
- Store them (cloud storage/CDN)
- Update `uploadStatus` via API call to this service
- Use `videoId` from this service as reference

## Models
### Video
- `title`, `description`, `ownerUserId`
- `visibility`: `private` | `public`
- `uploadStatus`: `pending` | `uploading` | `completed` | `failed`
- `tags`, `categories`, `language`, `durationSeconds`
- `releaseDate`, `promptForThumbnail`

### VideoStats
- `videoId`, `views`, `likes`, `dislikes`, `commentsCount`, `lastViewedAt`

## Environment
Copy `.env.example` to `.env`:
```env
PORT=3002
MONGODB_URI=mongodb://localhost:27017/bell-streaming-video
JWT_SECRET=your-super-secret-jwt-key
ALLOWED_ORIGINS=http://localhost:3000
```

## Install & Run
```bash
cd packages/video-metadata-service
npm install
npm run dev
```

## API Endpoints
All routes require **Admin** role. Base path: `/api/videos`

### Video Management
- `POST /api/videos` – Create video metadata
  ```json
  {
    "title": "My Video",
    "description": "Description",
    "tags": ["tutorial", "tech"],
    "categories": ["Education"],
    "durationSeconds": 300,
    "language": "en",
    "promptForThumbnail": "Generate a tech thumbnail"
  }
  ```

- `GET /api/videos` – List all videos

- `GET /api/videos/:videoId` – Get single video

- `PATCH /api/videos/:videoId` – Update video metadata
  ```json
  {
    "title": "Updated Title",
    "description": "New description"
  }
  ```

- `DELETE /api/videos/:videoId` – Delete video and stats

### Status Management
- `PATCH /api/videos/:videoId/visibility` – Set visibility
  ```json
  { "visibility": "public" }
  ```

- `PATCH /api/videos/:videoId/upload-status` – Update upload status (for upload service)
  ```json
  { "uploadStatus": "completed" }
  ```

### Statistics
- `GET /api/videos/:videoId/stats` – Get video statistics

### Health
- `GET /api/health` – Service health check

## Integration with Upload Service
When you create the upload service:
1. Admin creates video metadata here → receives `videoId`
2. Upload service accepts file + `videoId`
3. Upload service calls `PATCH /api/videos/:videoId/upload-status` to update status
4. Frontend polls or uses webhooks to check upload completion

## Example Workflow
```bash
# 1. Create video metadata (Admin)
curl -X POST http://localhost:3002/api/videos \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Video"}'

# Response: { "video": { "_id": "abc123", "uploadStatus": "pending" } }

# 2. Upload service receives file and videoId=abc123
# 3. Upload service updates status
curl -X PATCH http://localhost:3002/api/videos/abc123/upload-status \
  -H "Authorization: Bearer <service-token>" \
  -d '{"uploadStatus":"completed"}'

# 4. Set video public when ready
curl -X PATCH http://localhost:3002/api/videos/abc123/visibility \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"visibility":"public"}'
```
