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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Printer, Download, FilePlus2, PlusCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";
import { toPng } from 'html-to-image';
import ServiceMasukReceipt from "@/components/ServiceMasukReceipt";
import { useServiceEntries, ServiceEntryWithCustomer } from "@/hooks/use-service-entries";
import { useCustomers } from "@/hooks/use-customers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ServiceEntryFormData {
  date: Date;
  customerId: string;
  category: string;
  deviceType: string;
  damageType: string;
  description: string;
}

interface ReceiptServiceEntry {
  id: string;
  date: Date;
  customerName: string;
  customerPhone: string;
  category: string;
  deviceType: string;
  damageType: string;
  description: string;
}

const initialState: ServiceEntryFormData = {
  date: new Date(),
  customerId: '',
  category: '',
  deviceType: '',
  damageType: '',
  description: '',
};

const newCustomerInitialState = { name: '', phone: '', address: '' };

const ServiceMasukPage = () => {
  const { customers } = useCustomers();
  const { serviceEntries, loading, addServiceEntry } = useServiceEntries();
  const { user } = useAuth();

  const [formData, setFormData] = useState(initialState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastEntry, setLastEntry] = useState<ReceiptServiceEntry | null>(null);
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

  const handleNewCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name) {
      showError("Nama pelanggan tidak boleh kosong.");
      return;
    }
    
    const { data: addedCustomer, error } = await supabase
      .from('customers')
      .insert({ name: newCustomer.name, phone: newCustomer.phone, address: newCustomer.address })
      .select()
      .single();

    if (error) {
      showError(`Gagal menambah pelanggan: ${error.message}`);
      return;
    }

    if (addedCustomer) {
      handleInputChange('customerId', addedCustomer.id);
    }
    
    showSuccess("Pelanggan baru berhasil ditambahkan!");
    setIsAddCustomerOpen(false);
    setNewCustomer(newCustomerInitialState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.category || !formData.damageType || !formData.deviceType) {
      showError("Harap lengkapi semua field yang wajib diisi.");
      return;
    }
    if (!user?.id) {
      showError("Anda harus login untuk menambah service masuk.");
      return;
    }

    const selectedCustomerData = customers.find(c => c.id === formData.customerId);
    if (!selectedCustomerData) {
      showError("Pelanggan tidak ditemukan.");
      return;
    }

    const newEntry = await addServiceEntry({
      date: formData.date.toISOString(),
      customer_id: formData.customerId,
      kasir_id: user.id,
      category: formData.category,
      device_type: formData.deviceType,
      damage_type: formData.damageType,
      description: formData.description,
    });

    if (newEntry) {
      const receiptData: ReceiptServiceEntry = {
        id: newEntry.id,
        date: new Date(newEntry.date),
        customerName: selectedCustomerData.name,
        customerPhone: selectedCustomerData.phone || '',
        category: newEntry.category,
        deviceType: newEntry.device_type,
        damageType: newEntry.damage_type,
        description: newEntry.description,
      };
      setLastEntry(receiptData);
      setIsFormOpen(false); // Close form dialog
      setIsReceiptOpen(true); // Open receipt dialog
      setFormData(initialState);
    }
  };

  const handleViewReceipt = (entry: ServiceEntryWithCustomer) => {
    const receiptData: ReceiptServiceEntry = {
      id: entry.id,
      date: new Date(entry.date),
      customerName: entry.customerName,
      customerPhone: entry.customerPhone,
      category: entry.category,
      deviceType: entry.device_type,
      damageType: entry.damage_type,
      description: entry.description,
    };
    setLastEntry(receiptData);
    setIsReceiptOpen(true);
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Selesai': return 'default';
      case 'Sudah Diambil': return 'default';
      case 'Proses': return 'secondary';
      case 'Gagal/Cancel': return 'destructive';
      case 'Pending':
      default:
        return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Data Service Masuk</CardTitle>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Tambah Data Service</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader><DialogTitle>Masukan Data Service Baru</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Tanggal Masuk</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.date} onSelect={(date) => handleInputChange('date', date || new Date())} initialFocus /></PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="customer">Pelanggan</Label>
                      <div className="flex gap-2">
                        <Select value={formData.customerId} onValueChange={(value) => handleInputChange('customerId', value)}>
                          <SelectTrigger id="customer"><SelectValue placeholder="Pilih Pelanggan" /></SelectTrigger>
                          <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="icon" onClick={() => setIsAddCustomerOpen(true)}><PlusCircle className="h-4 w-4" /></Button>
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
                      <Input id="deviceType" placeholder="Contoh: iPhone 13 Pro" value={formData.deviceType} onChange={(e) => handleInputChange('deviceType', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="damageType">Jenis Kerusakan</Label>
                    <Input id="damageType" placeholder="Contoh: Mati total, LCD pecah" value={formData.damageType} onChange={(e) => handleInputChange('damageType', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="description">Deskripsi / Kelengkapan</Label>
                    <Textarea id="description" placeholder="Deskripsikan keluhan dan kelengkapan" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
                  </div>
                </div>
                <DialogFooter className="p-4 pt-0">
                  <Button type="submit" size="lg">Simpan & Cetak Tanda Terima</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Service</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Perangkat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center h-24">Memuat data...</TableCell></TableRow>
              ) : serviceEntries.length > 0 ? (
                serviceEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono">{entry.id.substring(0, 8)}...</TableCell>
                    <TableCell>{format(new Date(entry.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{entry.customerName}</TableCell>
                    <TableCell>{entry.device_type}</TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(entry.status)}>{entry.status}</Badge></TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" onClick={() => handleViewReceipt(entry)}>
                        <Eye className="mr-2 h-4 w-4" /> Lihat Struk
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="text-center h-24">Belum ada data service masuk.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Tambah Pelanggan Baru</DialogTitle></DialogHeader>
          <form onSubmit={handleNewCustomerSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nama</Label><Input id="name" name="name" className="col-span-3" value={newCustomer.name} onChange={handleNewCustomerChange} /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="phone" className="text-right">Telepon</Label><Input id="phone" name="phone" className="col-span-3" value={newCustomer.phone} onChange={handleNewCustomerChange} /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="address" className="text-right">Alamat</Label><Input id="address" name="address" className="col-span-3" value={newCustomer.address} onChange={handleNewCustomerChange} /></div>
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