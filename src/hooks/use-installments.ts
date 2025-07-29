import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

// Represents an installment record from the DB, joined with customer name
export interface Installment {
  id: string; // This is the installment's UUID from the DB
  created_at: string;
  transaction_id_display: string;
  transaction_type: 'Penjualan' | 'Servis';
  customer_id: string;
  customer_name_cache: string; // Fetched via join or stored on creation
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'Belum Lunas' | 'Lunas';
  details: string;
  kasir_id: string;
}

// Represents a single payment record for an installment
export interface InstallmentPayment {
  id: string;
  created_at: string;
  amount: number;
}

export const useInstallments = () => {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInstallments = useCallback(async () => {
    setLoading(true);
    // Fetch installments and join with customers table to get the name
    const { data, error } = await supabase
      .from('installments')
      .select(`
        *,
        customers ( name )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      showError(`Gagal memuat data cicilan: ${error.message}`);
      console.error(error);
    } else {
      // Map the data to match the Installment interface, handling the joined customer name
      const formattedData = data.map((item: any) => ({
        ...item,
        customer_name_cache: item.customers?.name || item.customer_name_cache || 'N/A',
      }));
      setInstallments(formattedData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInstallments();

    const channel = supabase
      .channel('installments-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'installments' },
        () => {
          fetchInstallments(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInstallments]);

  const addPayment = async (installmentId: string, amount: number, kasirId: string) => {
    const installment = installments.find(i => i.id === installmentId);
    if (!installment) {
      showError("Data cicilan tidak ditemukan.");
      return false;
    }

    const newPaidAmount = installment.paid_amount + amount;
    const newRemainingAmount = installment.remaining_amount - amount;
    const newStatus = newRemainingAmount <= 0 ? 'Lunas' : 'Belum Lunas';

    // 1. Update the installment record
    const { error: updateError } = await supabase
      .from('installments')
      .update({
        paid_amount: newPaidAmount,
        remaining_amount: newRemainingAmount,
        status: newStatus,
      })
      .eq('id', installmentId);

    if (updateError) {
      showError(`Gagal memperbarui cicilan: ${updateError.message}`);
      return false;
    }

    // 2. Insert a new payment history record
    const { error: paymentError } = await supabase
      .from('installment_payments')
      .insert({
        installment_id: installmentId,
        amount: amount,
        kasir_id: kasirId,
      });

    if (paymentError) {
      // This is not ideal as the installment is already updated.
      // A database transaction (RPC) would be better.
      showError(`Gagal mencatat riwayat pembayaran: ${paymentError.message}`);
      // Attempt to revert? For now, we'll just show the error.
      return false;
    }

    showSuccess("Pembayaran berhasil dicatat.");
    fetchInstallments(); // Refresh data
    return true;
  };

  const getPaymentHistory = async (installmentId: string): Promise<InstallmentPayment[]> => {
    const { data, error } = await supabase
      .from('installment_payments')
      .select('id, created_at, amount')
      .eq('installment_id', installmentId)
      .order('created_at', { ascending: false });

    if (error) {
      showError(`Gagal memuat riwayat pembayaran: ${error.message}`);
      return [];
    }
    return data || [];
  };

  return { installments, loading, addPayment, getPaymentHistory };
};