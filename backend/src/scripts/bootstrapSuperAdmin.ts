import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';

const bootstrap = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: env.SUPER_ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      if (existing.role === 'super_admin') {
        console.log('✅ Super admin already exists:', existing.email);
      } else {
        console.warn('⚠️  Email exists but is not super_admin. Promoting...');
        existing.role = 'super_admin';
        existing.isActive = true;
        await existing.save();
      }
      await mongoose.disconnect();
      return;
    }

    const superAdmin = await User.create({
      name: env.SUPER_ADMIN_NAME,
      email: env.SUPER_ADMIN_EMAIL,
      password: env.SUPER_ADMIN_PASSWORD,
      role: 'super_admin',
      isActive: true,
    });

    console.log('✅ Super admin created:', superAdmin.email);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Bootstrap failed:', err);
    process.exit(1);
  }
};

bootstrap();