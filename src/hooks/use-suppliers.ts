import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Supplier {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  address: string | null;
}

export const useSuppliers = () => {
    const { user } = useAuth();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSuppliers = useCallback(async () => {
        if (!user) {
            setSuppliers([]);
            setLoading(false);
            return;
        }
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
    }, [user]);

    useEffect(() => {
        fetchSuppliers();

        if (user) {
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
        }
    }, [fetchSuppliers, user]);

    const addSupplier = async (newSupplierData: Omit<Supplier, 'id' | 'created_at'>) => {
        const { data, error } = await supabase
            .from('suppliers')
            .insert(newSupplierData)
            .select()
            .single();

        if (error) {
            showError(`Gagal menambah supplier: ${error.message}`);
            return null;
        }
        showSuccess("Supplier baru berhasil ditambahkan!");
        setSuppliers(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        return data;
    };

    const updateSupplier = async (id: string, updatedData: Partial<Omit<Supplier, 'id' | 'created_at'>>) => {
        const { data, error } = await supabase
            .from('suppliers')
            .update(updatedData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            showError(`Gagal memperbarui supplier: ${error.message}`);
            return null;
        }
        showSuccess("Data supplier berhasil diperbarui!");
        setSuppliers(prev => prev.map(s => s.id === id ? data : s));
        return data;
    };

    const deleteSupplier = async (id: string) => {
        const { error } = await supabase
            .from('suppliers')
            .delete()
            .eq('id', id);

        if (error) {
            showError(`Gagal menghapus supplier: ${error.message}`);
            return false;
        }
        showSuccess("Supplier berhasil dihapus!");
        setSuppliers(prev => prev.filter(s => s.id !== id));
        return true;
    };

    return { suppliers, loading, addSupplier, updateSupplier, deleteSupplier };
};