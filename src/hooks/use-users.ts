import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'Admin' | 'Kasir';
}

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, role');

    if (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
      showError("Gagal memuat data pengguna.");
    } else {
      setUsers(data as UserProfile[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = async (email: string, password: string, full_name: string, role: 'Admin' | 'Kasir') => {
    setLoading(true);
    setError(null);
    try {
      // Sign up the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name,
            // Do not set 'is_member' here, as this is for staff users
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Gagal membuat pengguna autentikasi.");
      }

      // Update the public.users table with the role
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: role })
        .eq('id', authData.user.id);

      if (updateError) {
        // If updating role fails, consider deleting the auth user to prevent orphaned entries
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(updateError.message);
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

  const updateUser = async (id: string, updates: Partial<Omit<UserProfile, 'id'>>) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error("Error updating user:", error);
      setError(error.message);
      showError("Gagal memperbarui pengguna.");
      return false;
    } else {
      showSuccess("Pengguna berhasil diperbarui!");
      fetchUsers(); // Re-fetch users to update the list
      return true;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // First, delete from public.users table
      const { error: deleteProfileError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (deleteProfileError) {
        throw new Error(deleteProfileError.message);
      }

      // Note: Deleting from auth.users requires an admin key and should ideally be done via an Edge Function
      // For simplicity in client-side, we only delete from public.users.
      // If you need to delete the actual Supabase Auth user, you'd need a server-side function.
      // The current schema has ON DELETE CASCADE from auth.users to public.profiles (which is 'users' table here),
      // so if you delete from auth.users, it will cascade. But we are deleting from public.users here.
      // To fully delete the auth user, you would need to call supabase.auth.admin.deleteUser(id) from a secure backend.
      // For this client-side implementation, we only remove the profile from the public.users table.

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