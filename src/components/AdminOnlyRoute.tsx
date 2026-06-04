import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { normalizeRole } from '../config/rbac';

/** Full admin role only (not manager/hr). */
export function AdminOnlyRoute() {
  const role = useSelector((s: RootState) => s.auth.admin?.role);
  if (normalizeRole(role) !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
