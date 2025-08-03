import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export interface ServiceEntry {
  id: string; // Changed from bigint to string for UUID consistency
  created_at: string;
  customer_id: string;
  kasir_id: string;
  category: string | null;
  device_type: string | null;
  damage_type: string | null;
  description: string | null;
  status: 'Pending' | 'Proses' | 'Selesai' | 'Gagal/Cancel' | 'Sudah Diambil';
  date: string;
  service_info: string | null;
  info_date: string | null; // New column for manual info date
}

export interface ServiceEntryWithCustomer extends ServiceEntry {
  customerName: string | null;
  customerPhone: string | null;
}

export const useServiceEntries = () => {
  const [serviceEntries, setServiceEntries] = useState<ServiceEntryWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServiceEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_entries')
      .select(`
        *,
        customers (name, phone)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      showError("Gagal memuat entri servis: " + error.message);
      console.error("Error fetching service entries:", error);
      setServiceEntries([]);
    } else {
      const entriesWithCustomer: ServiceEntryWithCustomer[] = data.map(entry => ({
        ...entry,
        customerName: entry.customers?.name || null,
        customerPhone: entry.customers?.phone || null,
      }));
      setServiceEntries(entriesWithCustomer);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServiceEntries();
    const channel = supabase
      .channel('service-entries-channel')
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

  const addServiceEntry = async (newEntry: Omit<ServiceEntry, 'id' | 'created_at' | 'info_date'>) => {
    const { data, error } = await supabase
      .from('service_entries')
      .insert([newEntry])
      .select(`
        *,
        customers (name, phone)
      `);

    if (error) {
      showError("Gagal menambahkan entri servis: " + error.message);
      console.error("Error adding service entry:", error);
      return null;
    } else {
      showSuccess("Entri servis berhasil ditambahkan!");
      const addedEntry: ServiceEntryWithCustomer = {
        ...data[0],
        customerName: data[0].customers?.name || null,
        customerPhone: data[0].customers?.phone || null,
      };
      setServiceEntries(prev => [addedEntry, ...prev]);
      return addedEntry;
    }
  };

  const updateServiceEntry = async (id: string, updates: Partial<Omit<ServiceEntry, 'id' | 'created_at'>>) => {
    const { data, error } = await supabase
      .from('service_entries')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        customers (name, phone)
      `);

    if (error) {
      showError("Gagal memperbarui entri servis: " + error.message);
      console.error("Error updating service entry:", error);
      return false;
    } else {
      showSuccess("Entri servis berhasil diperbarui!");
      const updatedEntry: ServiceEntryWithCustomer = {
        ...data[0],
        customerName: data[0].customers?.name || null,
        customerPhone: data[0].customers?.phone || null,
      };
      setServiceEntries(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
      return true;
    }
  };

  const deleteServiceEntry = async (id: string) => {
    const { error } = await supabase
      .from('service_entries')
      .delete()
      .eq('id', id);

    if (error) {
      showError("Gagal menghapus entri servis: " + error.message);
      console.error("Error deleting service entry:", error);
      return false;
    } else {
      showSuccess("Entri servis berhasil dihapus!");
      setServiceEntries(prev => prev.filter(entry => entry.id !== id));
      return true;
    }
  };

  return { serviceEntries, loading, addServiceEntry, updateServiceEntry, deleteServiceEntry, fetchServiceEntries };
};