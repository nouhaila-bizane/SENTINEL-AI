import { Router, Response, NextFunction } from 'express';
import { protect, AuthRequest, requireSuperAdmin } from '../middleware/auth';
import { maintenanceCheck } from '../middleware/maintenance';
import { User } from '../models/User';
import { Analysis } from '../models/Analysis';
import { AuditLog } from '../models/AuditLog';
import { AppError } from '../middleware/errorHandler';
import { logAudit } from '../utils/audit';
import { updateUserStatusSchema, changePasswordSchema, updateProfileSchema } from '../validators/schemas';
import { validate } from '../middleware/validate';

const router = Router();

// Self profile
router.get('/me', protect, maintenanceCheck, async (req: AuthRequest, res: Response) => {
  res.json({ user: (req.user as any).toJSON() });
});

router.patch('/me', protect, maintenanceCheck, validate(updateProfileSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    if (req.body.name) user.name = req.body.name;
    if (req.body.notificationPreferences) {
      user.notificationPreferences = { ...user.notificationPreferences, ...req.body.notificationPreferences };
    }
    await user.save();
    await logAudit(user, req, 'PROFILE_UPDATE', { target: user._id.toString() });
    res.json({ user: (user as any).toJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/me/change-password', protect, maintenanceCheck, validate(changePasswordSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const ok = await user.comparePassword(req.body.currentPassword);
    if (!ok) throw new AppError('Current password is incorrect', 400);
    user.password = req.body.newPassword;
    await user.save();
    await logAudit(user, req, 'PASSWORD_CHANGE', { target: user._id.toString() });
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
});

// Admin: list users
router.get('/', protect, requireSuperAdmin, maintenanceCheck, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, role, isActive, page = '1', limit = '50' } = req.query;
    const filter: any = {};
    if (typeof search === 'string' && search.trim()) {
  const safeSearch = search.trim().slice(0, 100);
  const escapedSearch = safeSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  filter.$or = [
    { name: { $regex: escapedSearch, $options: 'i' } },
    { email: { $regex: escapedSearch, $options: 'i' } },
  ];
} else if (search !== undefined) {
  return res.status(400).json({
    message: 'Invalid search parameter',
  });
}
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const analysisCount = await Analysis.countDocuments({ userId: u._id });
        return { ...(u as any).toJSON(), analysisCount };
      })
    );

    res.json({ users: usersWithCounts, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
});

// Admin: user details
router.get('/:id', protect, requireSuperAdmin, maintenanceCheck, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) throw new AppError('User not found', 404);
    const [analysisCount, recentAnalyses, recentLogs] = await Promise.all([
      Analysis.countDocuments({ userId: user._id }),
      Analysis.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10).select('projectName status currentReleaseDecision createdAt'),
      AuditLog.find({ actorId: user._id }).sort({ createdAt: -1 }).limit(30),
    ]);
    res.json({ user: (user as any).toJSON(), analysisCount, recentAnalyses, recentLogs });
  } catch (err) {
    next(err);
  }
});

// Admin: suspend/activate
router.patch('/:id/status', protect, requireSuperAdmin, maintenanceCheck, validate(updateUserStatusSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) throw new AppError('User not found', 404);
    if (target._id.toString() === req.user!._id.toString()) {
      throw new AppError('You cannot modify your own account status', 400);
    }
    if (target.role === 'super_admin') {
      throw new AppError('Cannot modify another super admin account', 403);
    }

    target.isActive = req.body.isActive;
    if (!req.body.isActive) {
      target.suspendedAt = new Date();
      target.suspensionReason = req.body.reason || 'Suspended by administrator';
    } else {
      target.suspendedAt = undefined;
      target.suspensionReason = undefined;
    }
    await target.save();

    await logAudit(req.user!, req, 'USER_STATUS_CHANGE', {
      target: target._id.toString(),
      details: `${target.email} -> isActive=${target.isActive}`,
    });

    res.json({ user: (target as any).toJSON() });
  } catch (err) {
    next(err);
  }
});

// Admin: change role
router.patch('/:id/role', protect, requireSuperAdmin, maintenanceCheck, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) throw new AppError('Invalid role', 400);
    const target = await User.findById(req.params.id);
    if (!target) throw new AppError('User not found', 404);
    if (target._id.toString() === req.user!._id.toString()) {
      throw new AppError('You cannot change your own role', 400);
    }
    if (target.role === 'super_admin') {
      throw new AppError('Cannot change super admin role', 403);
    }

    const oldRole = target.role;
    target.role = role;
    await target.save();

    await logAudit(req.user!, req, 'USER_ROLE_CHANGE', {
      target: target._id.toString(),
      details: `${target.email}: ${oldRole} -> ${role}`,
    });

    res.json({ user: (target as any).toJSON() });
  } catch (err) {
    next(err);
  }
});

// Admin: delete user
router.delete('/:id', protect, requireSuperAdmin, maintenanceCheck, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) throw new AppError('User not found', 404);
    if (target._id.toString() === req.user!._id.toString()) {
      throw new AppError('You cannot delete your own account', 400);
    }
    if (target.role === 'super_admin') {
      const otherSuperAdmins = await User.countDocuments({ role: 'super_admin' });
      if (otherSuperAdmins <= 1) {
        throw new AppError('Cannot delete the last super admin account', 403);
      }
    }

    await Analysis.deleteMany({ userId: target._id });
    await target.deleteOne();

    await logAudit(req.user!, req, 'USER_DELETE', {
      target: target._id.toString(),
      details: `Deleted ${target.email}`,
    });

    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;