import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Button, Input } from '../../components/ui';
import { Sliders } from 'lucide-react';

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { api.get('/admin/settings').then((r) => setSettings(r.data.settings)); }, []);

  const save = async () => {
    await api.patch('/admin/settings', settings);
    setMsg('Settings saved');
    setTimeout(() => setMsg(''), 3000);
  };

  if (!settings) return <div className="p-12 text-center text-sentinel-muted">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div><h1 className="text-3xl font-bold">Platform Settings</h1><p className="text-sentinel-muted mt-1">Configure global platform behavior.</p></div>
      {msg && <div className="p-3 rounded-lg bg-sentinel-success/10 border border-sentinel-success/30 text-sentinel-success text-sm">{msg}</div>}
      <Card className="p-6 space-y-4">
        <label className="flex items-center justify-between p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
          <div><p className="font-medium">Allow Registration</p><p className="text-xs text-sentinel-muted">Let new users create accounts.</p></div>
          <input type="checkbox" checked={settings.allowRegistration} onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })} />
        </label>
        <label className="flex items-center justify-between p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
          <div><p className="font-medium">Maintenance Mode</p><p className="text-xs text-sentinel-muted">Restrict access during maintenance.</p></div>
          <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
        </label>
        <div>
          <label className="block text-sm mb-1.5">Maintenance message</label>
          <Input value={settings.maintenanceMessage} onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1.5">Max recovery attempts per analysis</label>
          <Input type="number" min={0} max={10} value={settings.maxRecoveryAttempts} onChange={(e) => setSettings({ ...settings, maxRecoveryAttempts: Number(e.target.value) })} />
        </div>
        <Button onClick={save}><Sliders size={16} /> Save settings</Button>
      </Card>
    </div>
  );
}