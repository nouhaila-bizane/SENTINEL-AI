import mongoose, { Schema, Document, Model } from 'mongoose';

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
export type AnalysisStatus = 'Pending' | 'Analyzing' | 'Completed' | 'Failed';
export type ReleaseDecision = 'PASS' | 'BLOCK' | 'RETRY';

export interface IFinding {
  code: string;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  evidence?: string;
  file?: string;
  line?: number;
  suggestion: string;
}

export interface IVerificationCheck {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'unavailable';
  reason?: string;
  evidence?: string;
  executedAt: Date;
}

export interface IVerificationRun {
  runId: string;
  executedAt: Date;
  checks: IVerificationCheck[];
  summary: { total: number; passed: number; failed: number; skipped: number; unavailable: number };
}

export interface IRecoveryAttempt {
  attemptNumber: number;
  executedAt: Date;
  issue: string;
  proposedCorrection: string;
  applied: boolean;
  result: 'success' | 'partial' | 'failed';
  notes?: string;
}

export interface IReleaseRecord {
  decision: ReleaseDecision;
  executedAt: Date;
  reasons: string[];
  evidence: string[];
}

export interface IAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  projectName: string;
  description: string;
  analysisType: 'full' | 'security' | 'specification' | 'verification';
  sourceCode: string;
  fileName?: string;
  status: AnalysisStatus;
  specificationFindings: IFinding[];
  securityFindings: IFinding[];
  verificationRuns: IVerificationRun[];
  recoveryAttempts: IRecoveryAttempt[];
  releaseHistory: IReleaseRecord[];
  currentReleaseDecision: ReleaseDecision;
  errorMessage?: string;
}

const FindingSchema = new Schema<IFinding>(
  {
    code: { type: String, required: true },
    severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low', 'Info'], required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    evidence: String,
    file: String,
    line: Number,
    suggestion: { type: String, required: true },
  },
  { _id: false }
);

const VerificationCheckSchema = new Schema<IVerificationCheck>(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ['passed', 'failed', 'skipped', 'unavailable'], required: true },
    reason: String,
    evidence: String,
    executedAt: { type: Date, required: true },
  },
  { _id: false }
);

const VerificationRunSchema = new Schema<IVerificationRun>(
  {
    runId: { type: String, required: true },
    executedAt: { type: Date, required: true },
    checks: [VerificationCheckSchema],
    summary: {
      total: Number,
      passed: Number,
      failed: Number,
      skipped: Number,
      unavailable: Number,
    },
  },
  { _id: false }
);

const RecoveryAttemptSchema = new Schema<IRecoveryAttempt>(
  {
    attemptNumber: { type: Number, required: true },
    executedAt: { type: Date, required: true },
    issue: { type: String, required: true },
    proposedCorrection: { type: String, required: true },
    applied: { type: Boolean, required: true },
    result: { type: String, enum: ['success', 'partial', 'failed'], required: true },
    notes: String,
  },
  { _id: false }
);

const ReleaseRecordSchema = new Schema<IReleaseRecord>(
  {
    decision: { type: String, enum: ['PASS', 'BLOCK', 'RETRY'], required: true },
    executedAt: { type: Date, required: true },
    reasons: [String],
    evidence: [String],
  },
  { _id: false }
);

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectName: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    analysisType: {
      type: String,
      enum: ['full', 'security', 'specification', 'verification'],
      default: 'full',
    },
    sourceCode: { type: String, required: true },
    fileName: String,
    status: {
      type: String,
      enum: ['Pending', 'Analyzing', 'Completed', 'Failed'],
      default: 'Pending',
    },
    specificationFindings: [FindingSchema],
    securityFindings: [FindingSchema],
    verificationRuns: [VerificationRunSchema],
    recoveryAttempts: [RecoveryAttemptSchema],
    releaseHistory: [ReleaseRecordSchema],
    currentReleaseDecision: {
      type: String,
      enum: ['PASS', 'BLOCK', 'RETRY'],
      default: 'RETRY',
    },
    errorMessage: String,
  },
  { timestamps: true }
);

AnalysisSchema.index({ userId: 1, createdAt: -1 });
AnalysisSchema.index({ status: 1 });
AnalysisSchema.index({ currentReleaseDecision: 1 });

export const Analysis: Model<IAnalysis> = mongoose.model<IAnalysis>('Analysis', AnalysisSchema);