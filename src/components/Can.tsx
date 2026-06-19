import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { hasPermission, type Permission } from '../config/rbac';

interface CanProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const role = useSelector((s: RootState) => s.auth.admin?.role);
  const customPermissions = useSelector((s: RootState) => s.auth.admin?.permissions);
  if (!hasPermission(role, permission, customPermissions)) return <>{fallback}</>;
  return <>{children}</>;
}
