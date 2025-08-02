import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, PlusSquare, Search } from "lucide-react";

interface StockActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddItem: () => void;
  onAddStock: () => void;
}

export const StockActions = ({ searchTerm, onSearchChange, onAddItem, onAddStock }: StockActionsProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 className="text-2xl font-bold">Manajemen Stok Barang</h1>
      <div className="flex gap-2 w-full md:w-auto">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari (nama, kode, barcode)..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2" onClick={onAddStock}>
          <PlusSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Tambah Stok</span>
        </Button>
        <Button className="flex items-center gap-2" onClick={onAddItem}>
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Tambah Barang</span>
        </Button>
      </div>
    </div>
  );
};