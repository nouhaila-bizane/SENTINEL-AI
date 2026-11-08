import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlatformSettings extends Document {
  allowRegistration: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  platformName: string;
  platformVersion: string;
  maxRecoveryAttempts: number;
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>({
  allowRegistration: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: '' },
  platformName: { type: String, default: 'SENTINEL AI' },
  platformVersion: { type: String, default: '1.0.0' },
  maxRecoveryAttempts: { type: Number, default: 2 },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

export const PlatformSettings: Model<IPlatformSettings> = mongoose.model<IPlatformSettings>(
  'PlatformSettings',
  PlatformSettingsSchema
);