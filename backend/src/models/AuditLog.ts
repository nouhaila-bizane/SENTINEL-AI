import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  target?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorEmail: String,
    actorRole: String,
    action: { type: String, required: true, index: true },
    target: String,
    details: String,
    ipAddress: String,
    userAgent: String,
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });

export const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);