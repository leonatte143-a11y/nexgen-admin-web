import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { defaultPathForRole, hasPermission, PERMISSIONS } from '../config/rbac';
import { DashboardPage } from '../pages/DashboardPage';

export function RoleHome() {
  const admin = useSelector((s: RootState) => s.auth.admin);
  const mustReset = Boolean(admin?.mustResetPassword);
  if (mustReset) return <Navigate to="/reset-password" replace />;
  if (!hasPermission(admin?.role, PERMISSIONS.DASHBOARD_VIEW)) {
    const path = defaultPathForRole(admin?.role);
    if (path !== '/') return <Navigate to={path} replace />;
  }
  return <DashboardPage />;
}
