import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const MemberRoute = () => {
  const { session, loading: authLoading } = useAuth();
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth context to finish loading
    }

    if (!session?.user) {
      setIsMember(false);
      setIsVerifying(false);
      return;
    }

    const verifyMembership = async () => {
      setIsVerifying(true);
      const { data, error } = await supabase
        .from('members')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error verifying membership:", error);
        setIsMember(false);
      } else {
        setIsMember(!!data);
      }
      setIsVerifying(false);
    };

    verifyMembership();
  }, [session, authLoading]);

  if (authLoading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return isMember ? <Outlet /> : <Navigate to="/member-login" replace />;
};

export default MemberRoute;