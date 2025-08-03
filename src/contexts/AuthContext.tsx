import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

export interface UserProfile {
  id: string;
  full_name: string;
  role?: 'Admin' | 'Kasir' | 'Member';
  avatar_url?: string | null;
  phone?: string | null;
  address?: string | null;
  email?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async (currentUser: User): Promise<UserProfile | null> => {
    // Coba ambil profil dari tabel 'users' (staf)
    const { data: staffProfile, error: staffError } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (staffError && staffError.code !== 'PGRST116') {
      console.error("Error fetching staff profile:", staffError);
      throw staffError;
    }
    if (staffProfile) {
      return staffProfile;
    }

    // Jika bukan staf, coba ambil dari tabel 'members'
    const { data: memberProfile, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (memberError && memberError.code !== 'PGRST116') {
      console.error("Error fetching member profile:", memberError);
      throw memberError;
    }
    if (memberProfile) {
      return { ...memberProfile, role: 'Member', email: currentUser.email };
    }

    console.warn(`No profile found for user ${currentUser.id}. This might happen if the user was created but the profile trigger failed.`);
    return null;
  }, []);

  const signOut = async () => {
    const lastRole = profile?.role;
    
    await supabase.auth.signOut();
    
    setSession(null);
    setUser(null);
    setProfile(null);

    if (lastRole === 'Admin' || lastRole === 'Kasir') {
      navigate('/login');
    } else {
      navigate('/member-login');
    }
  };
  
  const refreshProfile = useCallback(async () => {
      if (user) {
          const currentProfile = await fetchProfile(user);
          setProfile(currentProfile);
      }
  }, [user, fetchProfile]);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          const currentProfile = await fetchProfile(currentUser);
          setProfile(currentProfile);
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error("Error handling auth state change:", e);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};