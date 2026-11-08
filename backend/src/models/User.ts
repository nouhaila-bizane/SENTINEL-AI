import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  suspendedAt?: Date;
  suspensionReason?: string;
  lastLogin?: Date;
  loginCount: number;
  notificationPreferences: {
    emailAnalysisComplete: boolean;
    emailSecurityAlerts: boolean;
    emailReleaseDecisions: boolean;
  };
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    suspendedAt: Date,
    suspensionReason: String,
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    notificationPreferences: {
      emailAnalysisComplete: { type: Boolean, default: true },
      emailSecurityAlerts: { type: Boolean, default: true },
      emailReleaseDecisions: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);


UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Type-safe sanitization: explicitly construct the safe object instead of using 'delete'
const safeTransform = (_doc: any, ret: any) => {
  return {
    _id: ret._id,
    name: ret.name,
    email: ret.email,
    role: ret.role,
    isActive: ret.isActive,
    suspendedAt: ret.suspendedAt,
    suspensionReason: ret.suspensionReason,
    lastLogin: ret.lastLogin,
    loginCount: ret.loginCount,
    notificationPreferences: ret.notificationPreferences,
    createdAt: ret.createdAt,
    updatedAt: ret.updatedAt,
  };
};

UserSchema.set('toJSON', { transform: safeTransform });
UserSchema.set('toObject', { transform: safeTransform });

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);