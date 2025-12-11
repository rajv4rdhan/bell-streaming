import { Router } from 'express';
import {
  createVideo,
  listVideos,
  getVideo,
  updateVideo,
  deleteVideo,
  setVisibility,
  updateUploadStatus,
  getStats,
  getPublicVideos,
  getPublicVideoById,
} from '../controllers';
import { authenticate, authorize, UserRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createVideoSchema,
  getVideoSchema,
  updateVideoSchema,
  deleteVideoSchema,
  setVisibilitySchema,
  updateUploadStatusSchema,
  getStatsSchema,
} from '../schemas';

const router = Router();

// Public, unauthenticated routes
router.get('/public', getPublicVideos);
router.get('/:videoId/public', validate(getVideoSchema), getPublicVideoById);

// Admin-only access for all endpoints in this service
router.use(authenticate, authorize(UserRole.ADMIN));

// Video CRUD operations
router.post('/', validate(createVideoSchema), createVideo);
router.get('/', listVideos);
router.get('/:videoId', validate(getVideoSchema), getVideo);
router.patch('/:videoId', validate(updateVideoSchema), updateVideo);
router.delete('/:videoId', validate(deleteVideoSchema), deleteVideo);

// Video management operations
router.patch('/:videoId/visibility', validate(setVisibilitySchema), setVisibility);
router.patch('/:videoId/upload-status', validate(updateUploadStatusSchema), updateUploadStatus);

// Video stats
router.get('/:videoId/stats', validate(getStatsSchema), getStats);

export default router;
