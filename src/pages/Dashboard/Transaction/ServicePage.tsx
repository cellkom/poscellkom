import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { PlusCircle, Wrench, Trash2, Minus, Plus, ClipboardList, Printer, Download, FilePlus2, Banknote } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { useServiceEntries, ServiceEntryWithCustomer } from "@/hooks/use-service-entries"; // Updated import
import ServiceReceipt from "@/components/ServiceReceipt";
import { toPng } from 'html-to-image';
import { installmentsDB } from "@/data/installments";
import { serviceHistoryDB } from "@/data/serviceHistory";
import { useStock, Product } from "@/hooks/use-stock";
import { useCustomers } from "@/hooks/use-customers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// --- Type Definitions ---
type UsedPart = Product & { quantity: number };
type PaymentMethod = 'tunai' | 'cicilan';
type ServiceStatus = 'Pending' | 'Proses' | 'Selesai' | 'Sudah Diambil' | 'Gagal/Cancel';
type CompletedServiceTransaction = {
  id: string;
  date: Date;
  customerName: string;
  description: string;
  usedParts: UsedPart[];
  serviceFee: number;
  total: number;
  paymentAmount: number;
  change: number;
  remainingAmount: number;
};

const ServicePage = () => {
  const { products, updateStockQuantity } = useStock();
  const { customers } = useCustomers();
  const { serviceEntries, updateServiceEntry } = useServiceEntries();
  const { user } = useAuth();
  const [usedParts, setUsedParts] = useState<UsedPart[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceFee, setServiceFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [status, setStatus] = useState<ServiceStatus>('Proses');
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<CompletedServiceTransaction | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  
  const formatNumberInput = (num: number): string => {
    if (num === 0) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseInt(rawValue.replace(/[^0-9]/g, ''), 10);
    setPaymentAmount(isNaN(numericValue) ? 0 : numericValue);
  };

  const handleAddPart = (item: Product) => {
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
    const itemInStock = products.find(item => item.id === itemId);
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

  const paymentDetails = useMemo(() => {
    const total = summary.total;
    const change = paymentAmount > total ? paymentAmount - total : 0;
    const remainingAmount = paymentAmount < total ? total - paymentAmount : 0;
    return { change, remainingAmount };
  }, [paymentAmount, summary.total]);

  const handleSelectService = (serviceId: string) => {
    const service = serviceEntries.find(s => s.id === serviceId);
    if (service) {
        setSelectedServiceId(service.id);
        setSelectedCustomer(service.customer_id); // Use customer_id from DB
        setServiceDescription(`${service.damage_type} - ${service.description}`);
        setUsedParts([]);
        setServiceFee(0);
        setPaymentMethod('tunai');
        setStatus(service.status); // Set initial status from DB
    }
  };

  const handleProcessService = async () => {
    if (!selectedServiceId) {
      showError("Harap pilih service yang sedang berjalan dari daftar.");
      return;
    }
    if (status !== 'Gagal/Cancel' && serviceFee <= 0 && usedParts.length === 0) {
        showError("Harap masukkan biaya service atau tambahkan sparepart.");
        return;
    }

    const selectedServiceEntry = serviceEntries.find(e => e.id === selectedServiceId);
    if (!selectedServiceEntry) {
      showError("Entri service tidak ditemukan.");
      return;
    }
    if (!user) {
      showError("Sesi pengguna tidak ditemukan. Silakan login ulang.");
      return;
    }

    const transaction: CompletedServiceTransaction = {
      id: selectedServiceId,
      date: new Date(),
      customerName: selectedServiceEntry.customerName,
      description: serviceDescription,
      usedParts: usedParts,
      serviceFee: serviceFee,
      total: summary.total,
      paymentAmount: paymentAmount,
      change: paymentDetails.change,
      remainingAmount: paymentDetails.remainingAmount,
    };

    // --- Supabase Integration ---
    try {
      const { data: dbTransaction, error: transactionError } = await supabase
        .from('service_transactions')
        .insert({
          service_entry_id: selectedServiceId,
          customer_id: selectedServiceEntry.customer_id,
          customer_name_cache: selectedServiceEntry.customerName,
          description: transaction.description,
          service_fee: transaction.serviceFee,
          total_parts_cost: summary.sparepartCost,
          total_amount: transaction.total,
          paid_amount: transaction.paymentAmount,
          change_amount: transaction.change,
          remaining_amount: transaction.remainingAmount,
          payment_method: paymentMethod,
          kasir_id: user.id,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      if (usedParts.length > 0) {
        const serviceItemsForDb = usedParts.map(item => ({
          transaction_id: dbTransaction.id,
          product_id: item.id,
          quantity: item.quantity,
          buy_price_at_sale: item.buyPrice,
          sale_price_at_sale: item.retailPrice,
        }));

        const { error: itemsError } = await supabase
          .from('service_transaction_items')
          .insert(serviceItemsForDb);

        if (itemsError) throw itemsError;
      }

      if (transaction.remainingAmount > 0 && selectedServiceEntry.customer_id) {
        const { error: installmentError } = await supabase
          .from('installments')
          .insert({
            transaction_id_display: transaction.id,
            transaction_type: 'Servis',
            customer_id: selectedServiceEntry.customer_id,
            total_amount: transaction.total,
            paid_amount: transaction.paymentAmount,
            remaining_amount: transaction.remainingAmount,
            status: 'Belum Lunas',
            details: transaction.description,
            kasir_id: user.id,
          });
        if (installmentError) throw installmentError;
      }
      
      showSuccess("Transaksi service berhasil diproses dan disimpan ke database!");

    } catch (error: any) {
      showError(`Gagal menyimpan ke database: ${error?.message || JSON.stringify(error)}`);
      console.error("Supabase error:", error);
      return;
    }
    // --- End Supabase Integration ---

    // Keep local data for now to prevent breaking reports
    serviceHistoryDB.add({
      ...transaction,
      usedParts: usedParts.map(p => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        buyPrice: p.buyPrice,
        retailPrice: p.retailPrice,
      })),
    });

    if (paymentDetails.remainingAmount > 0) {
      installmentsDB.add({
        id: transaction.id,
        type: 'Servis',
        customerName: transaction.customerName,
        transactionDate: transaction.date,
        totalAmount: transaction.total,
        initialPayment: transaction.paymentAmount,
        details: transaction.description,
      });
    }
    
    setLastTransaction(transaction);
    setIsReceiptOpen(true);
    
    // Update status in Supabase
    await updateServiceEntry(selectedServiceId, { status });

    if (status !== 'Gagal/Cancel') {
        // Update stock in Supabase for used parts
        for (const part of usedParts) {
            await updateStockQuantity(part.id, -part.quantity); // Decrease stock
        }
    }
  };

  const handleNewTransaction = () => {
    setUsedParts([]);
    setSelectedCustomer('');
    setServiceDescription('');
    setServiceFee(0);
    setPaymentMethod('tunai');
    setPaymentAmount(0);
    setStatus('Proses');
    setSelectedServiceId(null);
    setLastTransaction(null);
    setIsReceiptOpen(false);
  };

  const handlePrint = useCallback(() => window.print(), []);

  const handleDownload = useCallback(() => {
    if (receiptRef.current === null) return;
    toPng(receiptRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `nota-service-${lastTransaction?.id}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error('Gagal membuat gambar struk:', err));
  }, [receiptRef, lastTransaction]);

  useEffect(() => {
    if (isReceiptOpen && lastTransaction) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 500); // Delay to allow receipt to render
      return () => clearTimeout(timer);
    }
  }, [isReceiptOpen, lastTransaction, handlePrint]);

  const pendingServices = useMemo(() => {
    return serviceEntries.filter(entry => entry.status === 'Pending' || entry.status === 'Proses');
  }, [serviceEntries]);

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
                        {s.id} - {s.customerName} ({s.device_type})
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
            <CardHeader><CardTitle>Transaksi Service</CardTitle></CardHeader>
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
                    <SelectItem value="Pending">Pending</SelectItem>
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
                    <CommandInput placeholder="Cari nama, kode, atau barcode..." />
                    <CommandList>
                      <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {products.filter(item => item.stock > 0).map(item => (
                          <CommandItem key={item.id} value={`${item.name} ${item.id} ${item.barcode}`} onSelect={() => handleAddPart(item)} className="flex justify-between items-center cursor-pointer">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground font-mono">{item.barcode}</p>
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
                        <TableCell><Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, 0)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
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
              <div className="flex justify-between text-lg font-bold text-primary"><span>Laba:</span> <span>{formatCurrency(summary.profit)}</span></div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="paymentAmount" className="text-base">Jumlah Bayar:</Label>
                  <Input
                    id="paymentAmount"
                    type="text"
                    value={formatNumberInput(paymentAmount)}
                    onChange={handlePaymentAmountChange}
                    className="w-40 text-right text-lg"
                    placeholder="0"
                  />
                </div>
                {paymentDetails.change > 0 && (
                  <div className="flex justify-between text-primary"><span>Kembalian:</span> <span className="font-bold text-xl">{formatCurrency(paymentDetails.change)}</span></div>
                )}
                {paymentDetails.remainingAmount > 0 && (
                  <div className="flex justify-between text-destructive"><span>Sisa Bayar:</span> <span className="font-bold text-xl">{formatCurrency(paymentDetails.remainingAmount)}</span></div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full" onClick={handleProcessService} disabled={!selectedServiceId}><Banknote className="h-5 w-5 mr-2" /> Proses & Cetak Nota</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nota Service</DialogTitle></DialogHeader>
          {lastTransaction && <ServiceReceipt ref={receiptRef} transaction={lastTransaction} />}
          <DialogFooter className="sm:justify-between gap-2">
            <Button type="button" variant="secondary" onClick={handleNewTransaction}><FilePlus2 className="mr-2 h-4 w-4" /> Transaksi Baru</Button>
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

export default ServicePage;