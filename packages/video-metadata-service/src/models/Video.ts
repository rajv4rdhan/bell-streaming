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
  tags: string[];
  durationSeconds?: number;
  categories: string[];
  language?: string;
  releaseDate?: Date;
  promptForThumbnail?: string; // extra field for thumbnail prompt
  createdAt: Date;
  updatedAt: Date;
}

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
    tags: { type: [String], default: [] },
    durationSeconds: { type: Number },
    categories: { type: [String], default: [] },
    language: { type: String },
    releaseDate: { type: Date },
    promptForThumbnail: { type: String },
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
