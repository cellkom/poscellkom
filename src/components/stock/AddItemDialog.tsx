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
import { PlusCircle, RefreshCw, Calendar as CalendarIcon, ChevronsUpDown, Check } from "lucide-react";
import Barcode from "@/components/Barcode";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useStock } from "@/hooks/use-stock";
import { Supplier } from "@/hooks/use-suppliers";
import { showError, showSuccess } from "@/utils/toast";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  suppliers: Supplier[];
  categories: string[];
}

const initialState = { name: '', category: '', description: '', stock: 0, buyPrice: 0, retailPrice: 0, resellerPrice: 0, barcode: '', entryDate: new Date(), supplierId: '' };

export const AddItemDialog = ({ open, onOpenChange, onSuccess, suppliers, categories }: AddItemDialogProps) => {
  const { addProduct } = useStock();
  const [newItem, setNewItem] = useState(initialState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCategoryComboboxOpen, setIsCategoryComboboxOpen] = useState(false);
  
  const [localCategories, setLocalCategories] = useState(categories);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

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

  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleAddNewCategory = () => {
    if (!newCategoryName.trim()) {
      showError("Nama kategori tidak boleh kosong.");
      return;
    }
    const trimmedName = newCategoryName.trim();
    if (localCategories.some(c => c.toLowerCase() === trimmedName.toLowerCase())) {
      showError("Kategori sudah ada.");
      return;
    }
    setLocalCategories(prev => [...prev, trimmedName].sort());
    setNewItem(prev => ({ ...prev, category: trimmedName }));
    setNewCategoryName("");
    setIsAddCategoryDialogOpen(false);
    showSuccess(`Kategori "${trimmedName}" ditambahkan.`);
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Barang Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Kategori</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Popover open={isCategoryComboboxOpen} onOpenChange={setIsCategoryComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={isCategoryComboboxOpen} className="w-full justify-between">
                        {newItem.category || "Pilih Kategori..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Cari kategori..." />
                        <CommandList>
                          <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {localCategories.map((category) => (
                              <CommandItem key={category} value={category} onSelect={(currentValue) => { setNewItem(prev => ({ ...prev, category: currentValue })); setIsCategoryComboboxOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", newItem.category === category ? "opacity-100" : "opacity-0")} />
                                {category}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button type="button" variant="outline" size="icon" onClick={() => setIsAddCategoryDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">Deskripsi</Label>
                <Textarea id="description" name="description" placeholder="Deskripsi singkat produk" className="col-span-3" value={newItem.description} onChange={handleNewItemChange} />
              </div>
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
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Kategori Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="new-category-name">Nama Kategori</Label>
            <Input id="new-category-name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Contoh: Aksesoris" />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsAddCategoryDialogOpen(false)}>Batal</Button>
            <Button onClick={handleAddNewCategory}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};