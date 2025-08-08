import { useState, useMemo, useEffect } from "react";
import PublicLayout from "@/components/Layout/PublicLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Search, Image as ImageIcon } from "lucide-react";
import { useStock } from "@/hooks/use-stock";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useDebounce } from "@/hooks/use-debounce";
import { useAdvertisements } from "@/hooks/use-advertisements";

const ProductsPage = () => {
  const { products, loading } = useStock();
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { advertisements, loading: adsLoading } = useAdvertisements('products_page_banner');
  const bannerAd = advertisements[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        uniqueCategories.add(product.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [products]);

  const filteredAndSortedProducts = products
    .filter(product =>
      (product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
       product.barcode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) &&
      (selectedCategory === "all" || product.category === selectedCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.retailPrice - b.retailPrice;
        case "price-desc":
          return b.retailPrice - a.retailPrice;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          {adsLoading ? (
            <Skeleton className="w-full aspect-[16/4] rounded-lg" />
          ) : bannerAd ? (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <a href={bannerAd.link_url || '#'} target={bannerAd.link_url ? "_blank" : "_self"} rel="noopener noreferrer">
                  <img src={bannerAd.image_url} alt={bannerAd.alt_text || 'Iklan'} className="w-full h-auto object-cover aspect-[16/4]" />
                </a>
              </CardContent>
            </Card>
          ) : (
            <h1 className="text-3xl md:text-4xl font-bold text-center">Produk Kami</h1>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari produk berdasarkan nama atau barcode..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Nama (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nama (Z-A)</SelectItem>
              <SelectItem value="price-asc">Harga (Rendah ke Tinggi)</SelectItem>
              <SelectItem value="price-desc">Harga (Tinggi ke Rendah)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="p-0">
                  <Skeleton className="h-48 w-full" />
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredAndSortedProducts.map((product) => (
              <Link to={`/products/${product.id}`} key={product.id} className="group">
                <Card className="overflow-hidden transition-shadow hover:shadow-lg flex flex-col h-full">
                  <CardHeader className="p-0">
                    <div className="bg-muted aspect-square flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      ) : (
                        <ImageIcon className="h-20 w-20 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow flex flex-col">
                    <h3 className="font-semibold text-lg truncate" title={product.name}>{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                    <p className="font-bold text-primary text-xl mt-auto">{formatCurrency(product.retailPrice)}</p>
                    <Button
                      className="mt-4 w-full"
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock <= 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {product.stock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default ProductsPage;