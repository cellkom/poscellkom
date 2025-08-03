import { useState, useEffect, useCallback } from 'react';
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

    const fetchSuppliers = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchSuppliers();

        const channel = supabase
            .channel('suppliers-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'suppliers' },
                () => {
                    fetchSuppliers();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchSuppliers]);

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
        return true;
    };

    return { suppliers, loading, addSupplier, updateSupplier, deleteSupplier };
};