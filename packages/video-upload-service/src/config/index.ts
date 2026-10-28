import dotenv from 'dotenv';

dotenv.config();

const parseList = (value?: string): string[] | undefined => {
  const list = value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return list?.length ? list : undefined;
};

export const config = {
  port: process.env.PORT || 3004,
  nodeEnv: process.env.NODE_ENV || 'development',
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    s3BucketName: process.env.S3_BUCKET_NAME || 'bell-streaming-videos',
    presignedUrlExpiration: parseInt(process.env.S3_PRESIGNED_URL_EXPIRATION || '900', 10),
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL || '',
  },
  videoMetadataService: {
    url: process.env.VIDEO_METADATA_SERVICE_URL || 'http://localhost:3002/api/admin/videos',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  },
  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '500', 10),
    maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_MB || '500', 10) * 1024 * 1024,
    allowedVideoTypes: parseList(process.env.ALLOWED_VIDEO_TYPES) || [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'video/x-matroska',
    ],
    allowedExtensions: parseList(process.env.ALLOWED_VIDEO_EXTENSIONS) || [
      '.mp4',
      '.mov',
      '.avi',
      '.webm',
      '.mkv',
      '.mpeg',
      '.mpg',
    ],
  },
  cors: {
    allowedOrigins: parseList(process.env.ALLOWED_ORIGINS) || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '20', 10),
  },
  kafka: {
    brokers: parseList(process.env.KAFKA_BROKERS) || ['localhost:9092'],
    clientId: process.env.KAFKA_CLIENT_ID || 'video-upload-service',
    topic: process.env.KAFKA_TOPIC || 'video-uploads',
  },
};
