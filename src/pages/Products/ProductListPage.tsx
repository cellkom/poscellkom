import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Package, PackageX, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

type Product = {
  id: string;
  name: string;
  retail_price: number;
  reseller_price: number;
  image_url: string | null;
  stock: number;
  category: string | null;
};

const ProductListPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { profile } = useAuth();

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      setLoading(true);
      let query = supabase.from('products').select('*');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        showError('Gagal memuat produk.');
      } else {
        setProducts(data);
        if (categories.length === 0) {
          const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean) as string[])];
          setCategories(uniqueCategories);
        }
      }
      setLoading(false);
    };

    fetchProductsAndCategories();
  }, [searchTerm, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    const price = profile?.role === 'Member' ? product.reseller_price : product.retail_price;
    addToCart({
      id: product.id,
      name: product.name,
      price: price,
      quantity: 1,
      image_url: product.image_url,
    });
    showSuccess(`${product.name} ditambahkan ke keranjang.`);
  };

  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Produk Kami</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Jelajahi koleksi suku cadang dan aksesori berkualitas kami.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari produk..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            className="shrink-0"
          >
            Semua
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="shrink-0"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-32 sm:h-40 w-full" />
              <CardContent className="p-2 sm:p-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
          {filteredProducts.map(product => (
            <Card key={product.id} className="overflow-hidden flex flex-col group">
              <div className="relative">
                <div className="aspect-square bg-muted overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
                {product.stock > 0 ? (
                  <Badge variant="secondary" className="absolute top-2 left-2 text-xs">{product.stock} Tersedia</Badge>
                ) : (
                  <Badge variant="destructive" className="absolute top-2 left-2 text-xs">Habis</Badge>
                )}
              </div>
              <CardContent className="p-2 sm:p-3 flex flex-col flex-grow">
                <h3 className="font-semibold text-sm sm:text-base leading-tight sm:leading-normal line-clamp-2 flex-grow">{product.name}</h3>
                <div className="mt-2">
                  {profile?.role === 'Member' && (
                    <div className="flex items-baseline gap-1">
                      <p className="text-sm text-primary font-bold">Rp{product.reseller_price.toLocaleString('id-ID')}</p>
                      <p className="text-xs text-muted-foreground line-through">Rp{product.retail_price.toLocaleString('id-ID')}</p>
                    </div>
                  )}
                  {(profile?.role !== 'Member') && (
                    <p className="text-sm sm:text-base font-bold text-primary">Rp{product.retail_price.toLocaleString('id-ID')}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  className="w-full mt-2 text-xs sm:text-sm"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Tambah
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <PackageX className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Produk Tidak Ditemukan</h3>
          <p className="mt-2 text-muted-foreground">Coba kata kunci atau kategori yang berbeda.</p>
        </div>
      )}
    </div>
  );
};

export default ProductListPage;