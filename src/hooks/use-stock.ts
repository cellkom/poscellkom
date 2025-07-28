import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

export interface Product {
  id: string;
  created_at: string;
  name: string;
  category: string;
  stock: number;
  buyPrice: number;
  retailPrice: number;
  resellerPrice: number;
  barcode: string;
  supplierId: string | null;
  entryDate: string; // ISO string for date
}

export const useStock = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        showError(`Gagal memuat data produk: ${error.message}`);
        console.error(error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();

    const channel = supabase
      .channel('products-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts(prev => [...prev, payload.new as Product].sort((a, b) => a.name.localeCompare(b.name)));
          }
          if (payload.eventType === 'UPDATE') {
            setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
          }
          if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== (payload.old as Product).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = async (newProductData: Omit<Product, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('products')
      .insert(newProductData)
      .select()
      .single();

    if (error) {
      showError(`Gagal menambah produk: ${error.message}`);
      console.error(error);
      return null;
    }
    showSuccess("Produk baru berhasil ditambahkan!");
    return data;
  };

  const updateProduct = async (id: string, updatedFields: Partial<Omit<Product, 'id' | 'created_at'>>) => {
    const { data, error } = await supabase
      .from('products')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      showError(`Gagal memperbarui produk: ${error.message}`);
      console.error(error);
      return null;
    }
    showSuccess("Data produk berhasil diperbarui!");
    return data;
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      showError(`Gagal menghapus produk: ${error.message}`);
      console.error(error);
      return false;
    }
    showSuccess("Produk berhasil dihapus!");
    return true;
  };

  const updateStockQuantity = async (productId: string, quantityChange: number) => {
    const productToUpdate = products.find(p => p.id === productId);
    if (!productToUpdate) {
      showError("Produk tidak ditemukan.");
      return null;
    }

    const newStock = productToUpdate.stock + quantityChange;
    if (newStock < 0) {
      showError("Stok tidak bisa kurang dari 0.");
      return null;
    }

    const { data, error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      showError(`Gagal memperbarui stok: ${error.message}`);
      console.error(error);
      return null;
    }
    showSuccess("Stok berhasil diperbarui!");
    return data;
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStockQuantity,
  };
};