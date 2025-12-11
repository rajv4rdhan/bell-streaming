import { Router } from 'express';
import uploadRoutes from './uploadRoutes';

const router = Router();

router.use('/uploads', uploadRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'video-upload-service' });
});

export default router;
