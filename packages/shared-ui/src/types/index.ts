export interface User {
  _id: string;
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;
}

export interface Video {
  _id: string;
  id?: string;
  title: string;
  description: string;
  tags?: string[];
  thumbnailUrl?: string;
  videoUrl?: string;
  s3Bucket?: string;
  duration?: number;
  views?: number;
  uploadedAt?: string;
  createdBy: string;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
  visibility: 'public' | 'private';
  promptForThumbnail?: string;
  s3Key?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}
export interface CreateVideoResponse {
  message: string;
  video: Video;
}

export interface VideoStats {
  videoId: string;
  views: number;
  watchTime: number;
  likes: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'user';
}

export interface PresignedUrlRequest {
  videoId: string;
  contentType: string;
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  s3Key: string;
  expiresIn: number;
  uploadInstructions?: {
    method: string;
    headers: Record<string, string>;
  };
}

export interface ConfirmUploadRequest {
  videoId: string;
  s3Key: string;
}

export interface ReportFailedUploadRequest {
  videoId: string;
  s3Key: string;
  error: string;
}

export interface CreateVideoRequest {
  title: string;
  description: string;
  tags?: string[];
  promptForThumbnail?: string;
}

export interface UpdateVideoRequest {
  title?: string;
  description?: string;
  tags?: string[];
  visibility?: 'public' | 'private';
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
