import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

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
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc('get_all_members');

    if (rpcError) {
      showError(`Gagal memuat data member: ${rpcError.message}`);
      setError(rpcError.message);
      setMembers([]);
    } else {
      setMembers((data as MemberProfile[]) || []);
    }
    setLoading(false);
  }, []);

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