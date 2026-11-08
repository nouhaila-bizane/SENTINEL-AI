import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, StatCard, Badge, EmptyState, Button } from '../../components/ui';
import { Shield, AlertTriangle, CheckCircle2, Clock, PlusCircle, FileText } from 'lucide-react';

interface Analysis {
  _id: string;
  projectName: string;
  status: string;
  currentReleaseDecision: string;
  createdAt: string;
  securityFindings: any[];
  specificationFindings: any[];
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analyses').then((r) => setAnalyses(r.data.analyses)).finally(() => setLoading(false));
  }, []);

  const critical = analyses.reduce((a, c) => a + c.securityFindings.filter((f) => f.severity === 'Critical').length, 0);
  const passed = analyses.filter((a) => a.currentReleaseDecision === 'PASS').length;
  const blocked = analyses.filter((a) => a.currentReleaseDecision === 'BLOCK').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="text-sentinel-muted mt-1">Here's your verification overview.</p>
        </div>
        <Link to="/app/analyses/new"><Button><PlusCircle size={16} /> New Analysis</Button></Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Analyses" value={analyses.length} icon={FileText} accent="cyan" />
        <StatCard label="Critical Issues" value={critical} icon={AlertTriangle} accent="danger" />
        <StatCard label="Passed Releases" value={passed} icon={CheckCircle2} accent="success" />
        <StatCard label="Blocked Releases" value={blocked} icon={Shield} accent="warning" />
      </div>

      <Card className="overflow-hidden">
        <div className="p-5 border-b border-sentinel-border flex items-center justify-between">
          <h2 className="font-semibold">Recent Analyses</h2>
          <Link to="/app/analyses" className="text-sm text-sentinel-cyan hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="p-12 text-center text-sentinel-muted">Loading...</div>
        ) : analyses.length === 0 ? (
          <EmptyState icon={FileText} title="No analyses yet" description="Create your first analysis to start verifying your software." action={<Link to="/app/analyses/new"><Button>New Analysis</Button></Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sentinel-bg text-sentinel-muted text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3">Project</th>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Findings</th>
                  <th className="text-left px-5 py-3">Decision</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sentinel-border">
                {analyses.slice(0, 8).map((a) => (
                  <tr key={a._id} className="hover:bg-sentinel-bg/50 transition">
                    <td className="px-5 py-4 font-medium">{a.projectName}</td>
                    <td className="px-5 py-4 text-sentinel-muted">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4"><Badge variant={a.status === 'Completed' ? 'success' : 'warning'}>{a.status}</Badge></td>
                    <td className="px-5 py-4 text-sentinel-muted">{a.securityFindings.length}</td>
                    <td className="px-5 py-4">
                      <Badge variant={a.currentReleaseDecision === 'PASS' ? 'success' : a.currentReleaseDecision === 'BLOCK' ? 'danger' : 'warning'}>
                        {a.currentReleaseDecision}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link to={`/app/analyses/${a._id}`} className="text-sentinel-cyan hover:underline text-xs">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}