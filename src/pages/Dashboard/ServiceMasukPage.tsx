import { useState, useRef, useCallback } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Printer, Download, FilePlus2, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";
import { toPng } from 'html-to-image';
import ServiceMasukReceipt from "@/components/ServiceMasukReceipt";
import { serviceEntriesDB } from "@/data/service-entries";

// Mock Data
const initialCustomers = [
  { id: 'CUS001', name: 'Pelanggan Umum', phone: '-' },
  { id: 'CUS002', name: 'Budi Santoso', phone: '081234567890' },
  { id: 'CUS003', name: 'Ani Wijaya', phone: '081209876543' },
];

// Type Definitions
interface ServiceEntry {
  id: string;
  date: Date;
  customerId: string;
  customerName: string;
  customerPhone: string;
  category: string;
  deviceType: string;
  damageType: string;
  description: string;
}

const initialState = {
  date: new Date(),
  customerId: '',
  category: '',
  deviceType: '',
  damageType: '',
  description: '',
};

const newCustomerInitialState = { name: '', phone: '' };

const ServiceMasukPage = () => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [formData, setFormData] = useState(initialState);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastEntry, setLastEntry] = useState<ServiceEntry | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState(newCustomerInitialState);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNewCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleNewCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name) {
      showError("Nama pelanggan tidak boleh kosong.");
      return;
    }
    const newId = `CUS${(customers.length + 1).toString().padStart(3, '0')}`;
    const newCustomerData = { ...newCustomer, id: newId };
    
    setCustomers(prev => [...prev, newCustomerData]);
    handleInputChange('customerId', newId);
    
    showSuccess("Pelanggan baru berhasil ditambahkan!");
    setIsAddCustomerOpen(false);
    setNewCustomer(newCustomerInitialState);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.category || !formData.damageType || !formData.deviceType) {
      showError("Harap lengkapi semua field yang wajib diisi.");
      return;
    }

    const selectedCustomer = customers.find(c => c.id === formData.customerId);
    const newEntryData = {
      ...formData,
      id: `SRV-IN-${Date.now()}`,
      customerName: selectedCustomer?.name || '',
      customerPhone: selectedCustomer?.phone || '',
    };

    serviceEntriesDB.add(newEntryData);

    setLastEntry(newEntryData);
    setIsReceiptOpen(true);
    showSuccess("Data service masuk berhasil disimpan.");
    setFormData(initialState);
  };

  const handlePrint = () => window.print();

  const handleDownload = useCallback(() => {
    if (receiptRef.current === null) return;
    toPng(receiptRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `tanda-terima-${lastEntry?.id}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error('Gagal membuat gambar struk:', err));
  }, [receiptRef, lastEntry]);

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit}>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Masukan Data Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Tanggal Masuk</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={formData.date} onSelect={(date) => handleInputChange('date', date || new Date())} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="customer">Pelanggan</Label>
                <div className="flex gap-2">
                  <Select value={formData.customerId} onValueChange={(value) => handleInputChange('customerId', value)}>
                    <SelectTrigger id="customer"><SelectValue placeholder="Pilih Pelanggan" /></SelectTrigger>
                    <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => setIsAddCustomerOpen(true)}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Kategori Service</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger id="category"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Handphone">Handphone</SelectItem>
                    <SelectItem value="Komputer/Laptop">Komputer/Laptop</SelectItem>
                    <SelectItem value="Printer">Printer</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deviceType">Tipe Perangkat</Label>
                <Input id="deviceType" placeholder="Contoh: iPhone 13 Pro, Laptop Acer Aspire 5" value={formData.deviceType} onChange={(e) => handleInputChange('deviceType', e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="damageType">Jenis Kerusakan</Label>
              <Input id="damageType" placeholder="Contoh: Mati total, LCD pecah, tidak bisa charge" value={formData.damageType} onChange={(e) => handleInputChange('damageType', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="description">Deskripsi / Kelengkapan</Label>
              <Textarea id="description" placeholder="Deskripsikan keluhan pelanggan dan kelengkapan unit yang diterima (misal: unit + dus, tanpa charger)" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg">Simpan & Cetak Tanda Terima</Button>
          </CardFooter>
        </Card>
      </form>

      {/* Add Customer Dialog */}
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNewCustomerSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nama</Label>
                <Input id="name" name="name" className="col-span-3" value={newCustomer.name} onChange={handleNewCustomerChange} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Telepon</Label>
                <Input id="phone" name="phone" className="col-span-3" value={newCustomer.phone} onChange={handleNewCustomerChange} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsAddCustomerOpen(false)}>Batal</Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Tanda Terima Service</DialogTitle></DialogHeader>
          {lastEntry && <ServiceMasukReceipt ref={receiptRef} entry={lastEntry} />}
          <DialogFooter className="sm:justify-between gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsReceiptOpen(false)}><FilePlus2 className="mr-2 h-4 w-4" /> Selesai</Button>
            <div className="flex gap-2">
              <Button type="button" onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Unduh</Button>
              <Button type="button" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Cetak</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ServiceMasukPage;