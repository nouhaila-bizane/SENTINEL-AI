import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Badge } from '../../components/ui';
import { Activity } from 'lucide-react';

export default function ActivityLog() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => { api.get('/admin/activity').then((r) => setLogs(r.data.logs)); }, []);

  const actionColor = (a: string): any => {
    if (a.includes('LOGIN') || a.includes('REGISTER')) return 'success';
    if (a.includes('DELETE') || a.includes('FAILED')) return 'danger';
    if (a.includes('STATUS') || a.includes('ROLE')) return 'warning';
    return 'info';
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Platform Activity</h1><p className="text-sentinel-muted mt-1">Full audit trail of privileged actions.</p></div>
      <Card className="p-6">
        <div className="space-y-3">
          {logs.length === 0 ? (
            <p className="text-sentinel-muted text-center py-8">No activity yet.</p>
          ) : logs.map((l) => (
            <div key={l._id} className="flex items-start gap-3 pb-3 border-b border-sentinel-border last:border-0">
              <div className="w-8 h-8 rounded-full bg-sentinel-bg border border-sentinel-border flex items-center justify-center flex-shrink-0">
                <Activity size={14} className="text-sentinel-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={actionColor(l.action)}>{l.action}</Badge>
                  <span className="text-xs text-sentinel-muted">{l.actorEmail || 'System'}</span>
                </div>
                {l.details && <p className="text-sm text-sentinel-text mt-1">{l.details}</p>}
                <p className="text-xs text-sentinel-muted mt-1">{new Date(l.createdAt).toLocaleString()} • {l.ipAddress || '-'}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}