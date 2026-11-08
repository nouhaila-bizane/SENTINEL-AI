import { Request } from 'express';
import { AuditLog } from '../models/AuditLog';
import { IUser } from '../models/User';

export const logAudit = async (
  user: IUser | null | undefined,
  req: Request,
  action: string,
  details?: { target?: string; details?: string; metadata?: Record<string, any> }
) => {
  try {
    await AuditLog.create({
      actorId: user?._id,
      actorEmail: user?.email,
      actorRole: user?.role,
      action,
      target: details?.target,
      details: details?.details,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: details?.metadata,
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
};