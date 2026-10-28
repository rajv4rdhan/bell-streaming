// import { videoMetadataService } from './videoMetadataService';
// import { s3Service } from './s3Service';
import { config } from '../config';

class UploadMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = config.upload.monitorIntervalMs;
  // private readonly UPLOAD_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  start(): void {
    if (this.intervalId) {
      console.log('⏰ Upload monitor already running');
      return;
    }

    console.log('🚀 Starting upload monitor...');
    this.intervalId = setInterval(() => {
      this.checkStuckUploads();
    }, this.CHECK_INTERVAL);

    // Run immediately on start
    this.checkStuckUploads();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Upload monitor stopped');
    }
  }

  private async checkStuckUploads(): Promise<void> {
    try {
      console.log('🔍 Checking for stuck uploads...');

      // Note: This requires implementing a method in metadata service to get uploading videos
      // For now, this is a placeholder showing the intended architecture
      
      // Example implementation (requires metadata service enhancement):
      // const uploadingVideos = await videoMetadataService.getUploadingVideos();
      // 
      // for (const video of uploadingVideos) {
      //   const uploadStartTime = new Date(video.updatedAt).getTime();
      //   const now = Date.now();
      //   const timeElapsed = now - uploadStartTime;
      //
      //   if (timeElapsed > this.UPLOAD_TIMEOUT) {
      //     console.log(`⏱️ Video ${video._id} upload timeout, marking as failed`);
      //     await videoMetadataService.updateUploadStatus(video._id, 'failed');
      //   }
      // }

      console.log('✅ Upload check completed');
    } catch (error) {
      console.error('❌ Error checking stuck uploads:', error);
    }
  }
}

export const uploadMonitor = new UploadMonitor();
