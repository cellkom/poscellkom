import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export interface Order {
  id: string;
  created_at: string;
  member_id: string;
  total_amount: number;
  status: 'Pending' | 'Processed' | 'Cancelled';
  order_number: string;
  members: {
    full_name: string;
  };
}

export interface OrderItem {
  id: string;
  quantity: number;
  price_at_order: number;
  products: {
    name: string;
    image_url: string | null;
  };
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        members ( full_name )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      showError(`Gagal memuat pesanan: ${error.message}`);
    } else {
      setOrders(data as any);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      showError(`Gagal memperbarui status: ${error.message}`);
      return false;
    }
    showSuccess("Status pesanan berhasil diperbarui.");
    fetchOrders();
    return true;
  };

  const fetchOrderDetails = async (orderId: string): Promise<OrderItem[]> => {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        price_at_order,
        products ( name, image_url )
      `)
      .eq('order_id', orderId);

    if (error) {
      showError(`Gagal memuat detail pesanan: ${error.message}`);
      return [];
    }
    return data as any;
  };

  return { orders, loading, fetchOrders, updateOrderStatus, fetchOrderDetails };
};