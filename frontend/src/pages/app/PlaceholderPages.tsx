import { Link } from 'react-router-dom';
import { Card, Button, EmptyState } from '../../components/ui';
import { Shield, CheckSquare, RotateCcw, DoorOpen, FileText, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../services/api';

export function SecurityScan() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Security Scan</h1><p className="text-sentinel-muted mt-1">Deterministic security analysis across all your projects.</p></div>
      <Card className="p-6"><EmptyState icon={Shield} title="Security scan module" description="Create a new analysis to run a full security scan with evidence." action={<Link to="/app/analyses/new"><Button><PlusCircle size={16} /> New Analysis</Button></Link>} /></Card>
    </div>
  );
}

export function Verification() {
  const [stats, setStats] = useState({ runs: 0, passed: 0, failed: 0 });
  useEffect(() => {
    api.get('/analyses').then((r) => {
      const analyses = r.data.analyses;
      const runs = analyses.reduce((a: number, c: any) => a + c.verificationRuns.length, 0);
      const passed = analyses.reduce((a: number, c: any) => a + c.verificationRuns.reduce((x: number, r: any) => x + r.summary.passed, 0), 0);
      const failed = analyses.reduce((a: number, c: any) => a + c.verificationRuns.reduce((x: number, r: any) => x + r.summary.failed, 0), 0);
      setStats({ runs, passed, failed });
    });
  }, []);
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Verification</h1><p className="text-sentinel-muted mt-1">Verification runs across your analyses.</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5"><p className="text-xs text-sentinel-muted uppercase">Total Runs</p><p className="text-2xl font-bold mt-1">{stats.runs}</p></Card>
        <Card className="p-5"><p className="text-xs text-sentinel-muted uppercase">Passed Checks</p><p className="text-2xl font-bold mt-1 text-sentinel-success">{stats.passed}</p></Card>
        <Card className="p-5"><p className="text-xs text-sentinel-muted uppercase">Failed Checks</p><p className="text-2xl font-bold mt-1 text-sentinel-danger">{stats.failed}</p></Card>
      </div>
    </div>
  );
}

export function Recovery() {
  const [count, setCount] = useState(0);
  useEffect(() => { api.get('/analyses').then((r) => setCount(r.data.analyses.reduce((a: number, c: any) => a + c.recoveryAttempts.length, 0))); }, []);
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Recovery</h1><p className="text-sentinel-muted mt-1">Track correction attempts (max 2 per analysis).</p></div>
      <Card className="p-5"><p className="text-xs text-sentinel-muted uppercase">Total Attempts</p><p className="text-2xl font-bold mt-1">{count}</p></Card>
    </div>
  );
}

export function ReleaseGate() {
  const [data, setData] = useState({ pass: 0, block: 0, retry: 0 });
  useEffect(() => {
    api.get('/analyses').then((r) => {
      const a = r.data.analyses;
      setData({
        pass: a.filter((x: any) => x.currentReleaseDecision === 'PASS').length,
        block: a.filter((x: any) => x.currentReleaseDecision === 'BLOCK').length,
        retry: a.filter((x: any) => x.currentReleaseDecision === 'RETRY').length,
      });
    });
  }, []);
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Release Gate</h1><p className="text-sentinel-muted mt-1">Release decisions based on real evidence.</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5 border-sentinel-success/30"><p className="text-xs text-sentinel-success uppercase">PASS</p><p className="text-3xl font-bold mt-1">{data.pass}</p></Card>
        <Card className="p-5 border-sentinel-danger/30"><p className="text-xs text-sentinel-danger uppercase">BLOCK</p><p className="text-3xl font-bold mt-1">{data.block}</p></Card>
        <Card className="p-5 border-sentinel-warning/30"><p className="text-xs text-sentinel-warning uppercase">RETRY</p><p className="text-3xl font-bold mt-1">{data.retry}</p></Card>
      </div>
    </div>
  );
}

export function Reports() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  useEffect(() => { api.get('/analyses').then((r) => setAnalyses(r.data.analyses)); }, []);
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Reports & Evidence</h1><p className="text-sentinel-muted mt-1">Downloadable PDF reports for each analysis.</p></div>
      <Card className="overflow-hidden">
        {analyses.length === 0 ? (
          <EmptyState icon={FileText} title="No reports" description="Complete an analysis to generate reports." />
        ) : (
          <div className="divide-y divide-sentinel-border">
            {analyses.map((a) => (
              <div key={a._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{a.projectName}</p>
                  <p className="text-xs text-sentinel-muted">{new Date(a.createdAt).toLocaleString()} • {a.currentReleaseDecision}</p>
                </div>
                <Link to={`/app/analyses/${a._id}`}><Button variant="secondary" size="sm">Open & Export</Button></Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}