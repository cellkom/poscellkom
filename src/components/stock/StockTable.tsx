import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { Product } from "@/hooks/use-stock";
import { Supplier } from "@/hooks/use-suppliers";
import { format } from "date-fns";

interface StockTableProps {
  products: Product[];
  suppliers: Supplier[];
  loading: boolean;
  onEdit: (item: Product) => void;
  onDelete: (itemId: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export const StockTable = ({ products, suppliers, loading, onEdit, onDelete }: StockTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Barang</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Tgl. Masuk</TableHead>
            <TableHead className="text-center">Stok</TableHead>
            <TableHead className="text-right">Harga Ecer</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={7} className="text-center h-24">Memuat data stok...</TableCell></TableRow>
          ) : products.length > 0 ? (
            products.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{item.barcode}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{suppliers.find(s => s.id === item.supplierId)?.name || '-'}</TableCell>
                <TableCell>{format(new Date(item.entryDate), "dd/MM/yyyy")}</TableCell>
                <TableCell className="text-center">{item.stock}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.retailPrice)}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow><TableCell colSpan={7} className="text-center h-24">Tidak ada data stok.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};