import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import PublicPage from './PublicPage';
import { Loader2 } from 'lucide-react';

const HomePage = () => {
  const { profile, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <PublicPage />;
  }

  if (profile?.role === 'Admin' || profile?.role === 'Kasir') {
    return <Navigate to="/dashboard" replace />;
  }

  if (profile?.role === 'Member') {
    return <Navigate to="/member/home" replace />;
  }

  // Fallback untuk kasus lain, idealnya semua pengguna punya peran.
  return <PublicPage />;
};

export default HomePage;