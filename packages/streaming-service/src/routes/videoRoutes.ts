import { Router } from 'express';
import { getAllVideos, getVideoById } from '../controllers/videoController';

const router = Router();

router.get('/public', getAllVideos);
router.get('/:videoId', getVideoById);

export default router;
