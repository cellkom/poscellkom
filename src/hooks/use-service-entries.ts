import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

export interface ServiceEntry {
  id: string;
  created_at: string; // Added for Supabase
  date: string; // Stored as ISO string in DB
  customer_id: string; // Renamed to match DB convention
  kasir_id: string; // Added kasir_id
  category: string;
  device_type: string; // Renamed to match DB convention
  damage_type: string; // Renamed to match DB convention
  description: string;
  status: 'Pending' | 'Proses' | 'Selesai' | 'Gagal/Cancel' | 'Sudah Diambil';
  // customerName and customerPhone will be fetched via join or separately
}

// Extended interface for use in components, including customer details
export interface ServiceEntryWithCustomer extends ServiceEntry {
  customerName: string;
  customerPhone: string;
}

export const useServiceEntries = () => {
  const [serviceEntries, setServiceEntries] = useState<ServiceEntryWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceEntries = async () => {
      setLoading(true);
      // Fetch service entries and join with customer data
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
        const formattedData: ServiceEntryWithCustomer[] = data.map((entry: any) => ({
          ...entry,
          customerName: entry.customers?.name || 'N/A',
          customerPhone: entry.customers?.phone || 'N/A',
          date: entry.date, // Keep as string for consistency with DB
          deviceType: entry.device_type,
          damageType: entry.damage_type,
          customerId: entry.customer_id,
        }));
        setServiceEntries(formattedData);
      }
      setLoading(false);
    };

    fetchServiceEntries();

    const channel = supabase
      .channel('service_entries_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_entries' },
        (payload) => {
          // Re-fetch all data to ensure consistency and proper joins
          // For a large dataset, this might be optimized, but for now, it's simpler
          fetchServiceEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addServiceEntry = async (newEntryData: Omit<ServiceEntry, 'id' | 'created_at' | 'status'> & { kasir_id: string }) => {
    const { data, error } = await supabase
      .from('service_entries')
      .insert({
        date: newEntryData.date,
        customer_id: newEntryData.customer_id,
        kasir_id: newEntryData.kasir_id, // Include kasir_id here
        category: newEntryData.category,
        device_type: newEntryData.device_type,
        damage_type: newEntryData.damage_type,
        description: newEntryData.description,
        status: 'Pending', // Default status for new entries
      })
      .select()
      .single();

    if (error) {
      showError(`Gagal menambah service masuk: ${error.message}`);
      console.error(error);
      return null;
    }
    showSuccess("Data service masuk berhasil disimpan!");
    return data;
  };

  const updateServiceEntry = async (id: string, updatedFields: Partial<ServiceEntry>) => {
    const { data, error } = await supabase
      .from('service_entries')
      .update({
        date: updatedFields.date,
        customer_id: updatedFields.customer_id,
        kasir_id: updatedFields.kasir_id, // Include kasir_id here
        category: updatedFields.category,
        device_type: updatedFields.device_type,
        damage_type: updatedFields.damage_type,
        description: updatedFields.description,
        status: updatedFields.status,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      showError(`Gagal memperbarui service masuk: ${error.message}`);
      console.error(error);
      return null;
    }
    showSuccess("Data service masuk berhasil diperbarui!");
    return data;
  };

  return {
    serviceEntries,
    loading,
    addServiceEntry,
    updateServiceEntry,
  };
};