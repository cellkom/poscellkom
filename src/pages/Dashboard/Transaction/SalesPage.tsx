import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ShoppingCart, Tag, Trash2, Minus, Plus, UserPlus, Banknote, Printer, Download, FilePlus2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { useStock, Product } from "@/hooks/use-stock";
import { useCustomers } from "@/hooks/use-customers";
import SalesReceipt from "@/components/SalesReceipt";
import { toPng } from 'html-to-image';
import { salesHistoryDB } from "@/data/salesHistory";
import { installmentsDB } from "@/data/installments";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// --- Type Definitions ---
type CartItem = Product & { quantity: number };
type CustomerType = 'umum' | 'reseller';
type PaymentMethod = 'tunai' | 'cicilan';
type CompletedTransaction = {
  id: string;
  date: Date;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentAmount: number;
  change: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
};

const SalesPage = () => {
  const { products, updateStockQuantity } = useStock();
  const { customers, addCustomer } = useCustomers();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerType, setCustomerType] = useState<CustomerType>('umum');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<CompletedTransaction | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });
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

  const handleAddToCart = (item: Product) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (item.stock <= (existingItem?.quantity || 0)) {
      showError(`Stok ${item.name} tidak mencukupi.`);
      return;
    }
    if (existingItem) {
      setCart(cart.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
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
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      setCart(cart.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const selectedCustomerName = useMemo(() => {
    if (!selectedCustomerId) return 'Umum';
    return customers.find(c => c.id === selectedCustomerId)?.name || 'Umum';
  }, [selectedCustomerId, customers]);

  const summary = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const price = customerType === 'reseller' ? item.resellerPrice : item.retailPrice;
      return price * item.quantity + sum;
    }, 0);
    const total = subtotal - discount;
    const modal = cart.reduce((sum, item) => item.buyPrice * item.quantity + sum, 0);
    const profit = total - modal;
    return { subtotal, total, modal, profit };
  }, [cart, customerType, discount]);

  const paymentDetails = useMemo(() => {
    const total = summary.total;
    const change = paymentAmount > total ? paymentAmount - total : 0;
    const remainingAmount = paymentAmount < total ? total - paymentAmount : 0;
    return { change, remainingAmount };
  }, [paymentAmount, summary.total]);

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) {
      showError("Nama dan nomor telepon wajib diisi.");
      return;
    }
    await addCustomer(newCustomer);
    showSuccess("Customer baru berhasil ditambahkan!");
    setNewCustomer({ name: '', phone: '', address: '' });
    setIsCustomerDialogOpen(false);
  };

  const handleProcessTransaction = async () => {
    if (cart.length === 0) {
      showError("Keranjang belanja masih kosong.");
      return;
    }
    if (paymentMethod === 'tunai' && paymentAmount < summary.total) {
      showError("Jumlah bayar kurang dari total belanja.");
      return;
    }
    if (!user) {
      showError("Sesi pengguna tidak ditemukan. Silakan login ulang.");
      return;
    }

    const transaction: CompletedTransaction = {
      id: `TRX-${Date.now()}`,
      date: new Date(),
      customerName: selectedCustomerName,
      items: cart,
      subtotal: summary.subtotal,
      discount: discount,
      total: summary.total,
      paymentAmount: paymentAmount,
      change: paymentDetails.change,
      remainingAmount: paymentDetails.remainingAmount,
      paymentMethod: paymentMethod,
    };

    // --- Supabase Integration ---
    try {
      const { data: dbTransaction, error: transactionError } = await supabase
        .from('sales_transactions')
        .insert({
          transaction_id_display: transaction.id,
          customer_id: selectedCustomerId,
          customer_name_cache: transaction.customerName,
          subtotal: transaction.subtotal,
          discount: transaction.discount,
          total_amount: transaction.total,
          paid_amount: transaction.paymentAmount,
          change_amount: transaction.change,
          remaining_amount: transaction.remainingAmount,
          payment_method: transaction.paymentMethod,
          kasir_id: user.id,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      const saleItemsForDb = cart.map(item => ({
        transaction_id: dbTransaction.id,
        product_id: item.id,
        quantity: item.quantity,
        buy_price_at_sale: item.buyPrice,
        sale_price_at_sale: customerType === 'reseller' ? item.resellerPrice : item.retailPrice,
      }));

      const { error: itemsError } = await supabase
        .from('sales_transaction_items')
        .insert(saleItemsForDb);

      if (itemsError) throw itemsError;

      if (transaction.remainingAmount > 0 && selectedCustomerId) {
        const { error: installmentError } = await supabase
          .from('installments')
          .insert({
            transaction_id_display: transaction.id,
            transaction_type: 'Penjualan',
            customer_id: selectedCustomerId,
            total_amount: transaction.total,
            paid_amount: transaction.paymentAmount,
            remaining_amount: transaction.remainingAmount,
            status: 'Belum Lunas',
            details: `${transaction.items.length} item terjual.`,
            kasir_id: user.id,
          });
        if (installmentError) throw installmentError;
      }
    } catch (error: any) {
      let errorMessage = "Terjadi kesalahan yang tidak diketahui.";
      if (error) {
        if (typeof error.message === 'string') {
          errorMessage = error.message;
          if (typeof error.details === 'string') errorMessage += ` Detail: ${error.details}`;
          if (typeof error.hint === 'string') errorMessage += ` Petunjuk: ${error.hint}`;
        } else {
          try {
            const errorString = JSON.stringify(error);
            errorMessage = errorString === '{}' ? "Objek error kosong, periksa log konsol." : errorString;
          } catch (e) {
            errorMessage = "Gagal mengubah error menjadi string.";
          }
        }
      }
      showError(`Gagal menyimpan ke database: ${errorMessage}`);
      console.error("Supabase error:", error);
      return;
    }
    // --- End Supabase Integration ---

    // Keep local data for now to prevent breaking reports
    salesHistoryDB.add({
      id: transaction.id,
      items: transaction.items.map(i => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        buyPrice: i.buyPrice,
        salePrice: customerType === 'reseller' ? i.resellerPrice : i.retailPrice,
      })),
      summary: {
        totalSale: transaction.total,
        totalCost: summary.modal,
        profit: summary.profit,
      },
      customerName: transaction.customerName,
      paymentMethod: transaction.paymentMethod,
      date: transaction.date,
      paymentAmount: transaction.paymentAmount,
      remainingAmount: transaction.remainingAmount,
    });

    if (paymentDetails.remainingAmount > 0) {
      installmentsDB.add({
        id: transaction.id,
        type: 'Penjualan',
        customerName: transaction.customerName,
        transactionDate: transaction.date,
        totalAmount: transaction.total,
        initialPayment: transaction.paymentAmount,
        details: `${transaction.items.length} item`,
      });
    }
    
    setLastTransaction(transaction);
    setIsReceiptOpen(true);
    
    for (const item of cart) {
      await updateStockQuantity(item.id, -item.quantity);
    }
    showSuccess("Transaksi berhasil diproses dan disimpan ke database!");
  };

  const handleNewTransaction = () => {
    setCart([]);
    setCustomerType('umum');
    setSelectedCustomerId(null);
    setPaymentMethod('tunai');
    setPaymentAmount(0);
    setDiscount(0);
    setLastTransaction(null);
    setIsReceiptOpen(false);
  };

  const handlePrint = useCallback(() => window.print(), []);

  const handleDownload = useCallback(() => {
    if (receiptRef.current === null) return;
    toPng(receiptRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `nota-${lastTransaction?.id}.png`;
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

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Pilih Barang</CardTitle>
              <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                <DialogTrigger asChild><Button variant="outline">Cari Barang</Button></DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>Pilih Barang</DialogTitle></DialogHeader>
                  <Command>
                    <CommandInput placeholder="Cari nama, kode, atau barcode..." />
                    <CommandList>
                      <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {products.filter(item => item.stock > 0).map(item => (
                          <CommandItem key={item.id} value={`${item.name} ${item.id} ${item.barcode}`} onSelect={() => handleAddToCart(item)} className="flex justify-between items-center cursor-pointer">
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
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">Keranjang belanja masih kosong</p>
                </div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Barang</TableHead><TableHead className="w-[120px]">Jumlah</TableHead><TableHead className="text-right">Harga</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {cart.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                            <Input type="number" value={item.quantity} onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)} className="w-14 text-center" />
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency((customerType === 'reseller' ? item.resellerPrice : item.retailPrice) * item.quantity)}</TableCell>
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
          <Card className="bg-slate-900 text-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 border-b border-slate-700 pb-4">
                <Tag className="h-5 w-5" />
                Info Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Item:</span>
                <span className="font-medium">{cart.length} produk</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kasir:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-medium">{selectedCustomerName || 'Umum'}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Customer & Pembayaran</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tipe Customer</Label>
                <RadioGroup value={customerType} onValueChange={(value: CustomerType) => setCustomerType(value)} className="flex items-center gap-4 mt-2">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="umum" id="umum" /><Label htmlFor="umum">Umum</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="reseller" id="reseller" /><Label htmlFor="reseller">Reseller</Label></div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="customer">Pilih Customer</Label>
                <div className="flex gap-2">
                  <Select value={selectedCustomerId || ''} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger id="customer"><SelectValue placeholder="Pilih dari daftar" /></SelectTrigger>
                    <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                    <DialogTrigger asChild><Button variant="outline" size="icon"><UserPlus className="h-4 w-4" /></Button></DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader><DialogTitle>Tambah Customer Baru</DialogTitle></DialogHeader>
                      <form onSubmit={handleCustomerSubmit}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nama</Label><Input id="name" value={newCustomer.name} onChange={(e) => setNewCustomer(p => ({ ...p, name: e.target.value }))} className="col-span-3" /></div>
                          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="phone" className="text-right">Telepon</Label><Input id="phone" value={newCustomer.phone} onChange={(e) => setNewCustomer(p => ({ ...p, phone: e.target.value }))} className="col-span-3" /></div>
                          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="address" className="text-right">Alamat</Label><Input id="address" value={newCustomer.address} onChange={(e) => setNewCustomer(p => ({ ...p, address: e.target.value }))} className="col-span-3" /></div>
                        </div>
                        <DialogFooter><Button type="submit">Simpan</Button></DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
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
            <CardHeader><CardTitle>Total Belanja</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span>Subtotal:</span> <span className="font-medium">{formatCurrency(summary.subtotal)}</span></div>
              <div className="flex justify-between items-center">
                <Label htmlFor="discount">Diskon:</Label>
                <Input id="discount" type="number" value={discount || ''} onChange={(e) => setDiscount(Number(e.target.value))} className="w-32 text-right" placeholder="0" />
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>Total:</span> <span>{formatCurrency(summary.total)}</span></div>
              <div className="flex justify-between text-sm text-muted-foreground"><span>Modal:</span> <span>{formatCurrency(summary.modal)}</span></div>
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
              <Button size="lg" className="w-full" onClick={handleProcessTransaction}><Banknote className="h-5 w-5 mr-2" /> Proses & Cetak Nota</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nota Penjualan</DialogTitle></DialogHeader>
          {lastTransaction && <SalesReceipt ref={receiptRef} transaction={lastTransaction} customerType={customerType} />}
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

export default SalesPage;