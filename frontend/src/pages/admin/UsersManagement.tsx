import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Button, Input, Badge, EmptyState } from '../../components/ui';
import { Search, UserX, UserCheck, Trash2, Eye } from 'lucide-react';

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    api.get(`/users?${params.toString()}`).then((r) => {
      setUsers(r.data.users);
      setTotal(r.data.total);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (id: string, current: boolean) => {
    if (!confirm(`${current ? 'Suspend' : 'Activate'} this user?`)) return;
    await api.patch(`/users/${id}/status`, { isActive: !current });
    load();
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Permanently delete this user and all their data?')) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed');
    }
  };

  const changeRole = async (id: string, role: string) => {
    if (!confirm(`Change role to ${role}?`)) return;
    await api.patch(`/users/${id}/role`, { role });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-sentinel-muted mt-1">{total} total users</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sentinel-muted" size={16} />
            <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} onBlur={load} className="pl-10" />
          </div>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setTimeout(load, 50); }} className="auth-input md:w-48">
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sentinel-muted">Loading...</div>
        ) : users.length === 0 ? (
          <EmptyState icon={UserCheck} title="No users found" description="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sentinel-bg text-sentinel-muted text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">Role</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Analyses</th>
                  <th className="text-left px-5 py-3">Joined</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sentinel-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-sentinel-bg/50">
                    <td className="px-5 py-3 font-medium">{u.name}</td>
                    <td className="px-5 py-3 text-sentinel-muted">{u.email}</td>
                    <td className="px-5 py-3">
                      <select value={u.role} onChange={(e) => changeRole(u._id, e.target.value)} disabled={u.role === 'super_admin'} className="bg-transparent text-xs border border-sentinel-border rounded px-2 py-1">
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                        <option value="super_admin">super_admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Suspended'}</Badge>
                    </td>
                    <td className="px-5 py-3 text-sentinel-muted">{u.analysisCount}</td>
                    <td className="px-5 py-3 text-sentinel-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 flex gap-2 justify-end">
                      <button onClick={() => setSelected(u)} className="text-sentinel-cyan hover:underline text-xs flex items-center gap-1"><Eye size={12} /> Details</button>
                      {u.role !== 'super_admin' && (
                        <>
                          <button onClick={() => toggleStatus(u._id, u.isActive)} className="text-sentinel-warning hover:underline text-xs">{u.isActive ? 'Suspend' : 'Activate'}</button>
                          <button onClick={() => deleteUser(u._id)} className="text-sentinel-danger hover:underline text-xs flex items-center gap-1"><Trash2 size={12} /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-sentinel-card rounded-xl border border-sentinel-border max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{selected.name}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div><p className="text-sentinel-muted">Email</p><p>{selected.email}</p></div>
              <div><p className="text-sentinel-muted">Role</p><p className="capitalize">{selected.role}</p></div>
              <div><p className="text-sentinel-muted">Status</p><p>{selected.isActive ? 'Active' : 'Suspended'}</p></div>
              <div><p className="text-sentinel-muted">Last login</p><p>{selected.lastLogin ? new Date(selected.lastLogin).toLocaleString() : 'Never'}</p></div>
              <div><p className="text-sentinel-muted">Login count</p><p>{selected.loginCount}</p></div>
              <div><p className="text-sentinel-muted">Joined</p><p>{new Date(selected.createdAt).toLocaleString()}</p></div>
            </div>
            <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}