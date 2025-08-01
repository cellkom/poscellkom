import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MemberLayout from '@/components/Layout/MemberLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStock, Product } from '@/hooks/use-stock';
import { useCart } from '@/contexts/CartContext';
import { Loader2, ShoppingCart, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const { products, loading: productsLoading } = useStock();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!productsLoading && productId) {
      const foundProduct = products.find(p => p.id === productId);
      setProduct(foundProduct || null);
    }
  }, [productId, products, productsLoading]);

  if (productsLoading) {
    return (
      <MemberLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MemberLayout>
    );
  }

  if (!product) {
    return (
      <MemberLayout>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Produk tidak ditemukan</h2>
          <p className="text-muted-foreground">Produk yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
          <Button asChild className="mt-4">
            <Link to="/member/home"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Home</Link>
          </Button>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Button asChild variant="outline">
            <Link to="/member/home"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali</Link>
          </Button>
        </div>
        <Card>
          <div className="grid md:grid-cols-2 gap-8">
            <CardHeader className="p-0">
              <div className="bg-muted aspect-square flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                <ShoppingCart className="h-32 w-32 text-muted-foreground/20" />
              </div>
            </CardHeader>
            <div className="p-6">
              <CardTitle className="text-3xl font-bold">{product.name}</CardTitle>
              <Badge variant="outline" className="my-2">{product.category}</Badge>
              <p className="text-3xl font-bold text-primary my-4">{formatCurrency(product.retailPrice)}</p>
              
              <div className="flex items-center gap-2 my-4">
                {product.stock > 0 ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 font-semibold">Stok Tersedia ({product.stock})</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="text-destructive font-semibold">Stok Habis</span>
                  </>
                )}
              </div>

              <p className="text-muted-foreground">
                Deskripsi produk akan ditampilkan di sini. Saat ini, kami menyediakan informasi dasar. Hubungi kami untuk detail lebih lanjut.
              </p>

              <Button 
                size="lg" 
                className="w-full mt-6" 
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
};

export default ProductDetailPage;