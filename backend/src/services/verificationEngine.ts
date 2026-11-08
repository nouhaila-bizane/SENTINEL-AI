import { IVerificationCheck, IVerificationRun } from '../models/Analysis';
import { v4 as uuidv4 } from 'uuid';
import { runSecurityScan } from './securityEngine';
import { runSpecificationAnalysis } from './specificationEngine';

interface VerificationContext {
  sourceCode: string;
  description?: string;
  fileName?: string;
}

const buildChecks = (ctx: VerificationContext): IVerificationCheck[] => {
  const checks: IVerificationCheck[] = [];
  const now = new Date();

  // 1. Source code presence
  checks.push({
    name: 'Source code provided',
    status: ctx.sourceCode.trim().length > 0 ? 'passed' : 'failed',
    reason: ctx.sourceCode.trim().length > 0 ? 'Source code is present' : 'No source code provided',
    executedAt: now,
  });

  // 2. Specification presence
  const hasSpec = (ctx.description || '').trim().length >= 30;
  checks.push({
    name: 'Specification provided',
    status: hasSpec ? 'passed' : 'failed',
    reason: hasSpec ? 'Sufficient specification text' : 'Specification missing or too short',
    executedAt: now,
  });

  // 3. Security scan
  try {
    const scan = runSecurityScan(ctx.sourceCode, ctx.fileName);
    const criticalCount = scan.findings.filter((f) => f.severity === 'Critical').length;
    const highCount = scan.findings.filter((f) => f.severity === 'High').length;
    checks.push({
      name: 'Security scan (deterministic)',
      status: criticalCount === 0 && highCount === 0 ? 'passed' : 'failed',
      reason: `Found ${criticalCount} critical, ${highCount} high severity issues`,
      evidence: JSON.stringify({ total: scan.findings.length, critical: criticalCount, high: highCount }),
      executedAt: now,
    });
  } catch (err) {
    checks.push({
      name: 'Security scan (deterministic)',
      status: 'unavailable',
      reason: 'Security engine error',
      executedAt: now,
    });
  }

  // 4. Specification analysis
  if (ctx.description && ctx.description.trim().length > 0) {
    try {
      const specFindings = runSpecificationAnalysis(ctx.description);
      const highCount = specFindings.filter((f) => f.severity === 'High').length;
      checks.push({
        name: 'Specification quality',
        status: highCount === 0 ? 'passed' : 'failed',
        reason: `${specFindings.length} findings, ${highCount} high severity`,
        evidence: JSON.stringify(specFindings.length),
        executedAt: now,
      });
    } catch {
      checks.push({
        name: 'Specification quality',
        status: 'unavailable',
        reason: 'Specification engine error',
        executedAt: now,
      });
    }
  } else {
    checks.push({
      name: 'Specification quality',
      status: 'skipped',
      reason: 'No specification provided',
      executedAt: now,
    });
  }

  // 5. Dependency scan (only if package.json-like content detected)
  const hasPackageJson = /"dependencies"\s*:\s*\{/i.test(ctx.sourceCode);
  if (hasPackageJson) {
    checks.push({
      name: 'Dependency audit',
      status: 'unavailable',
      reason: 'External registry integration not configured',
      executedAt: now,
    });
  } else {
    checks.push({
      name: 'Dependency audit',
      status: 'skipped',
      reason: 'No dependency manifest detected',
      executedAt: now,
    });
  }

  // 6. License presence
  const hasLicense = /\b(MIT|Apache|GPL|BSD|ISC|LICENSE)\b/i.test(ctx.sourceCode);
  checks.push({
    name: 'License declaration',
    status: hasLicense ? 'passed' : 'failed',
    reason: hasLicense ? 'License identifier detected' : 'No license identifier found',
    executedAt: now,
  });

  return checks;
};

export const runVerification = (ctx: VerificationContext): IVerificationRun => {
  const checks = buildChecks(ctx);
  const summary = {
    total: checks.length,
    passed: checks.filter((c) => c.status === 'passed').length,
    failed: checks.filter((c) => c.status === 'failed').length,
    skipped: checks.filter((c) => c.status === 'skipped').length,
    unavailable: checks.filter((c) => c.status === 'unavailable').length,
  };

  return {
    runId: uuidv4(),
    executedAt: new Date(),
    checks,
    summary,
  };
};