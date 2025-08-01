import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const StaffRoute = () => {
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

  if (profile?.role === 'Admin' || profile?.role === 'Kasir') {
    return <Outlet />;
  }

  if (profile?.role === 'Member') {
    return <Navigate to="/member/home" replace />;
  }

  // Fallback if profile is somehow not loaded or has a weird role
  return <Navigate to="/login" replace />;
};

export default StaffRoute;