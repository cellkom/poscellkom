import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null; // This field might not be populated by the edge function's list action
  role: 'Admin' | 'Kasir';
  created_at: string;
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
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('manage-users', {
        body: { action: 'list' },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }
      if (data && data.error) {
        throw new Error(data.error);
      }
      
      setUsers(data as UserProfile[]);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message);
      showError(`Gagal memuat data pengguna: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
    if (user) {
      const usersChannel = supabase
        .channel('users-profile-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users' },
          () => {
            fetchUsers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(usersChannel);
      };
    }
  }, [fetchUsers, user]);

  const addUser = async (email: string, password: string, full_name: string, role: 'Admin' | 'Kasir') => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('manage-users', {
        body: { action: 'create', payload: { email, password, full_name, role } },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }
      if (data && data.error) {
        throw new Error(data.error);
      }

      showSuccess("Pengguna berhasil ditambahkan!");
      fetchUsers(); // Re-fetch users to update the list
      return true;
    } catch (err: any) {
      console.error("Error adding user:", err);
      setError(err.message);
      showError(`Gagal menambahkan pengguna: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, updates: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at'>>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('manage-users', {
        body: { action: 'update', payload: { id, ...updates } },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }
      if (data && data.error) {
        throw new Error(data.error);
      }

      showSuccess("Pengguna berhasil diperbarui!");
      fetchUsers(); // Re-fetch users to update the list
      return true;
    } catch (err: any) {
      console.error("Error updating user:", err);
      setError(err.message);
      showError(`Gagal memperbarui pengguna: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('manage-users', {
        body: { action: 'delete', payload: { id } },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }
      if (data && data.error) {
        throw new Error(data.error);
      }

      showSuccess("Pengguna berhasil dihapus!");
      fetchUsers(); // Re-fetch users to update the list
      return true;
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError(err.message);
      showError(`Gagal menghapus pengguna: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, fetchUsers, addUser, updateUser, deleteUser };
};