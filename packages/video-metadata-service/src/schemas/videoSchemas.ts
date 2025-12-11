import { z } from 'zod';
import { VisibilityStatus, UploadStatus } from '../models/Video';

export const videoBaseSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).min(1).max(200).trim(),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string().min(1).max(50)).optional().default([]),
  categories: z.array(z.string().min(1).max(50)).optional().default([]),
  durationSeconds: z.number().int().positive().optional(),
  language: z.string().max(20).optional(),
  releaseDate: z.string().datetime().optional(),
  promptForThumbnail: z.string().max(500).optional(),
});

export const updateVideoSchema = z.object({
  params: z.object({
    videoId: z.string({ required_error: 'videoId is required' }),
  }),
  body: z.object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(2000).optional(),
    tags: z.array(z.string().min(1).max(50)).optional(),
    categories: z.array(z.string().min(1).max(50)).optional(),
    durationSeconds: z.number().int().positive().optional(),
    language: z.string().max(20).optional(),
    releaseDate: z.string().datetime().optional(),
    promptForThumbnail: z.string().max(500).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

export const createVideoSchema = z.object({
  body: videoBaseSchema,
});

export const setVisibilitySchema = z.object({
  params: z.object({
    videoId: z.string({ required_error: 'videoId is required' }),
  }),
  body: z.object({
    visibility: z.enum([VisibilityStatus.PRIVATE, VisibilityStatus.PUBLIC], {
      required_error: 'visibility is required',
    }),
  }),
});

export const getStatsSchema = z.object({
  params: z.object({
    videoId: z.string({ required_error: 'videoId is required' }),
  }),
});

export const getVideoSchema = z.object({
  params: z.object({
    videoId: z.string({ required_error: 'videoId is required' }),
  }),
});

export const deleteVideoSchema = z.object({
  params: z.object({
    videoId: z.string({ required_error: 'videoId is required' }),
  }),
});

export const updateUploadStatusSchema = z.object({
  params: z.object({
    videoId: z.string({ required_error: 'videoId is required' }),
  }),
  body: z.object({
    uploadStatus: z.enum([UploadStatus.PENDING, UploadStatus.UPLOADING, UploadStatus.COMPLETED, UploadStatus.FAILED], {
      required_error: 'uploadStatus is required',
    }),
  }),
});

export type CreateVideoInput = z.infer<typeof createVideoSchema>['body'];
export type SetVisibilityInput = z.infer<typeof setVisibilitySchema>['body'];
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>['body'];
export type UpdateUploadStatusInput = z.infer<typeof updateUploadStatusSchema>['body'];
