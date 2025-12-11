# Bell Streaming - Video Upload Service

Secure microservice for uploading videos to AWS S3 using presigned URLs with comprehensive security measures.

## 🔒 Security Features

### File Validation
- ✅ **File type validation** via extension and MIME type
- ✅ **Magic bytes verification** using `file-type` library
- ✅ **Size limits**: Configurable max file size (default 500MB)
- ✅ **Allowed formats**: mp4, mpeg, mov, avi, webm, mkv only
- ✅ **Filename sanitization**: Prevents path traversal and injection attacks
- ✅ **Secure filename generation**: UUID-based naming prevents collisions

### AWS S3 Security
- ✅ **Presigned URLs** with short expiration (15 minutes)
- ✅ **Server-side encryption** (AES256)
- ✅ **Private ACL** by default (no public read)
- ✅ **Organized structure**: `videos/{userId}/{videoId}/{timestamp}_{filename}`
- ✅ **Metadata tracking**: userId, videoId, originalFilename stored with object

### Authentication & Authorization
- ✅ **JWT-based authentication**
- ✅ **Role-based access control** (Admin only)
- ✅ **Token verification** on every request
- ✅ **Rate limiting**: 20 requests per 15 minutes

### Additional Security
- ✅ **Helmet.js**: Security headers (XSS, CSP, etc.)
- ✅ **CORS**: Strict origin control
- ✅ **Request body size limits**: 10MB max
- ✅ **Error masking**: No sensitive data in responses
- ✅ **Logging**: All upload attempts logged for audit

## 🏗️ Architecture

### Upload Flow
1. Admin creates video metadata in `video-metadata-service` → receives `videoId`
2. Admin requests presigned URL from this service with `videoId`
3. Service validates video exists and generates secure S3 presigned URL
4. Service updates video status to "uploading" automatically
5. Client uploads **directly to S3** using presigned URL (no file passes through server)
6. Client confirms upload completion to this service
7. **Service auto-verifies file exists in S3** before confirming
8. Service updates video status to "completed" in metadata service
9. **Background monitor auto-fails stuck uploads** after 30 minutes

### Auto-Confirm & Auto-Fail Features
- ✅ **S3 Verification**: Confirms file exists before marking as completed
- ✅ **Auto-Cleanup**: Deletes partial uploads on failure
- ✅ **Timeout Detection**: Auto-fails uploads stuck for >30 minutes
- ✅ **Background Monitor**: Checks every 5 minutes for stuck uploads
- ✅ **Manual Verification**: Endpoint to manually check upload status
- ✅ **Graceful Shutdown**: Stops monitoring on service shutdown

### Why Presigned URLs?
- No server bandwidth for file transfer
- Scalable (S3 handles load)
- Secure (time-limited, signed URLs)
- Direct upload from client to S3
- Server only orchestrates, doesn't handle files

## 📋 Prerequisites

### AWS Setup
1. Create S3 bucket:
```bash
aws s3 mb s3://bell-streaming-videos --region us-east-1
```

