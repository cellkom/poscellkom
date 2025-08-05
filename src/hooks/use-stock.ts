import { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  updated_at: string;
}

interface StockContextType {
  stockItems: StockItem[];
  loading: boolean;
  fetchStock: () => Promise<void>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider = ({ children }: { children: ReactNode }) => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stock')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      showError(`Gagal memuat data stok: ${error.message}`);
      setStockItems([]);
    } else {
      setStockItems(data as StockItem[]);
    }
    setLoading(false);
  }, []);

  const value = { stockItems, loading, fetchStock };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};