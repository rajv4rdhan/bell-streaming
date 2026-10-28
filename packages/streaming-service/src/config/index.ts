import dotenv from 'dotenv';

dotenv.config();

const parseList = (value?: string): string[] | undefined => {
  const list = value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return list?.length ? list : undefined;
};

const videoMetadataServiceUrl = process.env.VIDEO_METADATA_SERVICE_URL;

if (!videoMetadataServiceUrl) {
  throw new Error(
    'VIDEO_METADATA_SERVICE_URL is not defined in the environment variables.'
  );
}

export const config = {
  port: parseInt(process.env.PORT || '3003', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  videoMetadataServiceUrl,
  cors: {
    allowedOrigins: parseList(process.env.ALLOWED_ORIGINS) || [
      'http://localhost:5173',
      'http://localhost:5174',
    ],
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};
