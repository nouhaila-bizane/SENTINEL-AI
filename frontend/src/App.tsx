import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useMaintenance } from './context/MaintenanceContext';
import Landing from './pages/Landing';
import { Login, Register } from './pages/Auth';
import DashboardLayout from './layouts/DashboardLayout';
import UserDashboard from './pages/app/UserDashboard';
import NewAnalysis from './pages/app/NewAnalysis';
import AnalysisDetails from './pages/app/AnalysisDetails';
import AnalysesList from './pages/app/AnalysesList';
import Settings from './pages/app/Settings';
import { SecurityScan, Verification, Recovery, ReleaseGate, Reports } from './pages/app/PlaceholderPages';
import AdminOverview from './pages/admin/AdminOverview';
import UsersManagement from './pages/admin/UsersManagement';
import ActivityLog from './pages/admin/ActivityLog';
import PlatformSettingsPage from './pages/admin/PlatformSettings';
import MaintenancePage from './pages/MaintenancePage';
import { Spinner } from './components/ui';

function Protected({ children, superAdminOnly = false }: { children: React.ReactNode; superAdminOnly?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size={32} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (superAdminOnly && user.role !== 'super_admin') return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { isMaintenanceMode, maintenanceMessage, loading: maintLoading } = useMaintenance();
  const location = useLocation();

  if (authLoading || maintLoading) {
    return <div className="h-screen flex items-center justify-center bg-sentinel-bg"><Spinner size={32} /></div>;
  }

  // Global maintenance gate:
  // - Blocks everyone when maintenance is active, EXCEPT:
  //   1. Super Admins (they need access to /admin/settings to disable maintenance)
  //   2. Visitors on /login (Super Admin must be able to authenticate)
  // - /register is intentionally NOT excluded, so it remains blocked during maintenance.
  // - After a normal user logs in, they are redirected to /app and immediately see the maintenance page.
  if (isMaintenanceMode && user?.role !== 'super_admin' && location.pathname !== '/login') {
    return <MaintenancePage message={maintenanceMessage} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to="/app" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/app" replace /> : <Register />} />

      <Route path="/app" element={<Protected><DashboardLayout><UserDashboard /></DashboardLayout></Protected>} />
      <Route path="/app/analyses" element={<Protected><DashboardLayout><AnalysesList /></DashboardLayout></Protected>} />
      <Route path="/app/analyses/new" element={<Protected><DashboardLayout><NewAnalysis /></DashboardLayout></Protected>} />
      <Route path="/app/analyses/:id" element={<Protected><DashboardLayout><AnalysisDetails /></DashboardLayout></Protected>} />
      <Route path="/app/security" element={<Protected><DashboardLayout><SecurityScan /></DashboardLayout></Protected>} />
      <Route path="/app/verification" element={<Protected><DashboardLayout><Verification /></DashboardLayout></Protected>} />
      <Route path="/app/recovery" element={<Protected><DashboardLayout><Recovery /></DashboardLayout></Protected>} />
      <Route path="/app/release" element={<Protected><DashboardLayout><ReleaseGate /></DashboardLayout></Protected>} />
      <Route path="/app/reports" element={<Protected><DashboardLayout><Reports /></DashboardLayout></Protected>} />
      <Route path="/app/settings" element={<Protected><DashboardLayout><Settings /></DashboardLayout></Protected>} />

      <Route path="/admin" element={<Protected superAdminOnly><DashboardLayout><AdminOverview /></DashboardLayout></Protected>} />
      <Route path="/admin/users" element={<Protected superAdminOnly><DashboardLayout><UsersManagement /></DashboardLayout></Protected>} />
      <Route path="/admin/activity" element={<Protected superAdminOnly><DashboardLayout><ActivityLog /></DashboardLayout></Protected>} />
      <Route path="/admin/settings" element={<Protected superAdminOnly><DashboardLayout><PlatformSettingsPage /></DashboardLayout></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}