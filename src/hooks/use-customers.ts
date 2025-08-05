import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Customer {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  address: string | null;
}

export const useCustomers = () => {
    const { user } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCustomers = useCallback(async () => {
        if (!user) {
            setCustomers([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            showError(`Gagal memuat data pelanggan: ${error.message}`);
            console.error(error);
        } else {
            setCustomers(data || []);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchCustomers();

        if (user) {
            const channel = supabase
                .channel('customers-channel')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'customers' },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setCustomers(prev => [...prev, payload.new as Customer].sort((a, b) => a.name.localeCompare(b.name)));
                        }
                        if (payload.eventType === 'UPDATE') {
                            setCustomers(prev => prev.map(c => c.id === payload.new.id ? payload.new as Customer : c));
                        }
                        if (payload.eventType === 'DELETE') {
                            setCustomers(prev => prev.filter(c => c.id !== (payload.old as { id: string }).id));
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [fetchCustomers, user]);

    const addCustomer = async (newCustomerData: { name: string; phone: string | null; address: string | null; }) => {
        const { data, error } = await supabase
            .from('customers')
            .insert(newCustomerData)
            .select()
            .single();

        if (error) {
            showError(`Gagal menambah pelanggan: ${error.message}`);
            console.error(error);
            return null;
        }
        showSuccess("Pelanggan baru berhasil ditambahkan!");
        setCustomers(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        return data;
    };

    const updateCustomer = async (id: string, updatedData: Partial<Omit<Customer, 'id' | 'created_at'>>) => {
        const { data, error } = await supabase
            .from('customers')
            .update(updatedData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            showError(`Gagal memperbarui pelanggan: ${error.message}`);
            return null;
        }
        showSuccess("Data pelanggan berhasil diperbarui!");
        setCustomers(prev => prev.map(c => c.id === id ? data : c));
        return data;
    };

    const deleteCustomer = async (id: string) => {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) {
            if (error.message.includes('violates foreign key constraint')) {
                showError("Gagal menghapus: Pelanggan ini memiliki riwayat transaksi dan tidak dapat dihapus.");
            } else {
                showError(`Gagal menghapus pelanggan: ${error.message}`);
            }
            return false;
        }
        showSuccess("Pelanggan berhasil dihapus!");
        setCustomers(prev => prev.filter(c => c.id !== id));
        return true;
    };

    return { customers, loading, addCustomer, updateCustomer, deleteCustomer };
};