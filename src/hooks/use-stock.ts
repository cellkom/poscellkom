import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

// Interface ini digunakan di seluruh aplikasi (camelCase)
export interface Product {
  id: string;
  createdAt: string;
  name: string;
  category: string;
  stock: number;
  buyPrice: number;
  retailPrice: number;
  resellerPrice: number;
  barcode: string;
  supplierId: string | null;
  entryDate: string;
}

// Interface ini merepresentasikan skema di database (snake_case)
interface DbProduct {
  id: string;
  created_at: string;
  name: string;
  category: string;
  stock: number;
  buy_price: number;
  retail_price: number;
  reseller_price: number;
  barcode: string;
  supplier_id: string | null;
  entry_date: string;
}

// Fungsi untuk mengubah format dari database ke format aplikasi
const fromDbProduct = (dbProduct: DbProduct): Product => ({
  id: dbProduct.id,
  createdAt: dbProduct.created_at,
  name: dbProduct.name,
  category: dbProduct.category,
  stock: dbProduct.stock,
  buyPrice: dbProduct.buy_price,
  retailPrice: dbProduct.retail_price,
  resellerPrice: dbProduct.reseller_price,
  barcode: dbProduct.barcode,
  supplierId: dbProduct.supplier_id,
  entryDate: dbProduct.entry_date,
});

// Fungsi untuk mengubah format dari aplikasi ke format database
const toDbProduct = (product: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
  const dbProduct: Partial<Omit<DbProduct, 'id' | 'created_at'>> = {};
  if (product.name !== undefined) dbProduct.name = product.name;
  if (product.category !== undefined) dbProduct.category = product.category;
  if (product.stock !== undefined) dbProduct.stock = product.stock;
  if (product.buyPrice !== undefined) dbProduct.buy_price = product.buyPrice;
  if (product.retailPrice !== undefined) dbProduct.retail_price = product.retailPrice;
  if (product.resellerPrice !== undefined) dbProduct.reseller_price = product.resellerPrice;
  if (product.barcode !== undefined) dbProduct.barcode = product.barcode;
  if (product.supplierId !== undefined) dbProduct.supplier_id = product.supplierId;
  if (product.entryDate !== undefined) dbProduct.entry_date = product.entryDate;
  return dbProduct;
};


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
        setProducts((data || []).map(fromDbProduct));
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
            setProducts(prev => [...prev, fromDbProduct(payload.new as DbProduct)].sort((a, b) => a.name.localeCompare(b.name)));
          }
          if (payload.eventType === 'UPDATE') {
            setProducts(prev => prev.map(p => p.id === payload.new.id ? fromDbProduct(payload.new as DbProduct) : p));
          }
          if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== (payload.old as DbProduct).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = async (newProductData: Omit<Product, 'id' | 'createdAt'>) => {
    const dbData = toDbProduct(newProductData);
    const { data, error } = await supabase
      .from('products')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      showError(`Gagal menambah produk: ${error.message}`);
      console.error(error);
      return null;
    }
    showSuccess("Produk baru berhasil ditambahkan!");
    return data ? fromDbProduct(data) : null;
  };

  const updateProduct = async (id: string, updatedFields: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    const dbData = toDbProduct(updatedFields);
    const { data, error } = await supabase
      .from('products')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      showError(`Gagal memperbarui produk: ${error.message}`);
      console.error(error);
      return null;
    }
    showSuccess("Data produk berhasil diperbarui!");
    return data ? fromDbProduct(data) : null;
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

  const updateStockQuantity = async (productId: string, quantityChange: number, entryDate?: string, supplierId?: string | null) => {
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

    const updateData: {
        stock: number;
        entry_date?: string;
        supplier_id?: string | null;
    } = {
        stock: newStock,
    };

    if (entryDate) {
        updateData.entry_date = entryDate;
    }
    // Check for undefined to allow setting supplier to null
    if (supplierId !== undefined) {
        updateData.supplier_id = supplierId;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      showError(`Gagal memperbarui stok: ${error.message}`);
      console.error(error);
      return null;
    }
    showSuccess("Stok berhasil diperbarui!");
    return data ? fromDbProduct(data) : null;
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