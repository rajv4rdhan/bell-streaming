import axios from 'axios';
import { config } from '../config';

export class VideoMetadataService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.videoMetadataService.url;
  }

  async updateUploadStatus(
    videoId: string,
    uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed',
    adminToken: string
  ): Promise<void> {
    try {
      await axios.patch(
        `${this.baseUrl}/${videoId}/upload-status`,
        { uploadStatus },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Failed to update video metadata:', error);
      throw new Error('Failed to update video metadata service');
    }
  }

  async getVideoMetadata(videoId: string, adminToken: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${videoId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      return response.data.video;
    } catch (error) {
      console.error('Failed to fetch video metadata:', error);
      throw new Error('Video not found or unauthorized');
    }
  }
}

export const videoMetadataService = new VideoMetadataService();
