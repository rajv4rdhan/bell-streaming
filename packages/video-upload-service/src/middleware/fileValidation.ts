import { Request, Response, NextFunction } from 'express';
import { fileTypeFromBuffer } from 'file-type';
import { config } from '../config';
import { AppError } from './errorHandler';
import path from 'path';

export const validateFileType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Check file extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!config.upload.allowedExtensions.includes(ext)) {
      throw new AppError(
        `File type not allowed. Allowed extensions: ${config.upload.allowedExtensions.join(', ')}`,
        400
      );
    }

    // Validate MIME type from file buffer (magic bytes check)
    const fileType = await fileTypeFromBuffer(req.file.buffer);
    
    if (!fileType) {
      throw new AppError('Unable to determine file type', 400);
    }

    // Check if detected MIME type is in allowed list
    if (!config.upload.allowedVideoTypes.includes(fileType.mime)) {
      throw new AppError(
        `Invalid video format detected. File appears to be ${fileType.mime}. Allowed: ${config.upload.allowedVideoTypes.join(', ')}`,
        400
      );
    }

    // Additional check: compare declared MIME vs actual
    const declaredMime = req.file.mimetype;
    if (declaredMime !== fileType.mime) {
      console.warn(`MIME mismatch: declared=${declaredMime}, actual=${fileType.mime}`);
      // Allow but log for monitoring
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateFileSize = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    if (req.file.size > config.upload.maxFileSizeBytes) {
      throw new AppError(
        `File too large. Max size: ${config.upload.maxFileSizeMB}MB`,
        413
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const sanitizeFilename = (filename: string): string => {
  // Remove any path components
  const basename = path.basename(filename);
  
  // Remove special characters, keep alphanumeric, dots, dashes, underscores
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Prevent double extensions and path traversal
  const clean = sanitized.replace(/\.{2,}/g, '.').replace(/^\.+/, '');
  
  return clean || 'video';
};

export const generateSecureFilename = (originalName: string, userId: string): string => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  
  return `${userId}_${timestamp}_${random}${ext}`;
};
