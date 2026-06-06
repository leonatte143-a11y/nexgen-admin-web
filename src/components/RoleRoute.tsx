import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { defaultPathForRole, hasAnyPermission, type Permission } from '../config/rbac';

interface RoleRouteProps {
  permission: Permission | Permission[];
}

export function RoleRoute({ permission }: RoleRouteProps) {
  const role = useSelector((s: RootState) => s.auth.admin?.role);
  const perms = Array.isArray(permission) ? permission : [permission];
  if (!hasAnyPermission(role, perms)) {
    return <Navigate to={defaultPathForRole(role)} replace />;
  }
  return <Outlet />;
}
