import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { selectIsAuthenticated } from '../store/authSlice';

export function ProtectedRoute() {
  const ok = useSelector((s: RootState) => selectIsAuthenticated(s));
  if (!ok) return <Navigate to="/login" replace />;
  return <Outlet />;
}
