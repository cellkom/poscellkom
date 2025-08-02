import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useStock, Product } from "@/hooks/use-stock";
import { Supplier } from "@/hooks/use-suppliers";

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  item: Product | null;
  suppliers: Supplier[];
}

export const EditItemDialog = ({ open, onOpenChange, onSuccess, item, suppliers }: EditItemDialogProps) => {
  const { updateProduct } = useStock();
  const [editingItemData, setEditingItemData] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setEditingItemData(item);
      setImagePreview(item.imageUrl);
    } else {
      setEditingItemData(null);
      setImagePreview(null);
    }
    setImageFile(null);
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingItemData) return;
    const { name, value } = e.target;
    const isNumeric = ['stock', 'buyPrice', 'retailPrice', 'resellerPrice'].includes(name);
    setEditingItemData({ ...editingItemData, [name]: isNumeric ? Number(value) : value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemData) return;
    
    const updated = await updateProduct(editingItemData.id, {
      ...editingItemData,
    }, imageFile);

    if (updated) {
      onSuccess();
    }
  };

  if (!editingItemData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Barang</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-image" className="text-right">Foto</Label>
              <div className="col-span-3">
                <Input id="edit-image" type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-md border" />}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-barcode" className="text-right">Barcode</Label><Input id="edit-barcode" name="barcode" value={editingItemData.barcode} onChange={handleChange} className="col-span-3 font-mono" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-name" className="text-right">Nama</Label><Input id="edit-name" name="name" value={editingItemData.name} onChange={handleChange} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-category" className="text-right">Kategori</Label><Select name="category" onValueChange={(value) => setEditingItemData({ ...editingItemData, category: value })} value={editingItemData.category}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Sparepart HP">Sparepart HP</SelectItem><SelectItem value="Sparepart Komputer">Sparepart Komputer</SelectItem><SelectItem value="Aksesoris">Aksesoris</SelectItem></SelectContent></Select></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-stock" className="text-right">Stok</Label><Input id="edit-stock" name="stock" type="number" value={editingItemData.stock} onChange={handleChange} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-buyPrice" className="text-right">Harga Beli</Label><Input id="edit-buyPrice" name="buyPrice" type="number" value={editingItemData.buyPrice} onChange={handleChange} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-retailPrice" className="text-right">Harga Ecer</Label><Input id="edit-retailPrice" name="retailPrice" type="number" value={editingItemData.retailPrice} onChange={handleChange} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-resellerPrice" className="text-right">Harga Reseller</Label><Input id="edit-resellerPrice" name="resellerPrice" type="number" value={editingItemData.resellerPrice} onChange={handleChange} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-entryDate" className="text-right">Tgl. Masuk</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !editingItemData.entryDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editingItemData.entryDate ? format(new Date(editingItemData.entryDate), "PPP") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={new Date(editingItemData.entryDate)} onSelect={(date) => setEditingItemData(prev => ({ ...prev!, entryDate: (date || new Date()).toISOString() }))} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-supplier" className="text-right">Supplier</Label>
              <Select value={editingItemData.supplierId || ''} onValueChange={(value) => setEditingItemData(prev => ({ ...prev!, supplierId: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Supplier (Opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (<SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit">Simpan Perubahan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};