import mongoose, { Document, Schema } from 'mongoose';

export interface IVideoStats extends Document {
  videoId: mongoose.Types.ObjectId;
  views: number;
  likes: number;
  dislikes: number;
  commentsCount: number;
  lastViewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const videoStatsSchema = new Schema<IVideoStats>(
  {
    videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true, index: true, unique: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    lastViewedAt: { type: Date },
  },
  { timestamps: true }
);

export const VideoStats = mongoose.model<IVideoStats>('VideoStats', videoStatsSchema);
