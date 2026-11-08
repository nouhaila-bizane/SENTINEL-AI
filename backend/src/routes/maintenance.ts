import { Router, Request, Response, NextFunction } from 'express';
import { PlatformSettings } from '../models/PlatformSettings';

const router = Router();

router.get('/status', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await PlatformSettings.findOne();
    res.json({
      maintenanceMode: settings?.maintenanceMode || false,
      maintenanceMessage: settings?.maintenanceMessage || '',
    });
  } catch (err) {
    next(err);
  }
});

export default router;