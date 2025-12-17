import mongoose, { Document, Schema } from 'mongoose';

export enum VisibilityStatus {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export enum UploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface IVideo extends Document {
  title: string;
  description?: string;
  ownerUserId: string;
  visibility: VisibilityStatus;
  uploadStatus: UploadStatus;
  s3Key?: string; // S3 object key (e.g., videos/userId/videoId/timestamp_filename.mp4)
  s3Bucket?: string; // S3 bucket name
  tags: string[];
  durationSeconds?: number;
  categories: string[];
  language?: string;
  releaseDate?: Date;
  promptForThumbnail?: string; // extra field for thumbnail prompt
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Default 16:9 placeholder thumbnail
const DEFAULT_THUMBNAIL = 'https://drmcv4972t1k7.cloudfront.net/Placeholder800x450.jpeg';

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    ownerUserId: { type: String, required: true, index: true },
    visibility: {
      type: String,
      enum: Object.values(VisibilityStatus),
      default: VisibilityStatus.PRIVATE,
      index: true,
    },
    s3Key: { type: String },
    s3Bucket: { type: String },
    tags: { type: [String], default: [] },
    durationSeconds: { type: Number },
    categories: { type: [String], default: [] },
    language: { type: String },
    releaseDate: { type: Date },
    promptForThumbnail: { type: String },
    thumbnailUrl: { type: String, default: DEFAULT_THUMBNAIL },
    uploadStatus: {
      type: String,
      enum: Object.values(UploadStatus),
      default: UploadStatus.PENDING,
      index: true,
    },
  },
  { timestamps: true }
);

export const Video = mongoose.model<IVideo>('Video', videoSchema);
