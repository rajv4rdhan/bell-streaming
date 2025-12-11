import { z } from 'zod';

export const generatePresignedUrlSchema = z.object({
  body: z.object({
    videoId: z.string({ required_error: 'videoId is required' }).min(1),
    contentType: z
      .string({ required_error: 'contentType is required' })
      .regex(/^video\/(mp4|mpeg|quicktime|x-msvideo|webm|x-matroska)$/, 'Invalid video content type'),
  }),
});

export const confirmUploadSchema = z.object({
  body: z.object({
    videoId: z.string({ required_error: 'videoId is required' }),
    s3Key: z.string({ required_error: 's3Key is required' }),
  }),
});

export const uploadFailedSchema = z.object({
  body: z.object({
    videoId: z.string({ required_error: 'videoId is required' }),
    s3Key: z.string().optional(),
    reason: z.string().optional(),
  }),
});

export type GeneratePresignedUrlInput = z.infer<typeof generatePresignedUrlSchema>['body'];
export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>['body'];
export type UploadFailedInput = z.infer<typeof uploadFailedSchema>['body'];
