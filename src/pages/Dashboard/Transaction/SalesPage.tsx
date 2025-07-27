import { useState, useMemo } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { PlusCircle, ShoppingCart, Trash2, Minus, Plus, User, Tag, Banknote, Landmark } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// --- Mock Data (In a real app, this would come from a central state/API) ---

// Stock Item Data
const initialStockData = [
  { id: 'BRG001', name: 'LCD iPhone X', category: 'Sparepart HP', stock: 15, buyPrice: 650000, retailPrice: 850000, resellerPrice: 800000, barcode: '8991234567890' },
  { id: 'BRG002', name: 'Baterai Samsung A50', category: 'Sparepart HP', stock: 25, buyPrice: 200000, retailPrice: 350000, resellerPrice: 320000, barcode: '8991234567891' },
  { id: 'BRG003', name: 'Charger Type-C 25W', category: 'Aksesoris', stock: 50, buyPrice: 80000, retailPrice: 150000, resellerPrice: 125000, barcode: '8991234567892' },
  { id: 'BRG004', name: 'Tempered Glass Universal', category: 'Aksesoris', stock: 120, buyPrice: 15000, retailPrice: 50000, resellerPrice: 35000, barcode: '8991234567893' },
  { id: 'BRG005', name: 'SSD 256GB NVMe', category: 'Sparepart Komputer', stock: 10, buyPrice: 450000, retailPrice: 600000, resellerPrice: 550000, barcode: '8991234567894' },
];

// Customer Data
const customers = [
  { id: 'CUS001', name: 'Pelanggan Umum', phone: '-' },
  { id: 'CUS002', name: 'Budi Santoso', phone: '081234567890' },
  { id: 'CUS003', name: 'Ani Wijaya', phone: '081209876543' },
];

// --- Type Definitions ---
type StockItem = typeof initialStockData[0];
type CartItem = StockItem & {
  quantity: number;
  priceType: 'retail' | 'reseller';
};
type PaymentMethod = 'tunai' | 'cicilan';

const SalesPage = () => {
  const [stockData, setStockData] = useState(initialStockData);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('CUS001');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const handleAddItemToCart = (item: StockItem) => {
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
    const itemInStock = stockData.find(item => item.id === itemId);
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
    const totalSale = cart.reduce((sum, item) => {
      const price = item.priceType === 'retail' ? item.retailPrice : item.resellerPrice;
      return sum + price * item.quantity;
    }, 0);

    const totalCost = cart.reduce((sum, item) => sum + item.buyPrice * item.quantity, 0);
    const profit = totalSale - totalCost;

    return { totalSale, totalCost, profit };
  }, [cart]);

  const handleProcessTransaction = () => {
    if (cart.length === 0) {
      showError("Keranjang belanja masih kosong.");
      return;
    }

    // Update stock
    const newStockData = [...stockData];
    cart.forEach(cartItem => {
      const itemIndex = newStockData.findIndex(stockItem => stockItem.id === cartItem.id);
      if (itemIndex !== -1) {
        newStockData[itemIndex].stock -= cartItem.quantity;
      }
    });
    setStockData(newStockData);

    // TODO: Save transaction record, handle installments if selected

    showSuccess("Transaksi berhasil diproses!");
    setCart([]);
    setSelectedCustomer('CUS001');
    setPaymentMethod('tunai');
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Pelanggan" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Keranjang Belanja</CardTitle>
              <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" /> Pilih Barang
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Pilih Barang</DialogTitle>
                  </DialogHeader>
                  <Command>
                    <CommandInput placeholder="Cari nama atau kode barang..." />
                    <CommandList>
                      <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {stockData.filter(item => item.stock > 0).map(item => (
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
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
                  <p className="font-medium">Keranjang Masih Kosong</p>
                  <p className="text-sm">Klik "Pilih Barang" untuk menambahkan produk.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Barang</TableHead>
                        <TableHead className="w-[120px]">Jumlah</TableHead>
                        <TableHead className="w-[180px]">Harga</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
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
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="retail">Ecer: {formatCurrency(item.retailPrice)}</SelectItem>
                                <SelectItem value="reseller">Reseller: {formatCurrency(item.resellerPrice)}</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency((item.priceType === 'retail' ? item.retailPrice : item.resellerPrice) * item.quantity)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, 0)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </TableCell>
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" /> Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                <div className="flex items-center space-x-2 p-3 border rounded-md">
                  <RadioGroupItem value="tunai" id="tunai" />
                  <Label htmlFor="tunai" className="flex-grow">Tunai</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-md">
                  <RadioGroupItem value="cicilan" id="cicilan" />
                  <Label htmlFor="cicilan" className="flex-grow">Cicilan</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" /> Info Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Item:</span> <span className="font-medium">{cart.length} produk</span></div>
              <div className="flex justify-between"><span>Kasir:</span> <span className="font-medium">admin</span></div>
              <div className="flex justify-between"><span>Tanggal:</span> <span className="font-medium">{format(new Date(), "d MMMM yyyy", { locale: id })}</span></div>
            </CardContent>
            <CardFooter className="flex-col space-y-4 p-4">
              <div className="w-full space-y-2 text-lg">
                <div className="flex justify-between"><span>Total Modal:</span> <span className="font-semibold">{formatCurrency(transactionSummary.totalCost)}</span></div>
                <div className="flex justify-between"><span>Total Belanja:</span> <span className="font-bold text-2xl">{formatCurrency(transactionSummary.totalSale)}</span></div>
                <div className="flex justify-between text-green-400"><span>Estimasi Laba:</span> <span className="font-bold text-xl">{formatCurrency(transactionSummary.profit)}</span></div>
              </div>
              <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-lg" onClick={handleProcessTransaction} disabled={cart.length === 0}>
                <Banknote className="h-5 w-5 mr-2" /> Proses Transaksi
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalesPage;