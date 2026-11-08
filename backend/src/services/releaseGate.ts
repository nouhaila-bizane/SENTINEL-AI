import { IAnalysis, IReleaseRecord, ReleaseDecision } from '../models/Analysis';

export interface GateResult {
  decision: ReleaseDecision;
  reasons: string[];
  evidence: string[];
}

export const evaluateReleaseGate = (analysis: IAnalysis): GateResult => {
  const reasons: string[] = [];
  const evidence: string[] = [];

  const lastRun = analysis.verificationRuns[analysis.verificationRuns.length - 1];

  // BLOCK conditions
  const criticalFindings = analysis.securityFindings.filter((f) => f.severity === 'Critical').length;
  if (criticalFindings > 0) {
    reasons.push(`${criticalFindings} critical security finding(s) must be resolved`);
    evidence.push(`Critical findings count: ${criticalFindings}`);
  }

  if (lastRun && lastRun.summary.failed > 0) {
    reasons.push(`${lastRun.summary.failed} verification check(s) failed`);
    evidence.push(`Verification run ${lastRun.runId}: ${lastRun.summary.failed} failed`);
  }

  const highSpecFindings = analysis.specificationFindings.filter((f) => f.severity === 'High').length;
  if (highSpecFindings > 0) {
    reasons.push(`${highSpecFindings} high-severity specification issue(s)`);
    evidence.push(`High severity spec findings: ${highSpecFindings}`);
  }

  // RETRY conditions
  if (analysis.verificationRuns.length === 0) {
    reasons.push('No verification run has been executed yet');
    return { decision: 'RETRY', reasons, evidence: ['Verification runs: 0'] };
  }

  if (lastRun && lastRun.summary.unavailable > 0) {
    reasons.push(`${lastRun.summary.unavailable} check(s) were unavailable and could not be verified`);
    evidence.push(`Unavailable checks: ${lastRun.summary.unavailable}`);
  }

  if (analysis.status !== 'Completed') {
    reasons.push(`Analysis status is ${analysis.status}`);
    return { decision: 'RETRY', reasons, evidence };
  }

  // PASS
  if (reasons.length === 0) {
    return { decision: 'PASS', reasons: ['All mandatory checks passed'], evidence };
  }

  return { decision: 'BLOCK', reasons, evidence };
};

export const recordReleaseDecision = (analysis: IAnalysis, result: GateResult): IReleaseRecord => {
  const record: IReleaseRecord = {
    decision: result.decision,
    executedAt: new Date(),
    reasons: result.reasons,
    evidence: result.evidence,
  };
  analysis.releaseHistory.push(record);
  analysis.currentReleaseDecision = result.decision;
  return record;
};