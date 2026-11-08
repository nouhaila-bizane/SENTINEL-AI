import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface JwtPayload {
  id: string;
  role: string;
}

const getToken = (req: Request): string | null => {
  if (req.cookies?.token) return req.cookies.token;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
};

export const protect = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const token = getToken(req);
    if (!token) throw new AppError('Authentication required', 401);

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.id).select('-password');
    if (!user) throw new AppError('User no longer exists', 401);
    if (!user.isActive) throw new AppError('Account suspended', 403);

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    if ((err as any).name === 'JsonWebTokenError' || (err as any).name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401));
    }
    next(err);
  }
};

export const requireRole = (...roles: Array<'user' | 'admin' | 'super_admin'>) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Not authenticated', 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
};

export const requireAdmin = requireRole('admin', 'super_admin');
export const requireSuperAdmin = requireRole('super_admin');