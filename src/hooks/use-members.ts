import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

export interface MemberProfile {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: 'Member';
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

    // Corrected RPC function name from get_member_users to get_all_members
    const { data, error: rpcError } = await supabase.rpc('get_all_members');

    if (rpcError) {
      showError(`Gagal memuat data member: ${rpcError.message}`);
      setError(rpcError.message);
      setMembers([]);
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const updateMember = async (id: string, updates: { full_name: string; phone: string | null; address: string | null; }) => {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id);

    if (error) {
      showError(`Gagal memperbarui member: ${error.message}`);
      return false;
    }
    showSuccess("Member berhasil diperbarui.");
    fetchMembers();
    return true;
  };

  const deleteMember = async (id: string) => {
    const { error } = await supabase.functions.invoke('delete-user', {
      body: { userId: id },
    });

    if (error) {
      showError(`Gagal menghapus member: ${error.message}`);
      return false;
    }
    showSuccess("Member berhasil dihapus.");
    fetchMembers();
    return true;
  };

  return { members, loading, error, fetchMembers, updateMember, deleteMember };
};