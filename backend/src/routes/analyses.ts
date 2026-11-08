
import { Router, Response, NextFunction } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { maintenanceCheck } from '../middleware/maintenance';
import { Analysis, IAnalysis } from '../models/Analysis';
import { PlatformSettings } from '../models/PlatformSettings';
import { createAnalysisSchema, recoveryAttemptSchema } from '../validators/schemas';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import { runSecurityScan } from '../services/securityEngine';
import { runSpecificationAnalysis } from '../services/specificationEngine';
import { runVerification } from '../services/verificationEngine';
import { evaluateReleaseGate, recordReleaseDecision } from '../services/releaseGate';
import { logAudit } from '../utils/audit';
import { analysisLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(protect);
router.use(maintenanceCheck);

const finalizeAnalysis = async (analysis: IAnalysis) => {
  const sec = runSecurityScan(analysis.sourceCode, analysis.fileName);
  analysis.securityFindings = sec.findings;

  if (analysis.description && analysis.description.trim().length > 0) {
    analysis.specificationFindings = runSpecificationAnalysis(analysis.description);
  } else {
    analysis.specificationFindings = [];
  }

  const verification = runVerification({
    sourceCode: analysis.sourceCode,
    description: analysis.description,
    fileName: analysis.fileName,
  });

  analysis.verificationRuns.push(verification);

  const gate = evaluateReleaseGate(analysis);
  recordReleaseDecision(analysis, gate);

  analysis.status = 'Completed';
  await analysis.save();
};

router.post(
  '/',
  analysisLimiter,
  validate(createAnalysisSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const analysis = await Analysis.create({
        userId: req.user!._id,
        projectName: req.body.projectName,
        description: req.body.description || '',
        analysisType: req.body.analysisType,
        sourceCode: req.body.sourceCode,
        fileName: req.body.fileName,
        status: 'Analyzing',
      });

      await logAudit(req.user!, req, 'ANALYSIS_CREATE', {
        target: analysis._id.toString(),
        details: analysis.projectName,
      });

      try {
        await finalizeAnalysis(analysis);
      } catch (err) {
        analysis.status = 'Failed';
        analysis.errorMessage = (err as Error).message;
        await analysis.save();
      }

      const fresh = await Analysis.findById(analysis._id);
      res.status(201).json({ analysis: fresh });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const analyses = await Analysis.find({
        userId: req.user!._id,
      })
        .sort({ createdAt: -1 })
        .limit(100);

      res.json({ analyses });
    } catch (err) {
      next(err);
    }
  }
);

// Return the analysis together with the current platform recovery limit.
router.get(
  '/:id',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const analysis = await Analysis.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!analysis) {
        throw new AppError('Analysis not found', 404);
      }

      const settings = await PlatformSettings.findOne();
      const maxRecoveryAttempts = settings?.maxRecoveryAttempts ?? 2;

      res.json({ analysis, maxRecoveryAttempts });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/verify',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const analysis = await Analysis.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!analysis) {
        throw new AppError('Analysis not found', 404);
      }

      const verification = runVerification({
        sourceCode: analysis.sourceCode,
        description: analysis.description,
        fileName: analysis.fileName,
      });

      analysis.verificationRuns.push(verification);

      const gate = evaluateReleaseGate(analysis);
      recordReleaseDecision(analysis, gate);

      await analysis.save();

      await logAudit(req.user!, req, 'VERIFICATION_RUN', {
        target: analysis._id.toString(),
        details: `Run ${verification.runId}`,
      });

      res.json({ analysis });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/recover',
  validate(recoveryAttemptSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const analysis = await Analysis.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!analysis) {
        throw new AppError('Analysis not found', 404);
      }

      const settings = await PlatformSettings.findOne();
      const maxAttempts = settings?.maxRecoveryAttempts ?? 2;

      if (analysis.recoveryAttempts.length >= maxAttempts) {
        throw new AppError(
          `Maximum recovery attempts (${maxAttempts}) reached`,
          400
        );
      }

      const attempt = {
        attemptNumber: analysis.recoveryAttempts.length + 1,
        executedAt: new Date(),
        issue: req.body.issue,
        proposedCorrection: req.body.proposedCorrection,
        applied: false,
        result: 'failed' as const,
        notes: 'Correction not applied — requires verified source modification.',
      };

      analysis.recoveryAttempts.push(attempt);
      await analysis.save();

      await logAudit(req.user!, req, 'RECOVERY_ATTEMPT', {
        target: analysis._id.toString(),
        details: `Attempt #${attempt.attemptNumber}`,
      });

      res.json({ analysis, attempt });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/release',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const analysis = await Analysis.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!analysis) {
        throw new AppError('Analysis not found', 404);
      }

      const gate = evaluateReleaseGate(analysis);
      recordReleaseDecision(analysis, gate);

      await analysis.save();

      await logAudit(req.user!, req, 'RELEASE_EVALUATE', {
        target: analysis._id.toString(),
        details: `Decision: ${gate.decision}`,
      });

      res.json({ analysis, decision: gate });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const analysis = await Analysis.findOneAndDelete({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!analysis) {
        throw new AppError('Analysis not found', 404);
      }

      await logAudit(req.user!, req, 'ANALYSIS_DELETE', {
        target: analysis._id.toString(),
      });

      res.json({ message: 'Analysis deleted' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
