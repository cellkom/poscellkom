import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export interface Supplier {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  address: string | null;
}

export const useSuppliers = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuppliers = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                showError(`Gagal memuat data supplier: ${error.message}`);
                console.error(error);
            } else {
                setSuppliers(data || []);
            }
            setLoading(false);
        };

        fetchSuppliers();

        const channel = supabase
            .channel('suppliers-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'suppliers' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setSuppliers(prev => [...prev, payload.new as Supplier].sort((a, b) => a.name.localeCompare(b.name)));
                    }
                    if (payload.eventType === 'UPDATE') {
                        setSuppliers(prev => prev.map(s => s.id === payload.new.id ? payload.new as Supplier : s));
                    }
                    if (payload.eventType === 'DELETE') {
                        setSuppliers(prev => prev.filter(s => s.id !== (payload.old as Supplier).id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { suppliers, loading };
};