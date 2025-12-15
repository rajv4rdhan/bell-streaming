import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Video,
  CreateVideoRequest,
  CreateVideoResponse,
  UpdateVideoRequest,
  PresignedUrlRequest,
  PresignedUrlResponse,
  ConfirmUploadRequest,
  ReportFailedUploadRequest,
  VideoStats,
} from '../types';

// Safe access to import.meta.env
const getApiBaseUrl = (): string => {
  try {
    // @ts-ignore - Vite provides import.meta.env at runtime
    return import.meta.env?.VITE_API_BASE_URL || 'http://localhost/api';
  } catch {
    return 'http://localhost/api';
  }
};

export const API_BASE_URL = getApiBaseUrl();

export const createApiClient = (baseURL: string = API_BASE_URL): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();

// Auth API
export const authApi = {
  login: (data: LoginRequest) => 
    apiClient.post<AuthResponse>('/auth/login', data),
  
  register: (data: RegisterRequest) => 
    apiClient.post<AuthResponse>('/auth/register', data),
  
  logout: () => 
    apiClient.post('/auth/logout'),
  
  getProfile: () => 
    apiClient.get<User>('/auth/profile'),
  
  updateProfile: (data: Partial<User>) => 
    apiClient.patch<User>('/auth/profile', data),
  
  refreshToken: (refreshToken: string) => 
    apiClient.post<AuthResponse>('/auth/refresh', { refreshToken }),
  
  // Admin endpoints
  getUsers: () => 
    apiClient.get<User[]>('/auth/users'),
  
  changeUserRole: (userId: string, role: 'admin' | 'user') => 
    apiClient.patch(`/auth/users/${userId}/role`, { role }),
  
  deleteUser: (userId: string) => 
    apiClient.delete(`/auth/users/${userId}`),
};

// Video Metadata API (Admin)
export const videoMetadataApi = {
  createVideo: (data: CreateVideoRequest) => 
    apiClient.post<CreateVideoResponse>('/admin/videos', data),
  
  getAllVideos: (params?: { search?: string; page?: number; limit?: number }) => 
    apiClient.get<{ videos: Video[]; total: number }>('/admin/videos', { params }),
  
  getPublicVideos: (params?: { search?: string; page?: number; limit?: number }) => 
    apiClient.get<{ videos: Video[]; total: number }>('/admin/videos/public', { params }),
  
  getVideoById: (videoId: string) => 
    apiClient.get<Video>(`/admin/videos/${videoId}`),
  
  updateVideo: (videoId: string, data: UpdateVideoRequest) => 
    apiClient.patch<Video>(`/admin/videos/${videoId}`, data),
  
  deleteVideo: (videoId: string) => 
    apiClient.delete(`/admin/videos/${videoId}`),
  
  setVideoVisibility: (videoId: string, visibility: 'public' | 'private') => 
    apiClient.patch(`/admin/videos/${videoId}/visibility`, { visibility }),
  
  updateUploadStatus: (videoId: string, uploadStatus: string) => 
    apiClient.patch(`/admin/videos/${videoId}/upload-status`, { uploadStatus }),
  
  getVideoStats: (videoId: string) => 
    apiClient.get<VideoStats>(`/admin/videos/${videoId}/stats`),
};

// Video Upload API
export const videoUploadApi = {
  getPresignedUrl: (data: { videoId: string, contentType: string }) => 
    apiClient.post<PresignedUrlResponse>('/uploads/presigned-url', data),
  uploadToS3: (presignedUrl: string, file: File, onUploadProgress: (progress: number) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Log file details before upload
      console.log('[uploadToS3] File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        fileObject: file,
        isFile: file instanceof File,
        isBlob: file instanceof Blob,
      });

      if (!file || file.size === 0) {
        console.error('[uploadToS3] Invalid file - file is null or empty');
        return reject(new Error('File is null or empty'));
      }

      const xhr = new XMLHttpRequest();
      
      // Open connection
      xhr.open('PUT', presignedUrl, true);
      
      // Set Content-Type to match the file type
      xhr.setRequestHeader('Content-Type', file.type);
      
      console.log('[uploadToS3] Starting upload to:', presignedUrl);
      
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        console.log('[uploadToS3] Upload progress:', event.loaded, '/', event.total);
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total);
          onUploadProgress(percentCompleted);
        }
      };

      // Handle successful upload
      xhr.onload = () => {
        console.log('[uploadToS3] Upload completed. Status:', xhr.status, 'Response:', xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          onUploadProgress(100);
          resolve();
        } else {
          reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText} - ${xhr.responseText}`));
        }
      };

      // Handle network errors
      xhr.onerror = () => {
        console.error('[uploadToS3] Network error during upload');
        reject(new Error('S3 upload failed due to a network error.'));
      };

      // Send the File object directly as binary data
      console.log('[uploadToS3] Sending file...');
      xhr.send(file);
    });
  },
  confirmUpload: (data: ConfirmUploadRequest) => 
    apiClient.post<{ message: string }>('/uploads/confirm', data),
  reportFailedUpload: (data: ReportFailedUploadRequest) => 
    apiClient.post('/uploads/failed', data),
};

// Streaming API (Public)
export const streamingApi = {
  getPublicVideos: (params?: { search?: string; page?: number; limit?: number }) => 
    apiClient.get<{ videos: Video[]; total: number }>('/videos/public', { params }),
  
  getVideoById: (videoId: string) => 
    apiClient.get<Video>(`/videos/${videoId}`),
  
  streamVideo: (videoId: string) => 
    `${API_BASE_URL}/videos/stream/${videoId}`,
  
  recordView: (videoId: string) => 
    apiClient.post(`/videos/${videoId}/view`),
};

// Legacy upload function for backward compatibility
export const uploadFile = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  };

  const response = await apiClient.post(url, formData, config);
  return response.data;
};
