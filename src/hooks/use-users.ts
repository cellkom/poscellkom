import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  role: 'Admin' | 'Kasir';
}

export const useUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!user) {
      setUsers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc('get_staff_users');

    if (rpcError) {
      showError(`Gagal memuat data user: ${rpcError.message}`);
      setError(rpcError.message);
      setUsers([]);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = async (email: string, password: string, fullName: string, role: 'Admin' | 'Kasir') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          is_member: false,
        },
      },
    });

    if (error) {
      showError(`Gagal menambah user: ${error.message}`);
      return false;
    }
    if (data.user) {
      showSuccess("User berhasil ditambahkan. Mereka perlu memverifikasi email mereka.");
      fetchUsers(); // Refresh list
      return true;
    }
    return false;
  };

  const updateUser = async (id: string, updates: { full_name: string; role: 'Admin' | 'Kasir' }) => {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id);

    if (error) {
      showError(`Gagal memperbarui user: ${error.message}`);
      return false;
    }
    showSuccess("User berhasil diperbarui.");
    fetchUsers(); // Refresh list
    return true;
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.functions.invoke('delete-user', {
      body: { userId: id },
    });

    if (error) {
      showError(`Gagal menghapus user: ${error.message}`);
      return false;
    }
    showSuccess("User berhasil dihapus.");
    fetchUsers(); // Refresh list
    return true;
  };

  return { users, loading, error, fetchUsers, addUser, updateUser, deleteUser };
};