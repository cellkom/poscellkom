import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

export interface ServiceEntry {
  id: string;
  created_at: string;
  date: string;
  customer_id: string;
  kasir_id: string;
  category: string;
  device_type: string;
  damage_type: string;
  description: string;
  status: 'Pending' | 'Proses' | 'Selesai' | 'Gagal/Cancel' | 'Sudah Diambil';
}

export interface ServiceEntryWithCustomer extends ServiceEntry {
  customerName: string;
  customerPhone: string;
}

// Helper to format a raw DB entry to the application's interface
const formatDbEntry = (entry: any): ServiceEntryWithCustomer => ({
  ...entry,
  id: String(entry.id), // Ensure ID is a string
  customerName: entry.customers?.name || 'N/A',
  customerPhone: entry.customers?.phone || 'N/A',
});

export const useServiceEntries = () => {
  const [serviceEntries, setServiceEntries] = useState<ServiceEntryWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServiceEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_entries')
      .select(`
        *,
        customers (
          name,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      showError(`Gagal memuat data service masuk: ${error.message}`);
      console.error(error);
    } else {
      setServiceEntries(data.map(formatDbEntry));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServiceEntries();

    const channel = supabase
      .channel('service_entries_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_entries' },
        () => {
          fetchServiceEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchServiceEntries]);

  const addServiceEntry = async (newEntryData: Omit<ServiceEntry, 'id' | 'created_at' | 'status'>) => {
    const { data, error } = await supabase
      .from('service_entries')
      .insert({ ...newEntryData, status: 'Pending' })
      .select()
      .single();

    if (error) {
      showError(`Gagal menambah service masuk: ${error.message}`);
      console.error(error);
      return null;
    }
    showSuccess("Data service masuk berhasil disimpan!");
    return data ? { ...data, id: String(data.id) } : null;
  };

  const updateServiceEntry = async (id: string, updatedFields: Partial<Pick<ServiceEntry, 'status'>>) => {
    const { data, error } = await supabase
      .from('service_entries')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      showError(`Gagal memperbarui status service: ${error.message}`);
      console.error(error);
      return null;
    }
    showSuccess("Status service berhasil diperbarui!");
    return data ? { ...data, id: String(data.id) } : null;
  };

  return {
    serviceEntries,
    loading,
    addServiceEntry,
    updateServiceEntry,
  };
};