import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔐 Auth header:', authHeader);
    console.log('📋 All headers:', JSON.stringify(req.headers, null, 2));
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No token provided');
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    console.log('🎫 Token:', token.substring(0, 20) + '...');
    
    try {
      const payload = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        email: string;
        role: UserRole;
      };
      console.log('✅ Token verified, user:', payload.email, 'role:', payload.role);
      req.user = payload;
      next();
    } catch (err) {
      console.log('❌ Token verification failed:', err);
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.log('❌ Auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization error' });
    }
  };
};
