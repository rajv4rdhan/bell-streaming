import axios from 'axios';

export class ThumbnailGeneratorService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.THUMBNAIL_GENERATOR_URL || 'http://thumbnail-generator:8080';
  }

  async generateThumbnail(videoId: string, prompt: string, webhookUrl: string): Promise<void> {
    try {
      console.log(`Requesting thumbnail generation for video ${videoId} with prompt: ${prompt}`);
      
      await axios.post(`${this.baseUrl}/api/thumbnail/generate`, {
        videoId,
        prompt,
        webhookUrl,
      });

      console.log(`Thumbnail generation request sent successfully for video ${videoId}`);
    } catch (error) {
      console.error(`Failed to request thumbnail generation for video ${videoId}:`, error);
      // Don't throw error - we don't want to block video creation if thumbnail service fails
    }
  }
}

export const thumbnailGeneratorService = new ThumbnailGeneratorService();
