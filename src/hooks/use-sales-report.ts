import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

export interface SalesItem {
  product_name: string;
  quantity: number;
  sale_price_at_sale: number;
  buy_price_at_sale: number;
  profit: number;
}

export interface SalesTransactionReport {
  id: string;
  created_at: string;
  transaction_id_display: string;
  customer_name_cache: string | null;
  total: number;
  items: SalesItem[];
  total_profit: number;
}

export const useSalesReport = () => {
  const [reportData, setReportData] = useState<SalesTransactionReport[]>([]);
  const [loading, setLoading] = useState(false);

  const generateReport = useCallback(async (startDate: Date, endDate: Date) => {
    setLoading(true);
    
    endDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('sales_transactions')
      .select(`
        id,
        created_at,
        transaction_id_display,
        customer_name_cache,
        total,
        sales_transaction_items (
          quantity,
          buy_price_at_sale,
          sale_price_at_sale,
          products ( name )
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      showError(`Gagal mengambil data laporan: ${error.message}`);
      console.error(error);
      setLoading(false);
      return;
    }

    const processedData = data.map(tx => {
      let total_profit = 0;
      const items = tx.sales_transaction_items.map((item: any) => {
        const profit = (item.sale_price_at_sale - item.buy_price_at_sale) * item.quantity;
        total_profit += profit;
        return {
          product_name: item.products?.name || 'Produk Dihapus',
          quantity: item.quantity,
          sale_price_at_sale: item.sale_price_at_sale,
          buy_price_at_sale: item.buy_price_at_sale,
          profit: profit,
        };
      });

      return {
        id: tx.id,
        created_at: tx.created_at,
        transaction_id_display: tx.transaction_id_display,
        customer_name_cache: tx.customer_name_cache,
        total: tx.total,
        items: items,
        total_profit: total_profit,
      };
    });

    setReportData(processedData);
    setLoading(false);
  }, []);

  return { reportData, loading, generateReport };
};