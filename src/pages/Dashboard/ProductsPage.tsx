import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { DataTable } from "@/components/DataTable";
import { columns } from "./ProductColumns";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductForm } from "@/components/ProductForm";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        suppliers (name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat data produk.");
      console.error(error);
    } else {
      const productsWithSupplierName = data.map(p => ({
        ...p,
        supplier_name: p.suppliers?.name || '-',
      }));
      setProducts(productsWithSupplierName as unknown as Product[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsSheetOpen(true);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    fetchProducts();
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsSheetOpen(true);
  };

  const dynamicColumns = columns({ onEdit: handleEdit, refreshData: fetchProducts });

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manajemen Produk</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>
      <DataTable
        columns={dynamicColumns}
        data={products}
        loading={loading}
        filterColumn="name"
        filterPlaceholder="Cari nama produk..."
      />
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedProduct ? "Edit Produk" : "Tambah Produk Baru"}</SheetTitle>
            <SheetDescription>
              {selectedProduct ? "Perbarui detail produk di bawah ini." : "Isi semua detail untuk menambahkan produk baru."}
            </SheetDescription>
          </SheetHeader>
          <ProductForm product={selectedProduct} onSuccess={handleSuccess} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ProductsPage;