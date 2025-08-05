import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async (currentUser: User): Promise<UserProfile | null> => {
    let { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error fetching profile:", error);
      return null;
    }

    // Self-healing: If profile does not exist, create it.
    if (!userProfile) {
      console.log(`Profile for ${currentUser.id} not found. Attempting to create one from auth metadata.`);
      const fullName = currentUser.user_metadata?.full_name || 'Nama Belum Diatur';
      const role = currentUser.user_metadata?.role || 'Kasir'; // Default to Kasir as a safe staff role
      const phone = currentUser.user_metadata?.phone || null;
      const address = currentUser.user_metadata?.address || null;

      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert({ id: currentUser.id, full_name: fullName, role, phone, address })
        .select()
        .single();

      if (insertError) {
        console.error("Failed to self-heal by creating profile:", insertError);
        return null;
      }
      
      console.log("Successfully created missing profile via self-healing.");
      userProfile = newProfile;
    }

    // Self-healing for missing role on an existing profile
    if (userProfile && !userProfile.role) {
      console.log(`Profile for ${currentUser.id} is missing a role. Assigning 'Admin' as default for staff.`);
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({ role: 'Admin' })
        .eq('id', currentUser.id)
        .select()
        .single();
      
      if (updateError) {
        console.error("Failed to self-heal missing role:", updateError);
      } else {
        console.log("Successfully assigned 'Admin' role.");
        userProfile = updatedProfile;
      }
    }

    return userProfile ? { ...userProfile, email: currentUser.email } : null;
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
      const currentUser = user;
      if (currentUser) {
          const currentProfile = await fetchProfile(currentUser);
          setProfile(currentProfile);
      }
  }, [user, fetchProfile]);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      const currentUser = initialSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const currentProfile = await fetchProfile(currentUser);
        setProfile(currentProfile);
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const currentProfile = await fetchProfile(currentUser);
        setProfile(currentProfile);
      } else {
        setProfile(null);
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