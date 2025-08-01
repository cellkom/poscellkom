import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "@/components/Layout/PublicLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStock, Product } from "@/hooks/use-stock";
import { Loader2, Search, ShoppingCart, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const ProductsPage = () => {
  const { products, loading } = useStock();
  const [searchTerm, setSearchTerm] = useState("");
  const { session } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleAddToCart = (product: Product) => {
    if (!session) {
      toast.error("Silakan login untuk menambahkan ke keranjang.", {
        action: {
          label: "Login",
          onClick: () => navigate('/member-login'),
        },
      });
      return;
    }
    if (product.stock > 0) {
      addToCart(product);
    } else {
      toast.error("Stok produk ini habis.");
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Toko Produk Kami</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Temukan semua sparepart dan aksesoris yang Anda butuhkan. Kualitas terjamin, harga bersahabat.
          </p>
          <div className="relative w-full max-w-xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              placeholder="Cari produk berdasarkan nama atau kategori..."
              className="pl-12 h-12 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <Card key={product.id} className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col">
                  <CardHeader className="p-0">
                    <div className="bg-muted aspect-square flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      ) : (
                        <ImageIcon className="h-20 w-20 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-sm md:text-base line-clamp-2" title={product.name}>{product.name}</h3>
                        <Badge variant="outline" className="text-xs shrink-0">{product.category}</Badge>
                      </div>
                      {product.stock > 0 ? (
                        <Badge variant="secondary" className="mt-2 text-xs">Stok: {product.stock}</Badge>
                      ) : (
                        <Badge variant="destructive" className="mt-2 text-xs">Stok Habis</Badge>
                      )}
                    </div>
                    <div className="pt-2 md:pt-3">
                      <p className="text-lg md:text-xl font-bold text-primary">{formatCurrency(product.retailPrice)}</p>
                      <Button size="sm" className="w-full mt-2 md:mt-3" disabled={product.stock <= 0} onClick={() => handleAddToCart(product)}>
                        <span className="hidden sm:inline">Tambah</span>
                        <ShoppingCart className="sm:ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-muted-foreground text-lg">Tidak ada produk yang cocok dengan pencarian Anda.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default ProductsPage;