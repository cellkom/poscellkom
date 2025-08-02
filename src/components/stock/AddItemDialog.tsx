import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import Barcode from "@/components/Barcode";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useStock } from "@/hooks/use-stock";
import { Supplier } from "@/hooks/use-suppliers";
import { showError } from "@/utils/toast";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  suppliers: Supplier[];
}

const initialState = { name: '', category: '', stock: 0, buyPrice: 0, retailPrice: 0, resellerPrice: 0, barcode: '', entryDate: new Date(), supplierId: '' };

export const AddItemDialog = ({ open, onOpenChange, onSuccess, suppliers }: AddItemDialogProps) => {
  const { addProduct } = useStock();
  const [newItem, setNewItem] = useState(initialState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleGenerateBarcode = () => {
    const generated = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
    setNewItem(prev => ({ ...prev, barcode: generated }));
  };

  useEffect(() => {
    if (open) {
      handleGenerateBarcode();
    } else {
      setNewItem(initialState);
      setImageFile(null);
      setImagePreview(null);
    }
  }, [open]);

  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['stock', 'buyPrice', 'retailPrice', 'resellerPrice'].includes(name);
    setNewItem(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
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
    if (!newItem.name || !newItem.category || !newItem.barcode) {
      showError("Harap isi semua field yang wajib diisi.");
      return;
    }
    
    const added = await addProduct({
      ...newItem,
      entryDate: newItem.entryDate.toISOString(),
    }, imageFile);

    if (added) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Barang Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">Foto</Label>
              <div className="col-span-3">
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-md border" />}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barcode" className="text-right">Barcode</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input id="barcode" name="barcode" value={newItem.barcode} onChange={(e) => setNewItem(prev => ({ ...prev, barcode: e.target.value }))} placeholder="Scan atau buat baru" className="font-mono" />
                <Button type="button" variant="outline" size="icon" onClick={handleGenerateBarcode} aria-label="Buat Barcode Baru"><RefreshCw className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 -mt-2"><div className="col-start-2 col-span-3"><Barcode value={newItem.barcode} /></div></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nama</Label><Input id="name" name="name" placeholder="Nama Barang" className="col-span-3" value={newItem.name} onChange={handleNewItemChange} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="category" className="text-right">Kategori</Label><Select name="category" onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))} value={newItem.category}><SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger><SelectContent><SelectItem value="Sparepart HP">Sparepart HP</SelectItem><SelectItem value="Sparepart Komputer">Sparepart Komputer</SelectItem><SelectItem value="Aksesoris">Aksesoris</SelectItem></SelectContent></Select></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="stock" className="text-right">Stok Awal</Label><Input id="stock" name="stock" type="number" placeholder="0" className="col-span-3" value={newItem.stock} onChange={handleNewItemChange} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="buyPrice" className="text-right">Harga Beli</Label><Input id="buyPrice" name="buyPrice" type="number" placeholder="Rp 0" className="col-span-3" value={newItem.buyPrice} onChange={handleNewItemChange} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="retailPrice" className="text-right">Harga Ecer</Label><Input id="retailPrice" name="retailPrice" type="number" placeholder="Rp 0" className="col-span-3" value={newItem.retailPrice} onChange={handleNewItemChange} /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="resellerPrice" className="text-right">Harga Reseller</Label><Input id="resellerPrice" name="resellerPrice" type="number" placeholder="Rp 0" className="col-span-3" value={newItem.resellerPrice} onChange={handleNewItemChange} /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="entryDate-new" className="text-right">Tgl. Masuk</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !newItem.entryDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newItem.entryDate ? format(newItem.entryDate, "PPP") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={newItem.entryDate} onSelect={(date) => setNewItem(prev => ({ ...prev, entryDate: date || new Date() }))} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier-new" className="text-right">Supplier</Label>
              <Select value={newItem.supplierId} onValueChange={(value) => setNewItem(prev => ({ ...prev, supplierId: value }))}>
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
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};