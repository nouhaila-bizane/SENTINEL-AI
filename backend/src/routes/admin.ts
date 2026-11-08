
import { Router, Response, NextFunction } from 'express';
import { protect, AuthRequest, requireSuperAdmin } from '../middleware/auth';
import { maintenanceCheck } from '../middleware/maintenance';
import { User } from '../models/User';
import { Analysis } from '../models/Analysis';
import { AuditLog } from '../models/AuditLog';
import { PlatformSettings } from '../models/PlatformSettings';
import { updatePlatformSettingsSchema } from '../validators/schemas';
import { validate } from '../middleware/validate';
import { logAudit } from '../utils/audit';

const router = Router();

router.use(protect);
router.use(requireSuperAdmin);
router.use(maintenanceCheck);

router.get('/stats', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      superAdminCount,
      adminCount,
      totalAnalyses,
      completedAnalyses,
      totalVulnerabilities,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ role: 'super_admin' }),
      User.countDocuments({ role: 'admin' }),
      Analysis.countDocuments(),
      Analysis.countDocuments({ status: 'Completed' }),
      Analysis.aggregate([
        { $unwind: '$securityFindings' },
        { $count: 'total' },
      ]).then((r) => r[0]?.total || 0),
    ]);

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const analysesPerDay = await Analysis.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const severityDistribution = await Analysis.aggregate([
      { $unwind: '$securityFindings' },
      { $group: { _id: '$securityFindings.severity', count: { $sum: 1 } } },
    ]);

    const releaseDistribution = await Analysis.aggregate([
      { $group: { _id: '$currentReleaseDecision', count: { $sum: 1 } } },
    ]);

    const topUsers = await Analysis.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          count: 1,
        },
      },
    ]);

    const activityPerDay = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        superAdmins: superAdminCount,
        admins: adminCount,
      },
      analyses: {
        total: totalAnalyses,
        completed: completedAnalyses,
      },
      vulnerabilities: {
        total: totalVulnerabilities,
      },
      charts: {
        userGrowth,
        analysesPerDay,
        severityDistribution,
        releaseDistribution,
        topUsers,
        activityPerDay,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/activity', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = '100' } = _req.query;

    if (
      typeof limit !== 'string' ||
      !/^\d+$/.test(limit) ||
      Number(limit) < 1 ||
      Number(limit) > 500
    ) {
      return res.status(400).json({
        message: 'Invalid limit parameter. Expected an integer between 1 and 500.',
      });
    }

    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

router.get('/settings', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let settings = await PlatformSettings.findOne();

    if (!settings) {
      settings = await PlatformSettings.create({});
    }

    res.json({ settings });
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/settings',
  validate(updatePlatformSettingsSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      let settings = await PlatformSettings.findOne();

      if (!settings) {
        settings = await PlatformSettings.create({});
      }

      Object.assign(settings, req.body);
      settings.updatedAt = new Date();
      settings.updatedBy = req.user!._id;

      await settings.save();

      await logAudit(req.user!, req, 'SETTINGS_UPDATE', {
        details: JSON.stringify(req.body),
      });

      res.json({ settings });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
