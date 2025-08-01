import { useState, useMemo } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStock } from "@/hooks/use-stock";
import { Loader2, Search, ShoppingCart } from "lucide-react";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const StorePage = () => {
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
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-2xl font-bold">Toko Produk</CardTitle>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Cari produk (nama, kategori, barcode)..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <p className="text-muted-foreground pt-2">
              Lihat semua produk yang tersedia di toko Anda.
            </p>
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
                <Card key={product.id} className="overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
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
    </DashboardLayout>
  );
};

export default StorePage;