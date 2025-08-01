import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import MemberLayout from '@/components/Layout/MemberLayout';
import { Loader2 } from 'lucide-react';

const MemberRoute = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role === 'Member') {
    return (
      <MemberLayout>
        <Outlet />
      </MemberLayout>
    );
  }

  if (profile?.role === 'Admin' || profile?.role === 'Kasir') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default MemberRoute;