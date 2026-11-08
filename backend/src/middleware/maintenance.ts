import { Response, NextFunction } from 'express';
import { PlatformSettings } from '../models/PlatformSettings';
import { AuthRequest } from './auth';

export const maintenanceCheck = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. If user is Super Admin, always allow access to manage the platform
    if (req.user && req.user.role === 'super_admin') {
      return next();
    }

    // 2. Check database for maintenance status
    const settings = await PlatformSettings.findOne();
    
    if (settings && settings.maintenanceMode) {
      return res.status(503).json({
        message: 'Service Unavailable',
        code: 'MAINTENANCE_MODE',
        details: settings.maintenanceMessage || 'SENTINEL AI is currently undergoing scheduled maintenance.',
      });
    }

    next();
  } catch (error) {
    // 3. Controlled Fail-Closed: Log error and return 503 to prevent exposure during DB issues
    console.error('Maintenance check failed:', error);
    return res.status(503).json({
      message: 'Service Unavailable',
      code: 'SYSTEM_ERROR',
      details: 'The system is temporarily unable to verify service status.',
    });
  }
};