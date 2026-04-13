import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
