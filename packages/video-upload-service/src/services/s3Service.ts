import { S3Client, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = config.aws.s3BucketName;
    this.s3Client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
      forcePathStyle: false, // Use virtual-hosted-style URLs
    });
  }

  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        Metadata: metadata,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: config.aws.presignedUrlExpiration,
      });

      return presignedUrl;
    } catch (error) {
      console.error('S3 presigned URL generation error:', error);
      throw new AppError('Failed to generate upload URL', 500);
    }
  }

  async verifyFileExists(s3Key: string): Promise<boolean> {
    try {
      console.log('[S3] Checking if file exists:', { bucket: this.bucketName, key: s3Key });
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const response = await this.s3Client.send(command);
      console.log('[S3] File exists, size:', response.ContentLength);
      return true;
    } catch (error: any) {
      console.error('[S3] Error checking file:', {
        key: s3Key,
        errorName: error.name,
        errorCode: error.Code,
        statusCode: error.$metadata?.httpStatusCode,
        message: error.message,
      });
      
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw new AppError(`S3 error: ${error.message}`, 500);
    }
  }

  async getFileMetadata(
    s3Key: string
  ): Promise<{ size: number; lastModified: Date; contentType: string }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const response = await this.s3Client.send(command);

      return {
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        contentType: response.ContentType || 'video/mp4',
      };
    } catch (error) {
      console.error('S3 get metadata error:', error);
      throw new AppError('Failed to get file metadata from S3', 500);
    }
  }

  async deleteFile(s3Key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      await this.s3Client.send(command);
      console.log(`Successfully deleted S3 file: ${s3Key}`);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new AppError('Failed to delete file from S3', 500);
    }
  }

  getS3ObjectUrl(key: string): string {
    return `https://${this.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
  }

  generateS3Key(userId: string, videoId: string, filename: string): string {
    const timestamp = Date.now();
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `videos/${userId}/${videoId}/${timestamp}_${sanitized}`;
  }
}

export const s3Service = new S3Service();
