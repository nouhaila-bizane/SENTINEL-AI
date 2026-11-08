
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { Card, Badge, Button, Textarea, EmptyState } from '../../components/ui';
import {
  Shield,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  DoorOpen,
  Download,
  Loader2,
} from 'lucide-react';
import { generatePDFReport } from '../../utils/pdf';

export default function AnalysisDetails() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState<any>(null);
  const [maxRecoveryAttempts, setMaxRecoveryAttempts] = useState(2);
  const [loading, setLoading] = useState(true);
  const [recoverIssue, setRecoverIssue] = useState('');
  const [recoverCorrection, setRecoverCorrection] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get(`/analyses/${id}`);
    setAnalysis(data.analysis);
    setMaxRecoveryAttempts(data.maxRecoveryAttempts ?? 2);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const runVerify = async () => {
    const { data } = await api.post(`/analyses/${id}/verify`);
    setAnalysis(data.analysis);
  };

  const evaluateRelease = async () => {
    const { data } = await api.post(`/analyses/${id}/release`);
    setAnalysis(data.analysis);
  };

  const submitRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRecovering(true);

    try {
      const { data } = await api.post(`/analyses/${id}/recover`, {
        issue: recoverIssue,
        proposedCorrection: recoverCorrection,
      });

      setAnalysis(data.analysis);
      setRecoverIssue('');
      setRecoverCorrection('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Recovery failed');
    } finally {
      setRecovering(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="animate-spin mx-auto text-sentinel-cyan" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <EmptyState
        icon={Shield}
        title="Not found"
        description="Analysis does not exist."
      />
    );
  }

  const severityIcon = (s: string) => {
    switch (s) {
      case 'Critical':
        return <AlertTriangle className="text-sentinel-danger" size={18} />;
      case 'High':
        return <AlertTriangle className="text-sentinel-warning" size={18} />;
      case 'Medium':
        return <Info className="text-sentinel-blue" size={18} />;
      case 'Low':
        return <Info className="text-sentinel-muted" size={18} />;
      default:
        return <Info className="text-sentinel-muted" size={18} />;
    }
  };

  const decisionVariant = (d: string): any =>
    d === 'PASS' ? 'success' : d === 'BLOCK' ? 'danger' : 'warning';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold">{analysis.projectName}</h1>
            <Badge variant={decisionVariant(analysis.currentReleaseDecision)}>
              {analysis.currentReleaseDecision}
            </Badge>
          </div>
          <p className="text-sentinel-muted text-sm">
            ID: {analysis._id} • {new Date(analysis.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => generatePDFReport(analysis)}
          >
            <Download size={16} /> Export PDF
          </Button>
          <Button variant="secondary" onClick={runVerify}>
            <RotateCcw size={16} /> Re-verify
          </Button>
          <Button variant="secondary" onClick={evaluateRelease}>
            <DoorOpen size={16} /> Evaluate Release
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-sentinel-muted uppercase">
            Security Findings
          </p>
          <p className="text-2xl font-bold mt-1">
            {analysis.securityFindings.length}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-sentinel-muted uppercase">
            Spec Findings
          </p>
          <p className="text-2xl font-bold mt-1">
            {analysis.specificationFindings.length}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-sentinel-muted uppercase">
            Verification Runs
          </p>
          <p className="text-2xl font-bold mt-1">
            {analysis.verificationRuns.length}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-sentinel-muted uppercase">
            Recovery Attempts
          </p>
          <p className="text-2xl font-bold mt-1">
            {analysis.recoveryAttempts.length} / {maxRecoveryAttempts}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={18} className="text-sentinel-cyan" />
          Security Findings
        </h2>

        {analysis.securityFindings.length === 0 ? (
          <div className="py-8 text-center text-sentinel-muted">
            <CheckCircle2
              className="mx-auto mb-2 text-sentinel-success"
              size={32}
            />
            No security issues detected.
          </div>
        ) : (
          <div className="space-y-3">
            {analysis.securityFindings.map((f: any, i: number) => (
              <div
                key={i}
                className="p-4 bg-sentinel-bg rounded-lg border border-sentinel-border"
              >
                <div className="flex items-start gap-3">
                  {severityIcon(f.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{f.title}</span>
                      <Badge
                        variant={
                          f.severity === 'Critical'
                            ? 'danger'
                            : f.severity === 'High'
                              ? 'warning'
                              : 'info'
                        }
                      >
                        {f.severity}
                      </Badge>
                      <Badge>{f.code}</Badge>
                    </div>

                    <p className="text-sm text-sentinel-muted mt-1">
                      {f.description}
                    </p>

                    {f.evidence && (
                      <pre className="mt-2 p-2 bg-sentinel-card rounded text-xs font-mono text-sentinel-cyan overflow-x-auto border border-sentinel-border">
                        {f.file}:{f.line} → {f.evidence}
                      </pre>
                    )}

                    <p className="text-xs text-sentinel-success mt-2">
                      💡 {f.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Specification Findings
        </h2>

        {analysis.specificationFindings.length === 0 ? (
          <div className="py-8 text-center text-sentinel-muted">
            No specification issues.
          </div>
        ) : (
          <div className="space-y-3">
            {analysis.specificationFindings.map((f: any, i: number) => (
              <div
                key={i}
                className="p-4 bg-sentinel-bg rounded-lg border border-sentinel-border"
              >
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-medium">{f.title}</span>
                  <Badge variant={f.severity === 'High' ? 'warning' : 'info'}>
                    {f.severity}
                  </Badge>
                  <Badge>{f.code}</Badge>
                </div>

                <p className="text-sm text-sentinel-muted">
                  {f.description}
                </p>

                {f.evidence && (
                  <p className="text-xs text-sentinel-cyan mt-1 font-mono">
                    {f.evidence}
                  </p>
                )}

                <p className="text-xs text-sentinel-success mt-2">
                  💡 {f.suggestion}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Verification History
        </h2>

        {analysis.verificationRuns.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No verification runs"
            description="Run verification to evaluate checks."
          />
        ) : (
          <div className="space-y-4">
            {[...analysis.verificationRuns].reverse().map((run: any) => (
              <div
                key={run.runId}
                className="p-4 bg-sentinel-bg rounded-lg border border-sentinel-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">
                      Run {run.runId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-sentinel-muted">
                      {new Date(run.executedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <Badge variant="success">
                      {run.summary.passed} passed
                    </Badge>
                    <Badge variant="danger">
                      {run.summary.failed} failed
                    </Badge>
                    <Badge>{run.summary.skipped} skipped</Badge>
                    <Badge variant="purple">
                      {run.summary.unavailable} unavailable
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  {run.checks.map((c: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      {c.status === 'passed' ? (
                        <CheckCircle2
                          size={16}
                          className="text-sentinel-success mt-0.5"
                        />
                      ) : c.status === 'failed' ? (
                        <XCircle
                          size={16}
                          className="text-sentinel-danger mt-0.5"
                        />
                      ) : c.status === 'skipped' ? (
                        <Clock
                          size={16}
                          className="text-sentinel-muted mt-0.5"
                        />
                      ) : (
                        <AlertTriangle
                          size={16}
                          className="text-sentinel-purple mt-0.5"
                        />
                      )}

                      <div className="flex-1">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-sentinel-muted ml-2">
                          — {c.reason}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <RotateCcw size={18} className="text-sentinel-purple" />
          Recovery Attempts ({analysis.recoveryAttempts.length}/
          {maxRecoveryAttempts})
        </h2>

        {analysis.recoveryAttempts.length > 0 && (
          <div className="space-y-2 mb-4">
            {analysis.recoveryAttempts.map((a: any, i: number) => (
              <div
                key={i}
                className="p-3 bg-sentinel-bg rounded-lg border border-sentinel-border text-sm"
              >
                <div className="flex justify-between">
                  <span className="font-medium">
                    Attempt #{a.attemptNumber}
                  </span>
                  <Badge
                    variant={
                      a.result === 'success'
                        ? 'success'
                        : a.result === 'partial'
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {a.result}
                  </Badge>
                </div>

                <p className="text-sentinel-muted mt-1">
                  <strong>Issue:</strong> {a.issue}
                </p>
                <p className="text-sentinel-muted">
                  <strong>Proposed:</strong> {a.proposedCorrection}
                </p>
                <p className="text-xs text-sentinel-warning mt-1">
                  {a.notes}
                </p>
              </div>
            ))}
          </div>
        )}

        {analysis.recoveryAttempts.length < maxRecoveryAttempts ? (
          <form
            onSubmit={submitRecovery}
            className="space-y-3 pt-3 border-t border-sentinel-border"
          >
            {error && (
              <div className="p-3 rounded-lg bg-sentinel-danger/10 border border-sentinel-danger/30 text-sentinel-danger text-sm">
                {error}
              </div>
            )}

            <Textarea
              rows={2}
              placeholder="Describe the issue to recover from..."
              value={recoverIssue}
              onChange={(e) => setRecoverIssue(e.target.value)}
              required
            />

            <Textarea
              rows={3}
              placeholder="Proposed correction..."
              value={recoverCorrection}
              onChange={(e) => setRecoverCorrection(e.target.value)}
              required
            />

            <Button type="submit" disabled={recovering}>
              {recovering ? 'Submitting...' : 'Submit Recovery Attempt'}
            </Button>
          </form>
        ) : (
          <div className="p-4 bg-sentinel-warning/10 border border-sentinel-warning/30 rounded-lg text-sm text-sentinel-warning">
            Maximum recovery attempts reached.
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DoorOpen size={18} className="text-sentinel-blue" />
          Release History
        </h2>

        <div className="space-y-2">
          {[...analysis.releaseHistory].reverse().map((r: any, i: number) => (
            <div
              key={i}
              className="p-3 bg-sentinel-bg rounded-lg border border-sentinel-border"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant={decisionVariant(r.decision)}>
                  {r.decision}
                </Badge>
                <span className="text-xs text-sentinel-muted">
                  {new Date(r.executedAt).toLocaleString()}
                </span>
              </div>

              <ul className="text-sm text-sentinel-muted space-y-1">
                {r.reasons.map((reason: string, j: number) => (
                  <li key={j}>• {reason}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
