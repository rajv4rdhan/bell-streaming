import { rateLimit } from 'express-rate-limit';
import { config } from '../config';

export const rateLimiter = rateLimit({
	windowMs: config.rateLimit.windowMs,
	limit: config.rateLimit.maxRequests,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
});
