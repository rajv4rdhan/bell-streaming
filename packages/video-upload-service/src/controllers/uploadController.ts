import { Response, NextFunction } from 'express';
import { s3Service, videoMetadataService } from '../services';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { GeneratePresignedUrlInput, ConfirmUploadInput, UploadFailedInput } from '../schemas';

export const generatePresignedUrl = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { videoId, contentType } = req.body as GeneratePresignedUrlInput;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Get admin token from request to verify video exists
    const adminToken = req.headers.authorization?.substring(7);
    if (!adminToken) {
      throw new AppError('Invalid token', 401);
    }

    // Get video metadata to retrieve the pre-generated s3Key
    const video = await videoMetadataService.getVideoMetadata(videoId, adminToken);
    if (!video || !video.s3Key) {
      throw new AppError('Video not found or s3Key missing', 404);
    }

    // Build metadata
    const metadata: Record<string, string> = {
      userId,
      videoId,
    };

    // Generate presigned URL with the key from the metadata service
    const presignedUrl = await s3Service.generatePresignedUploadUrl(video.s3Key, contentType, metadata);

    // Update video status to "uploading"
    await videoMetadataService.updateUploadStatus(videoId, 'uploading', adminToken);

    res.status(200).json({
      message: 'Presigned URL generated',
      presignedUrl,
      s3Key: video.s3Key,
      expiresIn: 900, // 15 minutes
      uploadInstructions: {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
      },
    });
  } catch (error) {
    // Revert to pending if presigned URL generation fails
    try {
      const { videoId } = req.body as GeneratePresignedUrlInput;
      const adminToken = req.headers.authorization?.substring(7);
      if (videoId && adminToken) {
        await videoMetadataService.updateUploadStatus(videoId, 'pending', adminToken);
      }
    } catch {}
    next(error);
  }
};

export const confirmUpload = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { videoId, s3Key } = req.body as ConfirmUploadInput;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const adminToken = req.headers.authorization?.substring(7);
    if (!adminToken) {
      throw new AppError('Invalid token', 401);
    }

    // Verify the file exists in S3 before confirming
    const exists = await s3Service.verifyFileExists(s3Key);
    if (!exists) {
      throw new AppError('File not found in S3. Upload may have failed.', 404);
    }

    // Get file metadata from S3
    const fileMetadata = await s3Service.getFileMetadata(s3Key);

    // Update video status to completed
    await videoMetadataService.updateUploadStatus(videoId, 'completed', adminToken);

    const s3Url = s3Service.getS3ObjectUrl(s3Key);

    res.status(200).json({
      message: 'Upload confirmed successfully',
      videoId,
      s3Key,
      s3Url,
      fileSize: fileMetadata.size,
      uploadedAt: fileMetadata.lastModified,
    });
  } catch (error) {
    // Auto-mark as failed if confirmation fails
    try {
      const { videoId } = req.body as ConfirmUploadInput;
      const adminToken = req.headers.authorization?.substring(7);
      if (videoId && adminToken) {
        await videoMetadataService.updateUploadStatus(videoId, 'failed', adminToken);
      }
    } catch {}
    next(error);
  }
};

export const uploadFailed = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { videoId, s3Key, reason } = req.body as UploadFailedInput;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const adminToken = req.headers.authorization?.substring(7);
    if (!adminToken) {
      throw new AppError('Invalid token', 401);
    }

    // Clean up S3 if partial upload exists
    if (s3Key) {
      try {
        await s3Service.deleteFile(s3Key);
      } catch (err) {
        console.error(`Failed to delete S3 file ${s3Key}:`, err);
      }
    }

    await videoMetadataService.updateUploadStatus(videoId, 'failed', adminToken);

    console.error(`Upload failed for video ${videoId}: ${reason || 'Unknown reason'}`);

    res.status(200).json({
      message: 'Upload failure recorded',
      videoId,
    });
  } catch (error) {
    next(error);
  }
};

export const autoVerifyUpload = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { videoId } = req.params;

    const adminToken = req.headers.authorization?.substring(7);
    if (!adminToken) {
      throw new AppError('Invalid token', 401);
    }

    // Get video details
    const video = await videoMetadataService.getVideoMetadata(videoId, adminToken);
    if (!video) {
      throw new AppError('Video not found', 404);
    }

    if (video.uploadStatus !== 'uploading') {
       res.status(400).json({
        message: `Video is not in uploading state. Current status: ${video.uploadStatus}`,
        videoId,
        currentStatus: video.uploadStatus,
      });
      return;
    }
    
    const UPLOAD_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const uploadStartTime = new Date(video.updatedAt).getTime();
    const now = Date.now();
    const timeElapsed = now - uploadStartTime;

    if (timeElapsed > UPLOAD_TIMEOUT) {
      // Timeout exceeded, mark as failed
      await videoMetadataService.updateUploadStatus(videoId, 'failed', adminToken);
       res.status(200).json({
        message: 'Upload timed out and marked as failed',
        videoId,
        reason: 'timeout',
        elapsedMinutes: Math.floor(timeElapsed / 60000),
      });
      return;
    }

    res.status(200).json({
      message: 'Upload still in progress',
      videoId,
      status: 'uploading',
      elapsedMinutes: Math.floor(timeElapsed / 60000),
    });
  } catch (error) {
    next(error);
  }
};
