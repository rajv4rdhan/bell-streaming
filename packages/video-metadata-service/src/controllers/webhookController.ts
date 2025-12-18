import { Request, Response, NextFunction } from 'express';
import { Video, ThumbnailStatus } from '../models';
import { AppError } from '../middleware/errorHandler';
import axios from 'axios';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

interface ThumbnailWebhookData {
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  request_id: string;
  task_id: string;
  generated: string[];
}

export const handleThumbnailWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { videoId } = req.params;
    const webhookData: ThumbnailWebhookData = req.body;

    console.log(`Received thumbnail webhook for video ${videoId}:`, webhookData);

    // Find the video
    const video = await Video.findById(videoId);
    if (!video) {
      throw new AppError('Video not found', 404);
    }

    // Map webhook status to our enum
    let thumbnailStatus: ThumbnailStatus;
    switch (webhookData.status) {
      case 'IN_PROGRESS':
        thumbnailStatus = ThumbnailStatus.IN_PROGRESS;
        break;
      case 'COMPLETED':
        thumbnailStatus = ThumbnailStatus.COMPLETED;
        break;
      case 'FAILED':
        thumbnailStatus = ThumbnailStatus.FAILED;
        break;
      default:
        thumbnailStatus = ThumbnailStatus.PENDING;
    }

    // Update thumbnail status
    video.thumbnailStatus = thumbnailStatus;

    // If completed, download and upload to S3
    if (webhookData.status === 'COMPLETED' && webhookData.generated.length > 0) {
      try {
        const thumbnailUrl = webhookData.generated[0];
        console.log(`Downloading thumbnail from: ${thumbnailUrl}`);

        // Download the thumbnail
        const response = await axios.get(thumbnailUrl, {
          responseType: 'arraybuffer',
        });

        const imageBuffer = Buffer.from(response.data);
        const s3Key = `thumbnails/${video.ownerUserId}/${videoId}_${Date.now()}.jpeg`;
        const bucketName = process.env.S3_BUCKET_NAME;

        // Upload to S3
        const uploadParams = {
          Bucket: bucketName,
          Key: s3Key,
          Body: imageBuffer,
          ContentType: 'image/jpeg',
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // Update video with S3 URL
        video.thumbnailUrl = `${s3Key}`;
        
        console.log(`Thumbnail uploaded successfully to S3: ${s3Key}`);
      } catch (error) {
        console.error('Failed to download/upload thumbnail:', error);
        video.thumbnailStatus = ThumbnailStatus.FAILED;
      }
    }

    await video.save();

    res.status(200).json({
      message: 'Webhook processed successfully',
      videoId,
      thumbnailStatus: video.thumbnailStatus,
    });
  } catch (error) {
    next(error);
  }
};
