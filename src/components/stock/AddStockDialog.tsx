import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { ChevronsUpDown, Check, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useStock, Product } from "@/hooks/use-stock";
import { Supplier } from "@/hooks/use-suppliers";
import { showError } from "@/utils/toast";

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  products: Product[];
  suppliers: Supplier[];
}

const initialState = { itemId: '', quantity: 0, entryDate: new Date(), supplierId: '' };

export const AddStockDialog = ({ open, onOpenChange, onSuccess, products, suppliers }: AddStockDialogProps) => {
  const { updateStockQuantity } = useStock();
  const [stockToAdd, setStockToAdd] = useState(initialState);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockToAdd.itemId || stockToAdd.quantity <= 0) {
      showError("Pilih barang dan masukkan jumlah yang valid.");
      return;
    }
    
    const updated = await updateStockQuantity(
      stockToAdd.itemId,
      stockToAdd.quantity,
      stockToAdd.entryDate.toISOString(),
      stockToAdd.supplierId || null
    );

    if (updated) {
      setStockToAdd(initialState);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Tambah Stok Barang</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item" className="text-right">Barang</Label>
              <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={isComboboxOpen} className="col-span-3 justify-between">
                    {stockToAdd.itemId ? products.find((item) => item.id === stockToAdd.itemId)?.name : "Pilih Barang..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Cari (nama, kode, barcode)..." />
                    <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {products.map((item) => (
                          <CommandItem key={item.id} value={`${item.name} ${item.id} ${item.barcode}`} onSelect={() => { setStockToAdd(prev => ({ ...prev, itemId: item.id })); setIsComboboxOpen(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", stockToAdd.itemId === item.id ? "opacity-100" : "opacity-0")} />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground font-mono">{item.barcode}</div>
                              <div className="text-xs text-muted-foreground">Stok: {item.stock}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Jumlah</Label>
              <Input id="quantity" type="number" placeholder="0" className="col-span-3" value={stockToAdd.quantity} onChange={(e) => setStockToAdd(prev => ({ ...prev, quantity: Number(e.target.value) }))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="entryDate" className="text-right">Tgl. Masuk</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !stockToAdd.entryDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {stockToAdd.entryDate ? format(stockToAdd.entryDate, "PPP") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={stockToAdd.entryDate} onSelect={(date) => setStockToAdd(prev => ({ ...prev, entryDate: date || new Date() }))} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">Supplier</Label>
              <Select value={stockToAdd.supplierId} onValueChange={(value) => setStockToAdd(prev => ({ ...prev, supplierId: value }))}>
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
            <Button type="submit">Tambah</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};