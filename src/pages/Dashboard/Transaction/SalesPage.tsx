import { useState, useMemo, useRef, useCallback } from "react";
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
import { PlusCircle, ShoppingCart, Trash2, Minus, Plus, User, Tag, Banknote, Landmark, Printer, Download, FilePlus2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toPng } from 'html-to-image';
import Receipt from "@/components/Receipt";
import { installmentsDB } from "@/data/installments";
import { salesHistoryDB } from "@/data/salesHistory";
import { useStock, Product } from "@/hooks/use-stock"; // Import useStock hook
import { useCustomers } from "@/hooks/use-customers"; // Import useCustomers hook

// --- Type Definitions ---
type CartItem = Product & { quantity: number; priceType: 'retail' | 'reseller'; };
type PaymentMethod = 'tunai' | 'cicilan';
type CompletedTransaction = {
  id: string;
  items: CartItem[];
  summary: { totalSale: number; totalCost: number; profit: number; };
  customerName: string;
  paymentMethod: PaymentMethod;
  date: Date;
  paymentAmount: number;
  change: number;
  remainingAmount: number;
};

const SalesPage = () => {
  const { products, updateStockQuantity } = useStock(); // Use products from useStock
  const { customers } = useCustomers(); // Use customers from useCustomers
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('CUS001'); // Default to 'Pelanggan Umum'
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<CompletedTransaction | null>(null);
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

  const handleAddItemToCart = (item: Product) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (item.stock <= (existingItem?.quantity || 0)) {
      showError(`Stok ${item.name} tidak mencukupi.`);
      return;
    }
    if (existingItem) {
      setCart(cart.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem));
    } else {
      setCart([...cart, { ...item, quantity: 1, priceType: 'retail' }]);
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

  const handlePriceTypeChange = (itemId: string, priceType: 'retail' | 'reseller') => {
    setCart(cart.map(item => item.id === itemId ? { ...item, priceType } : item));
  };

  const transactionSummary = useMemo(() => {
    const totalSale = cart.reduce((sum, item) => (item.priceType === 'retail' ? item.retailPrice : item.resellerPrice) * item.quantity + sum, 0);
    const totalCost = cart.reduce((sum, item) => item.buyPrice * item.quantity + sum, 0);
    return { totalSale, totalCost, profit: totalSale - totalCost };
  }, [cart]);

  const paymentDetails = useMemo(() => {
    const totalSale = transactionSummary.totalSale;
    const change = paymentAmount > totalSale ? paymentAmount - totalSale : 0;
    const remainingAmount = paymentAmount < totalSale ? totalSale - paymentAmount : 0;
    return { change, remainingAmount };
  }, [paymentAmount, transactionSummary.totalSale]);

  const handleProcessTransaction = async () => {
    if (cart.length === 0) {
      showError("Keranjang belanja masih kosong.");
      return;
    }

    // Update stock in Supabase
    for (const cartItem of cart) {
      await updateStockQuantity(cartItem.id, -cartItem.quantity); // Decrease stock
    }

    const transaction: CompletedTransaction = {
      id: `TRX-${Date.now()}`,
      items: cart,
      summary: transactionSummary,
      customerName: customers.find(c => c.id === selectedCustomer)?.name || 'Umum',
      paymentMethod,
      date: new Date(),
      paymentAmount,
      change: paymentDetails.change,
      remainingAmount: paymentDetails.remainingAmount,
    };

    // Add to sales history
    salesHistoryDB.add({
      ...transaction,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        buyPrice: item.buyPrice,
        salePrice: item.priceType === 'retail' ? item.retailPrice : item.resellerPrice,
      })),
    });

    // Add to installments if not fully paid
    if (transaction.remainingAmount > 0) {
      installmentsDB.add({
        id: transaction.id,
        type: 'Penjualan',
        customerName: transaction.customerName,
        transactionDate: transaction.date,
        totalAmount: transaction.summary.totalSale,
        initialPayment: transaction.paymentAmount,
        details: cart.map(item => `${item.name} (x${item.quantity})`).join(', '),
      });
    }

    setLastTransaction(transaction);
    setIsReceiptDialogOpen(true);
    showSuccess("Transaksi berhasil diproses!");
  };

  const handleNewTransaction = () => {
    setCart([]);
    setSelectedCustomer('CUS001');
    setPaymentMethod('tunai');
    setPaymentAmount(0);
    setLastTransaction(null);
    setIsReceiptDialogOpen(false);
  };

  const handlePrint = () => window.print();

  const handleDownload = useCallback(() => {
    if (receiptRef.current === null) return;
    toPng(receiptRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `struk-${lastTransaction?.id}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error('Gagal membuat gambar struk:', err));
  }, [receiptRef, lastTransaction]);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Pelanggan</CardTitle></CardHeader>
            <CardContent>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger><SelectValue placeholder="Pilih Pelanggan" /></SelectTrigger>
                <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Keranjang Belanja</CardTitle>
              <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                <DialogTrigger asChild><Button><PlusCircle className="h-4 w-4 mr-2" /> Pilih Barang</Button></DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>Pilih Barang</DialogTitle></DialogHeader>
                  <Command>
                    <CommandInput placeholder="Cari nama atau kode barang..." />
                    <CommandList>
                      <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {products.filter(item => item.stock > 0).map(item => (
                          <CommandItem key={item.id} onSelect={() => handleAddItemToCart(item)} className="flex justify-between items-center">
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
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4" /><p className="font-medium">Keranjang Masih Kosong</p><p className="text-sm">Klik "Pilih Barang" untuk menambahkan produk.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Barang</TableHead><TableHead className="w-[120px]">Jumlah</TableHead><TableHead className="w-[180px]">Harga</TableHead><TableHead className="text-right">Subtotal</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
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
                          <TableCell>
                            <Select value={item.priceType} onValueChange={(value: 'retail' | 'reseller') => handlePriceTypeChange(item.id, value)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="retail">Ecer: {formatCurrency(item.retailPrice)}</SelectItem>
                                <SelectItem value="reseller">Reseller: {formatCurrency(item.resellerPrice)}</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency((item.priceType === 'retail' ? item.retailPrice : item.resellerPrice) * item.quantity)}</TableCell>
                          <TableCell><Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, 0)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" /> Pembayaran</CardTitle></CardHeader>
            <CardContent>
              <RadioGroup value={selectedCustomer === 'CUS001' ? 'tunai' : paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)} disabled={selectedCustomer === 'CUS001'}>
                <div className="flex items-center space-x-2 p-3 border rounded-md"><RadioGroupItem value="tunai" id="tunai" /><Label htmlFor="tunai" className="flex-grow">Tunai</Label></div>
                <div className="flex items-center space-x-2 p-3 border rounded-md"><RadioGroupItem value="cicilan" id="cicilan" /><Label htmlFor="cicilan" className="flex-grow">Cicilan</Label></div>
              </RadioGroup>
              {selectedCustomer === 'CUS001' && (
                <p className="text-xs text-muted-foreground mt-2">Pelanggan Umum hanya bisa tunai.</p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-primary text-primary-foreground">
            <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" /> Info Transaksi</CardTitle></CardHeader>            
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Item:</span> <span className="font-medium">{cart.length} produk</span></div>
              <div className="flex justify-between"><span>Kasir:</span> <span className="font-medium">admin</span></div>
              <div className="flex justify-between"><span>Tanggal:</span> <span className="font-medium">{format(new Date(), "d MMMM yyyy", { locale: id })}</span></div>
            </CardContent>
            <CardFooter className="flex-col space-y-4 p-4 bg-black/10 rounded-b-lg">
              <div className="w-full space-y-2 text-lg">
                <div className="flex justify-between"><span>Total Belanja:</span> <span className="font-bold text-2xl">{formatCurrency(transactionSummary.totalSale)}</span></div>
                <div className="flex justify-between items-center border-t border-primary-foreground/50 pt-2 mt-2">
                  <Label htmlFor="paymentAmount" className="text-base">Jumlah Bayar:</Label>
                  <Input
                    id="paymentAmount"
                    type="text"
                    value={formatNumberInput(paymentAmount)}
                    onChange={handlePaymentAmountChange}
                    className="w-40 text-right bg-primary-foreground/20 border-primary-foreground/50 text-primary-foreground text-lg placeholder:text-primary-foreground/70"
                    placeholder="0"
                  />
                </div>
                {paymentDetails.change > 0 && (<div className="flex justify-between"><span>Kembalian:</span> <span className="font-bold text-xl">{formatCurrency(paymentDetails.change)}</span></div>)}
                {paymentDetails.remainingAmount > 0 && (<div className="flex justify-between"><span>Sisa Bayar:</span> <span className="font-bold text-xl">{formatCurrency(paymentDetails.remainingAmount)}</span></div>)}
              </div>
              <Button size="lg" className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg" onClick={handleProcessTransaction} disabled={cart.length === 0}><Banknote className="h-5 w-5 mr-2" /> Proses Transaksi</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Struk Transaksi</DialogTitle></DialogHeader>
          {lastTransaction && <Receipt ref={receiptRef} transaction={lastTransaction} />}
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