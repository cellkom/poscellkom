import { createContext, useContext, useEffect, useState } from 'react';
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    navigate('/');
  };

  const fetchProfile = async (currentUser: User): Promise<UserProfile | null> => {
    // Coba ambil profil dari tabel 'users' (staf)
    const { data: staffProfiles, error: staffError } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id);

    if (staffError) {
      console.error("Error fetching staff profile:", staffError);
    } else if (staffProfiles && staffProfiles.length > 0) {
      return staffProfiles[0];
    }

    // Jika bukan staf, coba ambil dari tabel 'members'
    const { data: memberProfiles, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', currentUser.id);

    if (memberError) {
      console.error("Error fetching member profile:", memberError);
    } else if (memberProfiles && memberProfiles.length > 0) {
      return { ...memberProfiles[0], role: 'Member', email: currentUser.email };
    }

    return null;
  };
  
  const refreshProfile = async () => {
      if (user) {
          const currentProfile = await fetchProfile(user);
          setProfile(currentProfile);
      }
  }

  useEffect(() => {
    const setAuthData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        setLoading(false);
        return;
      }

      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const currentProfile = await fetchProfile(currentUser);
        setProfile(currentProfile);
      }
      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        const currentProfile = await fetchProfile(currentUser);
        setProfile(currentProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    setAuthData();

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

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