import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3003,
  nodeEnv: process.env.NODE_ENV || 'development',
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3BucketName: process.env.S3_BUCKET_NAME || 'bell-streaming-videos',
    presignedUrlExpiration: parseInt(process.env.S3_PRESIGNED_URL_EXPIRATION || '900'),
  },
  videoMetadataService: {
    url: process.env.VIDEO_METADATA_SERVICE_URL || 'http://localhost:3002/api/admin/videos',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  },
  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '500'),
    maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_MB || '500') * 1024 * 1024,
    allowedVideoTypes: process.env.ALLOWED_VIDEO_TYPES?.split(',') || [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'video/x-matroska',
    ],
    allowedExtensions: ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.mpeg', '.mpg'],
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://admin.bell.tuneloom.cfd'],
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '20'),
  },
};
