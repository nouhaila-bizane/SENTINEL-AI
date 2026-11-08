import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { registerSchema, loginSchema } from '../validators/schemas';
import { validate } from '../middleware/validate';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/jwt';
import { logAudit } from '../utils/audit';
import { protect, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { PlatformSettings } from '../models/PlatformSettings';
import { authLimiter } from '../middleware/rateLimiter';
import { maintenanceCheck } from '../middleware/maintenance';

const router = Router();

// Block registration during maintenance
router.post('/register', authLimiter, maintenanceCheck, validate(registerSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await PlatformSettings.findOne();
    if (settings && !settings.allowRegistration) {
      throw new AppError('Registration is currently disabled', 403);
    }

    const { name, email, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError('Email already registered', 409);

    const user = await User.create({ name, email, password, role: 'user' });

    await logAudit(user, req, 'USER_REGISTER', { 
      target: user._id.toString(), 
      details: `New user: ${email}` 
    });

    const token = signToken(user);
    setAuthCookie(res, token);

    res.status(201).json({ user: (user as any).toJSON() });
  } catch (err) {
    next(err);
  }
});

// Login remains open for Super Admin recovery
router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new AppError('Invalid credentials', 401);
    if (!user.isActive) throw new AppError('Account suspended', 403);

    const ok = await user.comparePassword(password);
    if (!ok) {
      await logAudit(user, req, 'LOGIN_FAILED', {
        target: user._id.toString(),
        details: 'Invalid password',
      });
      throw new AppError('Invalid credentials', 401);
    }

    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    await logAudit(user, req, 'LOGIN_SUCCESS', {
      target: user._id.toString(),
      details: `Login for ${user.email}`,
    });

    const token = signToken(user);
    setAuthCookie(res, token);

    res.json({ user: (user as any).toJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
});

router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  res.json({ user: (req.user as any).toJSON() });
});

export default router;