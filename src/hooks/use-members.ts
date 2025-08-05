import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

export interface MemberProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  role: 'Member';
  created_at: string;
}

export const useMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!user) {
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('manage-members', {
        body: { action: 'list' },
      });

      if (invokeError) throw new Error(invokeError.message);
      if (data && data.error) throw new Error(data.error);
      
      setMembers(data as MemberProfile[]);
    } catch (err: any) {
      console.error("Error fetching members:", err);
      setError(err.message);
      showError(`Gagal memuat data member: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMembers();
    if (user) {
      const membersChannel = supabase
        .channel('members-profile-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'members' },
          () => {
            fetchMembers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(membersChannel);
      };
    }
  }, [fetchMembers, user]);

  const updateMember = async (id: string, updates: Partial<Omit<MemberProfile, 'id' | 'email' | 'created_at' | 'role'>>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('manage-members', {
        body: { action: 'update', payload: { id, ...updates } },
      });

      if (invokeError) throw new Error(invokeError.message);
      if (data && data.error) throw new Error(data.error);

      showSuccess("Member berhasil diperbarui!");
      fetchMembers();
      return true;
    } catch (err: any) {
      console.error("Error updating member:", err);
      setError(err.message);
      showError(`Gagal memperbarui member: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('manage-members', {
        body: { action: 'delete', payload: { id } },
      });

      if (invokeError) throw new Error(invokeError.message);
      if (data && data.error) throw new Error(data.error);

      showSuccess("Member berhasil dihapus!");
      fetchMembers();
      return true;
    } catch (err: any) {
      console.error("Error deleting member:", err);
      setError(err.message);
      showError(`Gagal menghapus member: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { members, loading, error, fetchMembers, updateMember, deleteMember };
};