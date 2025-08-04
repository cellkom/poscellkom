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
    // Menggunakan VIEW user_profiles untuk pencarian yang lebih efisien
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
      console.error("Error fetching unified profile:", error);
      throw error;
    }

    if (userProfile) {
      // Menambahkan email dari session karena tidak ada di VIEW
      return { ...userProfile, email: currentUser.email };
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
    const setAuthData = async (session: Session | null) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const currentProfile = await fetchProfile(currentUser);
          setProfile(currentProfile);
        } catch (e) {
          console.error("Error fetching profile:", e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    };

    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await setAuthData(session);
      } catch (error) {
        console.error("Error during session initialization:", error);
        await setAuthData(null);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        await setAuthData(session);
      } catch (error) {
        console.error("Error in onAuthStateChange handler:", error);
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