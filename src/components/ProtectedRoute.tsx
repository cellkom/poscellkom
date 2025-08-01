import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Memeriksa Sesi...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect members away from the dashboard
  if (profile?.role === 'Member') {
    return <Navigate to="/products" replace />;
  }

  // Allow Admins and Kasir to access the dashboard routes
  if (profile?.role === 'Admin' || profile?.role === 'Kasir') {
    return <Outlet />;
  }

  // Fallback for any other case (e.g., profile still loading or unexpected role)
  // This prevents rendering the outlet incorrectly.
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;