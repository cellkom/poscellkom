import { useState, useMemo } from "react";
import { useStock } from "@/hooks/use-stock";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, ShoppingCart } from "lucide-react";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const MemberHomePage = () => {
  const { products, loading } = useStock();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Selamat Datang di Toko Kami</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Temukan semua produk dan sparepart yang Anda butuhkan.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="relative w-full md:w-1/2 mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cari produk (nama, kategori, barcode)..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer">
                <CardHeader className="p-0">
                  <div className="bg-muted aspect-square flex items-center justify-center">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold truncate text-base" title={product.name}>{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{product.category}</Badge>
                    {product.stock > 0 ? (
                      <Badge variant="secondary">Stok: {product.stock}</Badge>
                    ) : (
                      <Badge variant="destructive">Stok Habis</Badge>
                    )}
                  </div>
                  <p className="text-lg font-bold text-primary pt-2">{formatCurrency(product.retailPrice)}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground">Tidak ada produk yang cocok dengan pencarian Anda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberHomePage;