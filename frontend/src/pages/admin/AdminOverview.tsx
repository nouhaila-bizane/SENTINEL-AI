import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, StatCard } from '../../components/ui';
import { Users, Shield, Activity, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <div className="p-12 text-center text-sentinel-muted">Loading platform data...</div>;

  const COLORS = ['#22D3EE', '#3B82F6', '#8B5CF6', '#F59E0B', '#22C55E', '#EF4444'];
  const severityData = stats.charts.severityDistribution.map((d: any) => ({ name: d._id, value: d.count }));
  const releaseData = stats.charts.releaseDistribution.map((d: any) => ({ name: d._id, value: d.count }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <p className="text-sentinel-muted mt-1">Real-time statistics from the database.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.users.total} icon={Users} accent="cyan" />
        <StatCard label="Active Users" value={stats.users.active} icon={CheckCircle2} accent="success" />
        <StatCard label="Total Analyses" value={stats.analyses.total} icon={Shield} accent="blue" />
        <StatCard label="Vulnerabilities" value={stats.vulnerabilities.total} icon={AlertTriangle} accent="danger" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">User Growth (14 days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.charts.userGrowth.map((d: any) => ({ date: d._id, count: d.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#24344D" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#111C2F', border: '1px solid #24344D', borderRadius: 8 }} />
                <Line type="monotone" dataKey="count" stroke="#22D3EE" strokeWidth={2} dot={{ fill: '#22D3EE' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Analyses per Day (14 days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.analysesPerDay.map((d: any) => ({ date: d._id, count: d.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#24344D" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#111C2F', border: '1px solid #24344D', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Vulnerability Severity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {severityData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111C2F', border: '1px solid #24344D', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Release Decisions</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={releaseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {releaseData.map((_: any, i: number) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111C2F', border: '1px solid #24344D', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Top Users by Analyses</h3>
        {stats.charts.topUsers.length === 0 ? (
          <p className="text-sentinel-muted text-sm">No users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-sentinel-muted text-xs uppercase">
                <tr><th className="text-left py-2">User</th><th className="text-left py-2">Email</th><th className="text-right py-2">Analyses</th></tr>
              </thead>
              <tbody className="divide-y divide-sentinel-border">
                {stats.charts.topUsers.map((u: any) => (
                  <tr key={u._id}>
                    <td className="py-2">{u.name}</td>
                    <td className="py-2 text-sentinel-muted">{u.email}</td>
                    <td className="py-2 text-right font-bold">{u.count}</td>
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