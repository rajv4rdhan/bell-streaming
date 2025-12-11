import { Router } from 'express';
import videoRoutes from './videoRoutes';

const router = Router();

router.use('/videos', videoRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'video-metadata-service' });
});

export default router;
