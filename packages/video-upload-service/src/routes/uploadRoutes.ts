import { Router } from 'express';
import { generatePresignedUrl, confirmUpload, uploadFailed, autoVerifyUpload } from '../controllers';
import { authenticate, authorize, UserRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { generatePresignedUrlSchema, confirmUploadSchema, uploadFailedSchema } from '../schemas';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.post('/presigned-url', validate(generatePresignedUrlSchema), generatePresignedUrl);

router.post('/confirm', validate(confirmUploadSchema), confirmUpload);

router.post('/failed', validate(uploadFailedSchema), uploadFailed);

router.post('/verify/:videoId', autoVerifyUpload);

export default router;