2. Set bucket policy (replace `BUCKET_NAME`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPresignedUploads",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::BUCKET_NAME/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

3. Create IAM user with permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::BUCKET_NAME/*"
    }
  ]
}
```

4. Enable CORS on bucket:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Environment Configuration
Copy `.env.example` to `.env`:
```env
PORT=3003
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=bell-streaming-videos
VIDEO_METADATA_SERVICE_URL=http://localhost:3002/api/videos
JWT_SECRET=your-jwt-secret
MAX_FILE_SIZE_MB=500
```

## 🚀 Installation & Run

```bash
cd packages/video-upload-service
npm install
npm run dev
```

## 📡 API Endpoints

Base path: `/api/uploads`

### 1. Generate Presigned URL
**POST** `/api/uploads/presigned-url`

Request:
```json
{
  "videoId": "507f1f77bcf86cd799439011",
  "filename": "my-video.mp4",
  "contentType": "video/mp4",
  "fileSize": 104857600
}
```

Response:
```json
{
  "message": "Presigned URL generated",
  "presignedUrl": "https://bucket.s3.region.amazonaws.com/key?X-Amz-...",
  "s3Key": "videos/user123/video456/1234567890_secure.mp4",
  "expiresIn": 900,
  "uploadInstructions": {
    "method": "PUT",
    "headers": {
      "Content-Type": "video/mp4"
    }
  }
}
```

### 2. Confirm Upload
**POST** `/api/uploads/confirm`

**Auto-verifies file exists in S3 before confirming**

Request:
```json
{
  "videoId": "507f1f77bcf86cd799439011",
  "s3Key": "videos/user123/video456/1234567890_secure.mp4"
}
```

Response:
```json
{
  "message": "Upload confirmed successfully",
  "videoId": "507f1f77bcf86cd799439011",
  "s3Key": "videos/user123/video456/1234567890_secure.mp4",
  "s3Url": "https://bucket.s3.region.amazonaws.com/videos/...",
  "fileSize": 104857600,
  "uploadedAt": "2025-12-10T12:00:00.000Z"
}
```

### 3. Report Upload Failure
**POST** `/api/uploads/failed`

**Auto-deletes partial uploads from S3**

Request:
```json
{
  "videoId": "507f1f77bcf86cd799439011",
  "s3Key": "videos/user123/video456/1234567890_secure.mp4",
  "reason": "Network timeout"
}
```

Response:
```json
{
  "message": "Upload failure recorded",
  "videoId": "507f1f77bcf86cd799439011"
}
```

### 4. Auto-Verify Upload (Manual)
**POST** `/api/uploads/verify/:videoId`

**Manually check and update stuck upload status**

Response (Still uploading):
```json
{
  "message": "Upload still in progress",
  "videoId": "507f1f77bcf86cd799439011",
  "status": "uploading",
  "elapsedMinutes": 15
}
```

Response (Timeout):
```json
{
  "message": "Upload timed out and marked as failed",
  "videoId": "507f1f77bcf86cd799439011",
  "reason": "timeout",
  "elapsedMinutes": 35
}
```

### 5. Health Check
**GET** `/api/health`

## 🔄 Complete Workflow Example

### Backend Flow
```bash
# 1. Create video metadata (metadata service)
curl -X POST http://localhost:3002/api/videos \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Video",
    "description": "Test video"
  }'
# Response: { "video": { "_id": "VIDEO_ID", "uploadStatus": "pending" } }

# 2. Request presigned URL (this service)
curl -X POST http://localhost:3003/api/uploads/presigned-url \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "VIDEO_ID",
    "filename": "video.mp4",
    "contentType": "video/mp4",
    "fileSize": 104857600
  }'
# Response: { "presignedUrl": "https://...", "s3Key": "..." }

# 3. Upload to S3 (client-side)
curl -X PUT "<presigned-url>" \
  -H "Content-Type: video/mp4" \
  --data-binary @video.mp4

# 4. Confirm upload (this service)
curl -X POST http://localhost:3003/api/uploads/confirm \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "VIDEO_ID",
    "s3Key": "videos/..."
  }'
```

### Frontend Integration (React example)
```typescript
// Step 1: Get presigned URL
const response = await fetch('/api/uploads/presigned-url', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    videoId: videoId,
    filename: file.name,
    contentType: file.type,
    fileSize: file.size
  })
});

const { presignedUrl, s3Key } = await response.json();

// Step 2: Upload directly to S3
const uploadResponse = await fetch(presignedUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': file.type
  },
  body: file
});

// Step 3: Confirm upload
if (uploadResponse.ok) {
  await fetch('/api/uploads/confirm', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ videoId, s3Key })
  });
}
```

## 🛡️ Security Best Practices Implemented

1. **Input Validation**: All inputs validated with Zod schemas
2. **File Type Enforcement**: Extension + MIME + magic bytes check
3. **Size Limits**: Prevent DoS via large files
4. **Rate Limiting**: Prevent abuse
5. **Presigned URL Expiration**: 15-minute window
6. **Server-side Encryption**: All S3 objects encrypted at rest
7. **Private ACL**: No public access to uploaded files
8. **Secure Filenames**: Prevent directory traversal
9. **Token-based Auth**: Every request requires valid JWT
10. **Audit Logging**: All operations logged
11. **CORS Restrictions**: Only allowed origins
12. **Error Handling**: No sensitive data leaked in errors

## 🔮 Future Enhancements

- [ ] Virus scanning integration (ClamAV or AWS GuardDuty)
- [ ] Multipart upload support for large files
- [ ] Upload progress tracking via WebSockets
- [ ] Video transcoding pipeline (AWS MediaConvert)
- [ ] Thumbnail generation (AWS Lambda + FFmpeg)
- [ ] CDN integration (CloudFront)
- [ ] Upload resume capability
- [ ] Webhook notifications on upload completion

## 📊 Monitoring

Monitor these metrics:
- Upload success/failure rates
- Average upload duration
- S3 storage costs
- Rate limit hits
- Authentication failures
- File validation rejections

## 🧪 Testing

```bash
npm test
```

Test checklist:
- [ ] Valid file types accepted
- [ ] Invalid file types rejected
- [ ] File size limits enforced
- [ ] Presigned URLs expire correctly
- [ ] Unauthorized requests blocked
- [ ] Rate limiting works
- [ ] Metadata service integration
- [ ] S3 upload confirmation
