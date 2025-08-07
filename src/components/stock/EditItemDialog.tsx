import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, ChevronsUpDown, Check, PlusCircle } from "lucide-react";
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
  categories: string[];
}

export const EditItemDialog = ({ open, onOpenChange, onSuccess, item, suppliers, categories }: EditItemDialogProps) => {
  const { updateProduct } = useStock();
  const [editingItemData, setEditingItemData] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCategoryComboboxOpen, setIsCategoryComboboxOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">Kategori</Label>
              <Popover open={isCategoryComboboxOpen} onOpenChange={setIsCategoryComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={isCategoryComboboxOpen} className="col-span-3 justify-between">
                    {editingItemData.category || "Pilih Kategori..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Command>
                    <CommandInput placeholder="Cari atau buat baru..." onValueChange={setCategorySearch} />
                    <CommandList>
                      <CommandEmpty>
                        {categorySearch && (
                          <CommandItem onSelect={() => { setEditingItemData({ ...editingItemData, category: categorySearch }); setIsCategoryComboboxOpen(false); }}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah kategori: "{categorySearch}"
                          </CommandItem>
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => (
                          <CommandItem key={category} value={category} onSelect={(currentValue) => { setEditingItemData({ ...editingItemData, category: currentValue }); setIsCategoryComboboxOpen(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", editingItemData.category === category ? "opacity-100" : "opacity-0")} />
                            {category}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">Deskripsi</Label>
              <Textarea id="edit-description" name="description" value={editingItemData.description || ''} onChange={handleChange} className="col-span-3" />
            </div>
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