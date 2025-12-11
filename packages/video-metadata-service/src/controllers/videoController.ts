import { Request, Response, NextFunction } from 'express';
import { Video, VideoStats, VisibilityStatus, UploadStatus } from '../models';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { CreateVideoInput, SetVisibilityInput, UpdateVideoInput, UpdateUploadStatusInput } from '../schemas';

export const createVideo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, tags, categories, durationSeconds, language, releaseDate, promptForThumbnail } =
      req.body as CreateVideoInput;

    if (!title) throw new AppError('Title is required', 400);

    const ownerUserId = req.user?.userId || 'admin';
    const timestamp = Date.now();
    const s3Key = `videos/${ownerUserId}/${timestamp}_${title.replace(/\s+/g, '_')}.mp4`;
    const s3Bucket = 'bell-streaming-videos'; // Or from config

    const video = await Video.create({
      title,
      description,
      ownerUserId,
      visibility: VisibilityStatus.PRIVATE,
      uploadStatus: UploadStatus.PENDING,
      s3Key,
      s3Bucket,
      tags: tags || [],
      categories: categories || [],
      durationSeconds,
      language,
      releaseDate,
      promptForThumbnail,
    });

    await VideoStats.create({ videoId: video._id });

    res.status(201).json({
      message: 'Video metadata created',
      video,
    });
  } catch (error) {
    next(error);
  }
};

export const listVideos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json({ count: videos.length, videos });
  } catch (error) {
    next(error);
  }
};

export const setVisibility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { videoId } = req.params;
    const { visibility } = req.body as SetVisibilityInput;

    if (!Object.values(VisibilityStatus).includes(visibility)) {
      throw new AppError('Invalid visibility value', 400);
    }

    const video = await Video.findByIdAndUpdate(
      videoId,
      { visibility },
      { new: true }
    );

    if (!video) throw new AppError('Video not found', 404);

    res.status(200).json({ message: 'Visibility updated', video });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { videoId } = req.params;
    const stats = await VideoStats.findOne({ videoId });
    if (!stats) throw new AppError('Stats not found', 404);

    res.status(200).json({ stats });
  } catch (error) {
    next(error);
  }
};

export const getVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) throw new AppError('Video not found', 404);

    res.status(200).json({ video });
  } catch (error) {
    next(error);
  }
};

export const updateVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { videoId } = req.params;
    const updates = req.body as UpdateVideoInput;

    const video = await Video.findByIdAndUpdate(videoId, updates, { new: true, runValidators: true });

    if (!video) throw new AppError('Video not found', 404);

    res.status(200).json({ message: 'Video updated', video });
  } catch (error) {
    next(error);
  }
};

export const deleteVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { videoId } = req.params;

    const video = await Video.findByIdAndDelete(videoId);
    if (!video) throw new AppError('Video not found', 404);

    // Also delete associated stats
    await VideoStats.findOneAndDelete({ videoId });

    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateUploadStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { videoId } = req.params;
    const { uploadStatus } = req.body as UpdateUploadStatusInput;

    const video = await Video.findByIdAndUpdate(videoId, { uploadStatus }, { new: true });

    if (!video) throw new AppError('Video not found', 404);

    res.status(200).json({ message: 'Upload status updated', video });
  } catch (error) {
    next(error);
  }
};

export const getPublicVideos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const videos = await Video.find({
      visibility: 'private',
    }).select('title description duration createdAt');
    res.status(200).json(videos);
  } catch (error) {
    next(error);
  }
};

export const getPublicVideoById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findOne({
      _id: videoId,
    });

    if (!video) {
      throw new AppError('Public video not found', 404);
    }

    res.status(200).json(video);
  } catch (error) {
    next(error);
  }
};
