import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useStock, Product } from "@/hooks/use-stock";
import { useSuppliers } from "@/hooks/use-suppliers";
import { StockActions } from "@/components/stock/StockActions";
import { StockTable } from "@/components/stock/StockTable";
import { AddItemDialog } from "@/components/stock/AddItemDialog";
import { EditItemDialog } from "@/components/stock/EditItemDialog";
import { AddStockDialog } from "@/components/stock/AddStockDialog";

const StockPage = () => {
  const { products, loading: productsLoading, deleteProduct } = useStock();
  const { suppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        uniqueCategories.add(product.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [products]);

  const filteredStock = products.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.id.toLowerCase().includes(term) ||
      (item.barcode && item.barcode.toLowerCase().includes(term))
    );
  });

  const handleEdit = (item: Product) => {
    setEditingItem(item);
    setIsEditItemDialogOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
      await deleteProduct(itemId);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <StockActions
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddItem={() => setIsAddItemDialogOpen(true)}
            onAddStock={() => setIsAddStockDialogOpen(true)}
          />
        </CardHeader>
        <CardContent>
          <StockTable
            products={filteredStock}
            suppliers={suppliers}
            loading={productsLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <AddItemDialog
        open={isAddItemDialogOpen}
        onOpenChange={setIsAddItemDialogOpen}
        onSuccess={() => setIsAddItemDialogOpen(false)}
        suppliers={suppliers}
        categories={categories}
      />

      <EditItemDialog
        open={isEditItemDialogOpen}
        onOpenChange={setIsEditItemDialogOpen}
        onSuccess={() => setIsEditItemDialogOpen(false)}
        item={editingItem}
        suppliers={suppliers}
        categories={categories}
      />

      <AddStockDialog
        open={isAddStockDialogOpen}
        onOpenChange={setIsAddStockDialogOpen}
        onSuccess={() => setIsAddStockDialogOpen(false)}
        products={products}
        suppliers={suppliers}
      />
    </>
  );
};

export default StockPage;