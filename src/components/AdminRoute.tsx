import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { showError } from '@/utils/toast';

const AdminRoute = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Memeriksa Hak Akses...</h1>
        </div>
      </div>
    );
  }

  if (profile?.role !== 'Admin') {
    showError("Akses ditolak. Halaman ini hanya untuk Admin.");
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;