import { useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, Search, Edit, Trash2, RefreshCw, PlusSquare, ChevronsUpDown, Check, Calendar as CalendarIcon, Image as ImageIcon } from "lucide-react";
import Barcode from "@/components/Barcode";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useSuppliers } from "@/hooks/use-suppliers";
import { supabase } from "@/integrations/supabase/client";
import { useStock, Product } from "@/hooks/use-stock";

const newItemInitialState = { name: '', category: '', stock: 0, buyPrice: 0, retailPrice: 0, resellerPrice: 0, barcode: '', entryDate: new Date(), supplierId: '' };
const newSupplierInitialState = { name: '', phone: '', address: '' };
const addStockInitialState = { itemId: '', quantity: 0, entryDate: new Date(), supplierId: '' };

const StockPage = () => {
  const { products, loading: productsLoading, addProduct, updateProduct, deleteProduct, updateStockQuantity } = useStock();
  const { suppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState(newItemInitialState);
  const [newItemImage, setNewItemImage] = useState<File | null>(null);
  const [newItemImagePreview, setNewItemImagePreview] = useState<string | null>(null);

  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [editingItemImage, setEditingItemImage] = useState<File | null>(null);
  const [editingItemImagePreview, setEditingItemImagePreview] = useState<string | null>(null);

  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [stockToAdd, setStockToAdd] = useState(addStockInitialState);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState(newSupplierInitialState);

  const filteredStock = products.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.id.toLowerCase().includes(term) ||
      (item.barcode && item.barcode.toLowerCase().includes(term))
    );
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const handleGenerateBarcode = () => {
    const generated = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
    setNewItem(prev => ({ ...prev, barcode: generated }));
  };

  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['stock', 'buyPrice', 'retailPrice', 'resellerPrice'].includes(name);
    setNewItem(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'new') {
        setNewItemImage(file);
        setNewItemImagePreview(URL.createObjectURL(file));
      } else {
        setEditingItemImage(file);
        setEditingItemImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.category || !newItem.barcode) {
      showError("Harap isi semua field yang wajib diisi.");
      return;
    }
    
    const added = await addProduct({
      ...newItem,
      entryDate: newItem.entryDate.toISOString(),
    }, newItemImage);

    if (added) {
      setIsAddItemDialogOpen(false);
      setNewItem(newItemInitialState);
      setNewItemImage(null);
      setNewItemImagePreview(null);
    }
  };

  const handleEditItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingItem) return;
    const { name, value } = e.target;
    const isNumeric = ['stock', 'buyPrice', 'retailPrice', 'resellerPrice'].includes(name);
    setEditingItem({ ...editingItem, [name]: isNumeric ? Number(value) : value });
  };

  const handleEditItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    const updated = await updateProduct(editingItem.id, {
      name: editingItem.name,
      category: editingItem.category,
      stock: editingItem.stock,
      buyPrice: editingItem.buyPrice,
      retailPrice: editingItem.retailPrice,
      resellerPrice: editingItem.resellerPrice,
      barcode: editingItem.barcode,
      supplierId: editingItem.supplierId,
      entryDate: editingItem.entryDate,
      imageUrl: editingItem.imageUrl,
    }, editingItemImage);

    if (updated) {
      setIsEditItemDialogOpen(false);
      setEditingItem(null);
      setEditingItemImage(null);
      setEditingItemImagePreview(null);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
      await deleteProduct(itemId);
    }
  };

  const handleAddStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockToAdd.itemId || stockToAdd.quantity <= 0) {
      showError("Pilih barang dan masukkan jumlah yang valid.");
      return;
    }
    
    await updateStockQuantity(
      stockToAdd.itemId,
      stockToAdd.quantity,
      stockToAdd.entryDate.toISOString(),
      stockToAdd.supplierId || null
    );
    setIsAddStockDialogOpen(false);
    setStockToAdd(addStockInitialState);
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name) {
      showError("Nama supplier tidak boleh kosong.");
      return;
    }
    
    const { data: addedSupplier, error } = await supabase
      .from('suppliers')
      .insert({ name: newSupplier.name, phone: newSupplier.phone, address: newSupplier.address })
      .select()
      .single();

    if (error) {
      showError(`Gagal menambah supplier: ${error.message}`);
      return;
    }

    if (addedSupplier) {
      setStockToAdd(prev => ({ ...prev, supplierId: addedSupplier.id }));
      setNewItem(prev => ({ ...prev, supplierId: addedSupplier.id }));
    }
    
    showSuccess("Supplier baru berhasil ditambahkan!");
    setIsAddSupplierDialogOpen(false);
    setNewSupplier(newSupplierInitialState);
  };

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-2xl font-bold">Manajemen Stok Barang</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Cari (nama, kode, barcode)..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <PlusSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah Stok</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                    <DialogTitle>Tambah Stok Barang</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddStockSubmit}>
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
                      <div className="grid grid-cols-4 items-center gap-4">
                        <div />
                        <div className="col-span-3">
                          <Button type="button" variant="link" className="p-0 h-auto text-sm" onClick={() => setIsAddSupplierDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Supplier Baru
                          </Button>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="secondary" onClick={() => setIsAddStockDialogOpen(false)}>Batal</Button>
                      <Button type="submit">Tambah</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={isAddSupplierDialogOpen} onOpenChange={setIsAddSupplierDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Tambah Supplier Baru</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSupplierSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="sup-name" className="text-right">Nama</Label><Input id="sup-name" className="col-span-3" value={newSupplier.name} onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))} /></div>
                      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="sup-phone" className="text-right">Telepon</Label><Input id="sup-phone" className="col-span-3" value={newSupplier.phone} onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))} /></div>
                      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="sup-address" className="text-right">Alamat</Label><Input id="sup-address" className="col-span-3" value={newSupplier.address} onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))} /></div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="secondary" onClick={() => setIsAddSupplierDialogOpen(false)}>Batal</Button>
                      <Button type="submit">Simpan</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={isAddItemDialogOpen} onOpenChange={(open) => { setIsAddItemDialogOpen(open); if (open) handleGenerateBarcode(); }}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah Barang</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Tambah Barang Baru</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddItemSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">Foto</Label>
                        <div className="col-span-3">
                          <Input id="image" type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'new')} className="text-sm" />
                          {newItemImagePreview && <img src={newItemImagePreview} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-md border" />}
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
                      <div className="grid grid-cols-4 items-center gap-4">
                        <div />
                        <div className="col-span-3">
                          <Button type="button" variant="link" className="p-0 h-auto text-sm" onClick={() => setIsAddSupplierDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Supplier Baru
                          </Button>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="secondary" onClick={() => setIsAddItemDialogOpen(false)}>Batal</Button>
                      <Button type="submit">Simpan</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                {productsLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center h-24">Memuat data stok...</TableCell></TableRow>
                ) : filteredStock.length > 0 ? (
                  filteredStock.map((item) => (
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
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setEditingItem(item); setIsEditItemDialogOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteItem(item.id)}>
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
        </CardContent>
      </Card>

      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Data Barang</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleEditItemSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-image" className="text-right">Foto</Label>
                  <div className="col-span-3">
                    <Input id="edit-image" type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'edit')} className="text-sm" />
                    {(editingItemImagePreview || editingItem.imageUrl) && (
                      <img src={editingItemImagePreview || editingItem.imageUrl!} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-md border" />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-barcode" className="text-right">Barcode</Label><Input id="edit-barcode" name="barcode" value={editingItem.barcode} onChange={handleEditItemChange} className="col-span-3 font-mono" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-name" className="text-right">Nama</Label><Input id="edit-name" name="name" value={editingItem.name} onChange={handleEditItemChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-category" className="text-right">Kategori</Label><Select name="category" onValueChange={(value) => setEditingItem({ ...editingItem, category: value })} value={editingItem.category}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Sparepart HP">Sparepart HP</SelectItem><SelectItem value="Sparepart Komputer">Sparepart Komputer</SelectItem><SelectItem value="Aksesoris">Aksesoris</SelectItem></SelectContent></Select></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-stock" className="text-right">Stok</Label><Input id="edit-stock" name="stock" type="number" value={editingItem.stock} onChange={handleEditItemChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-buyPrice" className="text-right">Harga Beli</Label><Input id="edit-buyPrice" name="buyPrice" type="number" value={editingItem.buyPrice} onChange={handleEditItemChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-retailPrice" className="text-right">Harga Ecer</Label><Input id="edit-retailPrice" name="retailPrice" type="number" value={editingItem.retailPrice} onChange={handleEditItemChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-resellerPrice" className="text-right">Harga Reseller</Label><Input id="edit-resellerPrice" name="resellerPrice" type="number" value={editingItem.resellerPrice} onChange={handleEditItemChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-entryDate" className="text-right">Tgl. Masuk</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !editingItem.entryDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingItem.entryDate ? format(new Date(editingItem.entryDate), "PPP") : <span>Pilih tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={new Date(editingItem.entryDate)} onSelect={(date) => setEditingItem(prev => ({ ...prev!, entryDate: (date || new Date()).toISOString() }))} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-supplier" className="text-right">Supplier</Label>
                  <Select value={editingItem.supplierId || ''} onValueChange={(value) => setEditingItem(prev => ({ ...prev!, supplierId: value }))}>
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
                <Button type="button" variant="secondary" onClick={() => setIsEditItemDialogOpen(false)}>Batal</Button>
                <Button type="submit">Simpan Perubahan</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StockPage;