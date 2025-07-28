import { useState, useMemo } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { PlusCircle, Wrench, Trash2, Minus, Plus, ClipboardList } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { serviceEntriesDB, useServiceEntries } from "@/data/service-entries";

// --- Mock Data (reusing from other pages for consistency) ---
const initialStockData = [
  { id: 'BRG001', name: 'LCD iPhone X', category: 'Sparepart HP', stock: 15, buyPrice: 650000, retailPrice: 850000, barcode: '8991234567890' },
  { id: 'BRG002', name: 'Baterai Samsung A50', category: 'Sparepart HP', stock: 25, buyPrice: 200000, retailPrice: 350000, barcode: '8991234567891' },
  { id: 'BRG003', name: 'Charger Type-C 25W', category: 'Aksesoris', stock: 50, buyPrice: 80000, retailPrice: 150000, barcode: '8991234567892' },
  { id: 'BRG004', name: 'Tempered Glass Universal', category: 'Aksesoris', stock: 120, buyPrice: 15000, retailPrice: 50000, barcode: '8991234567893' },
  { id: 'BRG005', name: 'SSD 256GB NVMe', category: 'Sparepart Komputer', stock: 10, buyPrice: 450000, retailPrice: 600000, barcode: '8991234567894' },
];
const customers = [
  { id: 'CUS001', name: 'Pelanggan Umum', phone: '-' },
  { id: 'CUS002', name: 'Budi Santoso', phone: '081234567890' },
  { id: 'CUS003', name: 'Ani Wijaya', phone: '081209876543' },
];

// --- Type Definitions ---
type StockItem = typeof initialStockData[0];
type UsedPart = StockItem & { quantity: number };
type PaymentMethod = 'tunai' | 'cicilan';
type ServiceStatus = 'Proses' | 'Selesai' | 'Sudah Diambil' | 'Gagal/Cancel';

