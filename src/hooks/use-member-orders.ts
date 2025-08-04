import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

export interface MemberOrder {
  id: string;
  created_at: string;
  total_amount: number;
  status: 'Pending' | 'Processed' | 'Cancelled';
  order_number: string;
}

export interface MemberOrderItem {
  id: string;
  quantity: number;
  price_at_order: number;
  products: {
    name: string;
    image_url: string | null;
  };
}

export const useMemberOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<MemberOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, total_amount, status, order_number')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      showError(`Gagal memuat riwayat pesanan: ${error.message}`);
    } else {
      setOrders(data as MemberOrder[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('member-orders-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `member_id=eq.${user?.id}` },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, user]);

  const fetchOrderDetails = async (orderId: string): Promise<MemberOrderItem[]> => {
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

  return { orders, loading, fetchOrders, fetchOrderDetails };
};