import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, PlusCircle, FileText, Shield, CheckSquare, RotateCcw,
  DoorOpen, Settings, LogOut, ShieldCheck, Users, Activity, Sliders, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isSuperAdmin = user?.role === 'super_admin';

  const userLinks = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/analyses/new', label: 'New Analysis', icon: PlusCircle },
    { to: '/app/analyses', label: 'All Analyses', icon: FileText },
    { to: '/app/security', label: 'Security Scan', icon: Shield },
    { to: '/app/verification', label: 'Verification', icon: CheckSquare },
    { to: '/app/recovery', label: 'Recovery', icon: RotateCcw },
    { to: '/app/release', label: 'Release Gate', icon: DoorOpen },
    { to: '/app/reports', label: 'Reports', icon: FileText },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/activity', label: 'Activity', icon: Activity },
    { to: '/admin/settings', label: 'Platform Settings', icon: Sliders },
  ];

  const links = isSuperAdmin ? [...userLinks, { to: '/admin', label: '— Admin —', icon: ShieldCheck }, ...adminLinks] : userLinks;

  return (
    <div className="min-h-screen bg-sentinel-bg flex">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-sentinel-card border-r border-sentinel-border flex flex-col transition-transform',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <div className="h-16 px-6 flex items-center justify-between border-b border-sentinel-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sentinel-cyan to-sentinel-purple flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-bold tracking-wider text-sentinel-text">SENTINEL</span>
          </Link>
          <button onClick={() => setOpen(false)} className="md:hidden text-sentinel-muted"><X size={20} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
          {links.map((link) => {
            const active = location.pathname === link.to || (link.to !== '/app' && location.pathname.startsWith(link.to));
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  active
                    ? 'bg-gradient-to-r from-sentinel-blue/20 to-sentinel-cyan/10 text-sentinel-cyan border border-sentinel-cyan/20'
                    : 'text-sentinel-muted hover:text-sentinel-text hover:bg-sentinel-bg'
                )}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sentinel-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sentinel-cyan to-sentinel-purple flex items-center justify-center text-sm font-bold text-white">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sentinel-text truncate">{user?.name}</p>
              <p className="text-xs text-sentinel-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sentinel-danger hover:bg-sentinel-danger/10 transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <header className="h-16 border-b border-sentinel-border bg-sentinel-bg/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-6 gap-4">
          <button onClick={() => setOpen(true)} className="md:hidden text-sentinel-text"><Menu size={22} /></button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-xs text-sentinel-muted">
            <div className="w-2 h-2 rounded-full bg-sentinel-success animate-pulse" />
            <span>System Operational</span>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}