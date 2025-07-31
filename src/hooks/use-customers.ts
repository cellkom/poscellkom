import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export interface Customer {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  address: string | null;
}

export const useCustomers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
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
        };

        fetchCustomers();

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
                        setCustomers(prev => prev.filter(c => c.id !== (payload.old as Customer).id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

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
        return data;
    };

    return { customers, loading, addCustomer };
};