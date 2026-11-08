import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Card, Button, Input } from '../../components/ui';
import { User, Lock, Bell } from 'lucide-react';

export default function Settings() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [prefs, setPrefs] = useState(user?.notificationPreferences || { emailAnalysisComplete: true, emailSecurityAlerts: true, emailReleaseDecisions: true });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      await api.patch('/users/me', { name, notificationPreferences: prefs });
      await refresh();
      setMsg('Profile updated');
    } catch (e: any) { setErr(e.response?.data?.message || 'Failed'); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setMsg('');
    if (newPassword !== confirm) return setErr('Passwords do not match');
    try {
      await api.post('/users/me/change-password', { currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirm('');
      setMsg('Password changed');
    } catch (e: any) { setErr(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-sentinel-muted mt-1">Manage your profile and preferences.</p>
      </div>

      {msg && <div className="p-3 rounded-lg bg-sentinel-success/10 border border-sentinel-success/30 text-sentinel-success text-sm">{msg}</div>}
      {err && <div className="p-3 rounded-lg bg-sentinel-danger/10 border border-sentinel-danger/30 text-sentinel-danger text-sm">{err}</div>}

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><User size={18} /> Profile</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1.5">Email</label>
            <Input value={user?.email} disabled className="opacity-60" />
          </div>
          <div>
            <label className="block text-sm mb-1.5">Role</label>
            <Input value={user?.role} disabled className="opacity-60 capitalize" />
          </div>
          <Button type="submit">Save profile</Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Lock size={18} /> Change password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div><label className="block text-sm mb-1.5">Current password</label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div>
          <div><label className="block text-sm mb-1.5">New password</label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
          <div><label className="block text-sm mb-1.5">Confirm new password</label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
          <Button type="submit">Change password</Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Bell size={18} /> Notifications</h2>
        <div className="space-y-3">
          {Object.entries(prefs).map(([key, val]) => (
            <label key={key} className="flex items-center justify-between p-3 bg-sentinel-bg rounded-lg border border-sentinel-border cursor-pointer">
              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <input type="checkbox" checked={val as boolean} onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })} />
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}