import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { profile, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Memuat sesi...</h1>
          <Loader2 className="mx-auto mt-4 h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    if (allowedRoles.includes('Admin') || allowedRoles.includes('Kasir')) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to="/member-login" replace />;
  }

  if (!profile || !allowedRoles.includes(profile.role || '')) {
    if (profile?.role === 'Member' && (allowedRoles.includes('Admin') || allowedRoles.includes('Kasir'))) {
        return <Navigate to="/member-login" replace />;
    }
    if ((profile?.role === 'Admin' || profile?.role === 'Kasir') && allowedRoles.includes('Member')) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles.includes('Admin') || allowedRoles.includes('Kasir')) {
        return <Navigate to="/login" replace />;
    }
    return <Navigate to="/member-login" replace />;
  }

  return children;
};

export default ProtectedRoute;