const ServicePage = () => {
  const [stockData, setStockData] = useState(initialStockData);
  const [usedParts, setUsedParts] = useState<UsedPart[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceFee, setServiceFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [status, setStatus] = useState<ServiceStatus>('Proses');
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const allServiceEntries = useServiceEntries();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const handleAddPart = (item: StockItem) => {
    const existingPart = usedParts.find(part => part.id === item.id);
    if (item.stock <= (existingPart?.quantity || 0)) {
      showError(`Stok ${item.name} tidak mencukupi.`);
      return;
    }
    if (existingPart) {
      setUsedParts(usedParts.map(part => part.id === item.id ? { ...part, quantity: part.quantity + 1 } : part));
    } else {
      setUsedParts([...usedParts, { ...item, quantity: 1 }]);
    }
    setIsItemDialogOpen(false);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const itemInStock = stockData.find(item => item.id === itemId);
    if (newQuantity > (itemInStock?.stock || 0)) {
      showError(`Stok ${itemInStock?.name} tidak mencukupi.`);
      return;
    }
    if (newQuantity <= 0) {
      setUsedParts(usedParts.filter(item => item.id !== itemId));
    } else {
      setUsedParts(usedParts.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const summary = useMemo(() => {
    const sparepartCost = usedParts.reduce((sum, item) => item.retailPrice * item.quantity + sum, 0);
    const total = serviceFee + sparepartCost;
    const sparepartModal = usedParts.reduce((sum, item) => item.buyPrice * item.quantity + sum, 0);
    const profit = total - sparepartModal;
    return { sparepartCost, total, sparepartModal, profit };
  }, [usedParts, serviceFee]);

  const handleSelectService = (serviceId: string) => {
    const service = allServiceEntries.find(s => s.id === serviceId);
    if (service) {
        setSelectedServiceId(service.id);
        setSelectedCustomer(service.customerId);
        setServiceDescription(`${service.damageType} - ${service.description}`);
        setUsedParts([]);
        setServiceFee(0);
        setPaymentMethod('tunai');
        setStatus('Proses');
    }
  };

  const handleProcessService = () => {
    if (!selectedServiceId) {
      showError("Harap pilih service yang sedang berjalan dari daftar.");
      return;
    }

    // Allow processing with no cost only if status is Gagal/Cancel
    if (status !== 'Gagal/Cancel' && serviceFee <= 0 && usedParts.length === 0) {
        showError("Harap masukkan biaya service atau tambahkan sparepart.");
        return;
    }

    // Update the status in our mock DB
    serviceEntriesDB.update(selectedServiceId, { status });

    // Only deduct stock if the service was successful (not canceled)
    if (status !== 'Gagal/Cancel') {
        const newStockData = [...stockData];
        usedParts.forEach(part => {
          const itemIndex = newStockData.findIndex(stockItem => stockItem.id === part.id);
          if (itemIndex !== -1) {
            newStockData[itemIndex].stock -= part.quantity;
          }
        });
        setStockData(newStockData);
    }

    // Reset the form for the next transaction
    setUsedParts([]);
    setSelectedCustomer('');
    setServiceDescription('');
    setServiceFee(0);
    setPaymentMethod('tunai');
    setStatus('Proses');
    setSelectedServiceId(null);

    showSuccess("Transaksi service berhasil diproses!");
  };

  const pendingServices = useMemo(() => {
    return allServiceEntries.filter(entry => entry.status === 'Pending' || entry.status === 'Proses');
  }, [allServiceEntries]);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Pilih Service Masuk</CardTitle></CardHeader>
            <CardContent>
              <Select onValueChange={handleSelectService} value={selectedServiceId || ''}>
                <SelectTrigger><SelectValue placeholder="Pilih dari daftar service yang sedang berjalan..." /></SelectTrigger>
                <SelectContent>
                  {pendingServices.length > 0 ? (
                    pendingServices.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.id} - {s.customerName} ({s.deviceType})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada service yang sedang berjalan.</div>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Form Service</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer} disabled={!!selectedServiceId}>
                  <SelectTrigger id="customer"><SelectValue placeholder="Pilih Customer" /></SelectTrigger>
                  <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Deskripsi Service</Label>
                <Textarea id="description" placeholder="Deskripsi akan terisi otomatis jika memilih service dari daftar di atas" value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} disabled={!!selectedServiceId} />
              </div>
              <div>
                <Label htmlFor="serviceFee">Biaya Service</Label>
                <Input id="serviceFee" type="number" placeholder="0" value={serviceFee || ''} onChange={(e) => setServiceFee(Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="status">Status Service</Label>
                <Select value={status} onValueChange={(value: ServiceStatus) => setStatus(value)}>
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Proses">Proses</SelectItem>
                    <SelectItem value="Selesai">Selesai</SelectItem>
                    <SelectItem value="Sudah Diambil">Sudah Diambil</SelectItem>
                    <SelectItem value="Gagal/Cancel">Gagal/Cancel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Metode Pembayaran</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)} className="flex items-center gap-4 mt-2">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="tunai" id="tunai" /><Label htmlFor="tunai">Tunai</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="cicilan" id="cicilan" /><Label htmlFor="cicilan">Cicilan</Label></div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Sparepart yang Digunakan</CardTitle>
              <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                <DialogTrigger asChild><Button variant="outline"><PlusCircle className="h-4 w-4 mr-2" /> Tambah Sparepart</Button></DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>Pilih Sparepart</DialogTitle></DialogHeader>
                  <Command>
                    <CommandInput placeholder="Cari nama atau kode barang..." />
                    <CommandList>
                      <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {stockData.filter(item => item.stock > 0).map(item => (
                          <CommandItem key={item.id} onSelect={() => handleAddPart(item)} className="flex justify-between items-center cursor-pointer">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">Stok: {item.stock} | {formatCurrency(item.retailPrice)}</p>
                            </div>
                            <Button variant="outline" size="sm">Pilih</Button>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {usedParts.length === 0 ? (
                <div className="text-center py-8 text-gray-500"><p>Belum ada sparepart yang ditambahkan.</p></div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Barang</TableHead><TableHead className="w-[120px]">Jumlah</TableHead><TableHead className="text-right">Harga</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {usedParts.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                            <Input type="number" value={item.quantity} onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)} className="w-14 text-center" />
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(item.retailPrice * item.quantity)}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, 0)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Ringkasan</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span>Biaya Service:</span> <span className="font-medium">{formatCurrency(serviceFee)}</span></div>
              <div className="flex justify-between"><span>Biaya Sparepart:</span> <span className="font-medium">{formatCurrency(summary.sparepartCost)}</span></div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>Total:</span> <span>{formatCurrency(summary.total)}</span></div>
              <div className="flex justify-between text-sm text-muted-foreground"><span>Modal Sparepart:</span> <span>{formatCurrency(summary.sparepartModal)}</span></div>
              <div className="flex justify-between text-lg font-bold text-green-600"><span>Laba:</span> <span>{formatCurrency(summary.profit)}</span></div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full" onClick={handleProcessService}><Wrench className="h-5 w-5 mr-2" /> Proses Service</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ServicePage;