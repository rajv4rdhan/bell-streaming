import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../controllers';
import { authenticate, authorize } from '../middleware';
import { validate } from '../middleware/validation';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  updateProfileSchema,
  updateUserRoleSchema,
  UserRole,
} from '../schemas';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// Protected routes - All authenticated users
router.post('/logout', authenticate, validate(logoutSchema), logout);
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, validate(updateProfileSchema), updateProfile);

// Admin and Moderator routes
router.get(
  '/users',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.MODERATOR),
  getAllUsers
);

// Admin only routes
router.patch(
  '/users/:userId/role',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateUserRoleSchema),
  updateUserRole
);

router.delete(
  '/users/:userId',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteUser
);

export default router;
