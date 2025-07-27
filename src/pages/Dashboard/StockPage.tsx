import { useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, Edit, Trash2, RefreshCw, PlusSquare } from "lucide-react";
import Barcode from "@/components/Barcode";

// Mock data for stock items with barcodes
const initialStockData = [
  { id: 'BRG001', name: 'LCD iPhone X', category: 'Sparepart HP', stock: 15, buyPrice: 650000, sellPrice: 850000, barcode: '8991234567890' },
  { id: 'BRG002', name: 'Baterai Samsung A50', category: 'Sparepart HP', stock: 25, buyPrice: 200000, sellPrice: 350000, barcode: '8991234567891' },
  { id: 'BRG003', name: 'Charger Type-C 25W', category: 'Aksesoris', stock: 50, buyPrice: 80000, sellPrice: 150000, barcode: '8991234567892' },
  { id: 'BRG004', name: 'Tempered Glass Universal', category: 'Aksesoris', stock: 120, buyPrice: 15000, sellPrice: 50000, barcode: '8991234567893' },
  { id: 'BRG005', name: 'SSD 256GB NVMe', category: 'Sparepart Komputer', stock: 10, buyPrice: 450000, sellPrice: 600000, barcode: '8991234567894' },
  { id: 'BRG006', name: 'RAM DDR4 8GB', category: 'Sparepart Komputer', stock: 18, buyPrice: 350000, sellPrice: 500000, barcode: '8991234567895' },
];

const StockPage = () => {
  const [stockData, setStockData] = useState(initialStockData);
  const [searchTerm, setSearchTerm] = useState("");
  const [newBarcode, setNewBarcode] = useState("");

  const filteredStock = stockData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const handleGenerateBarcode = () => {
    const generated = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
    setNewBarcode(generated);
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
                  placeholder="Cari barang..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Add Stock Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <PlusSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah Stok</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Tambah Stok Barang</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="item" className="text-right">Barang</Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Pilih Barang" />
                        </SelectTrigger>
                        <SelectContent>
                          {stockData.map(item => (
                            <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">Jumlah</Label>
                      <Input id="quantity" type="number" placeholder="0" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Batal</Button>
                    </DialogClose>
                    <Button type="submit">Tambah</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Add Item Dialog */}
              <Dialog onOpenChange={(open) => { if (open) handleGenerateBarcode() }}>
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
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-center block font-semibold">Barcode</Label>
                      <Barcode value={newBarcode} />
                      <div className="flex justify-center">
                          <Button type="button" variant="outline" size="sm" onClick={handleGenerateBarcode}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Buat Barcode Baru
                          </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Nama</Label>
                      <Input id="name" placeholder="Nama Barang" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">Kategori</Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sparepart-hp">Sparepart HP</SelectItem>
                          <SelectItem value="sparepart-komputer">Sparepart Komputer</SelectItem>
                          <SelectItem value="aksesoris">Aksesoris</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stock" className="text-right">Stok</Label>
                      <Input id="stock" type="number" placeholder="0" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="buyPrice" className="text-right">Harga Beli</Label>
                      <Input id="buyPrice" type="number" placeholder="Rp 0" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sellPrice" className="text-right">Harga Jual</Label>
                      <Input id="sellPrice" type="number" placeholder="Rp 0" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Batal</Button>
                    </DialogClose>
                    <Button type="submit">Simpan</Button>
                  </DialogFooter>
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
                  <TableHead>Kode</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-center">Stok</TableHead>
                  <TableHead className="text-right">Harga Beli</TableHead>
                  <TableHead className="text-right">Harga Jual</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell className="font-mono text-xs">{item.barcode}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-center">{item.stock}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.buyPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.sellPrice)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default StockPage;