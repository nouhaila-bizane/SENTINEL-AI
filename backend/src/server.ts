import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import maintenanceRoutes from './routes/maintenance';
import userRoutes from './routes/users';
import analysisRoutes from './routes/analyses';
import adminRoutes from './routes/admin';
import { PlatformSettings } from './models/PlatformSettings';

const start = async () => {
  await connectDB();

  // Ensure platform settings exist
  const existing = await PlatformSettings.findOne();
  if (!existing) {
    await PlatformSettings.create({
      allowRegistration: env.ALLOW_REGISTRATION,
      maintenanceMode: env.MAINTENANCE_MODE,
    });
    console.log('✅ Platform settings initialized');
  }

  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));
  if (env.NODE_ENV !== 'test') app.use(morgan('dev'));
  app.use(generalLimiter);

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  // Public routes
  app.use('/api/auth', authRoutes);
  app.use('/api/maintenance', maintenanceRoutes);

  // Protected routes (maintenanceCheck is applied internally after protect)
  app.use('/api/users', userRoutes);
  app.use('/api/analyses', analysisRoutes);
  app.use('/api/admin', adminRoutes);

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use(errorHandler);

  app.listen(env.PORT, () => {
    console.log(`🚀 SENTINEL AI backend running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
};

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});