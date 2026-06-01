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
  if (!hasPermission(role, permission)) return <>{fallback}</>;
  return <>{children}</>;
}
