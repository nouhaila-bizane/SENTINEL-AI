import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, Badge, EmptyState, Button } from '../../components/ui';
import { PlusCircle, Trash2, FileText } from 'lucide-react';

export default function AnalysesList() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/analyses').then((r) => setAnalyses(r.data.analyses)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this analysis?')) return;
    await api.delete(`/analyses/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">All Analyses</h1>
          <p className="text-sentinel-muted mt-1">Your complete verification history.</p>
        </div>
        <Link to="/app/analyses/new"><Button><PlusCircle size={16} /> New</Button></Link>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sentinel-muted">Loading...</div>
        ) : analyses.length === 0 ? (
          <EmptyState icon={FileText} title="No analyses" description="Create your first analysis." action={<Link to="/app/analyses/new"><Button>New Analysis</Button></Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sentinel-bg text-sentinel-muted text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3">Project</th>
                  <th className="text-left px-5 py-3">Type</th>
                  <th className="text-left px-5 py-3">Created</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Findings</th>
                  <th className="text-left px-5 py-3">Decision</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sentinel-border">
                {analyses.map((a) => (
                  <tr key={a._id} className="hover:bg-sentinel-bg/50">
                    <td className="px-5 py-4 font-medium">{a.projectName}</td>
                    <td className="px-5 py-4 text-sentinel-muted capitalize">{a.analysisType}</td>
                    <td className="px-5 py-4 text-sentinel-muted">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4"><Badge variant={a.status === 'Completed' ? 'success' : 'warning'}>{a.status}</Badge></td>
                    <td className="px-5 py-4 text-sentinel-muted">{a.securityFindings.length + a.specificationFindings.length}</td>
                    <td className="px-5 py-4"><Badge variant={a.currentReleaseDecision === 'PASS' ? 'success' : a.currentReleaseDecision === 'BLOCK' ? 'danger' : 'warning'}>{a.currentReleaseDecision}</Badge></td>
                    <td className="px-5 py-4 flex gap-2 justify-end">
                      <Link to={`/app/analyses/${a._id}`} className="text-sentinel-cyan hover:underline text-xs">View</Link>
                      <button onClick={() => remove(a._id)} className="text-sentinel-danger hover:text-sentinel-danger/80"><Trash2 size={14} /></button>
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