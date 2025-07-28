import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, ChevronsUpDown, Check, UserPlus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStock, Product } from "@/hooks/use-stock";
import { useCustomers } from "@/hooks/use-customers";
import { showError, showSuccess } from "@/utils/toast";
import SalesReceipt from "@/components/SalesReceipt";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

type CartItem = Product & { quantity: number; subtotal: number };

const SalesPage = () => {
  const { products, loading: productsLoading, decreaseStock } = useStock();
  const { customers, loading: customersLoading, addCustomer } = useCustomers();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerType, setCustomerType] = useState<"retail" | "reseller">("retail");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string>("");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<{ cart: CartItem[], total: number, payment: number, change: number, customerName: string | null } | null>(null);

  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });

  const getPrice = (product: Product) => {
    return customerType === "reseller" ? product.resellerPrice : product.retailPrice;
  };

  const handleAddItemToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItemId) {
      showError("Pilih barang terlebih dahulu.");
      return;
    }

    const product = products.find((p) => p.id === currentItemId);
    if (!product) {
      showError("Barang tidak ditemukan.");
      return;
    }

    const existingCartItem = cart.find((item) => item.id === product.id);

    if (product.stock <= (existingCartItem?.quantity || 0)) {
      showError("Stok tidak mencukupi.");
      return;
    }

    if (existingCartItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * getPrice(product),
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        { ...product, quantity: 1, subtotal: getPrice(product) },
      ]);
    }
    setCurrentItemId("");
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      showError(`Stok hanya tersisa ${product.stock}.`);
      return;
    }

    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: newQuantity,
                subtotal: newQuantity * getPrice(product),
              }
            : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  const changeAmount = useMemo(() => {
    return paymentAmount - totalAmount;
  }, [paymentAmount, totalAmount]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleCustomerTypeChange = (value: "retail" | "reseller") => {
    if (cart.length > 0) {
      if (!window.confirm("Mengubah tipe pelanggan akan mengosongkan keranjang. Lanjutkan?")) {
        return;
      }
      setCart([]);
    }
    setCustomerType(value);
    setSelectedCustomerId(null);
  };

  const resetTransaction = () => {
    setCart([]);
    setPaymentAmount(0);
    setSelectedCustomerId(null);
    setCurrentItemId("");
  };

  const handleProcessTransaction = async () => {
    if (cart.length === 0) {
      showError("Keranjang belanja kosong.");
      return;
    }
    if (changeAmount < 0) {
      showError("Jumlah pembayaran kurang.");
      return;
    }

    try {
      // Decrease stock for each item in cart
      await decreaseStock(cart.map(item => ({ productId: item.id, quantity: item.quantity })));

      const customer = customers.find(c => c.id === selectedCustomerId);

      // Prepare data for receipt
      setLastTransaction({
        cart,
        total: totalAmount,
        payment: paymentAmount,
        change: changeAmount,
        customerName: customer ? customer.name : (customerType === 'retail' ? 'Pelanggan' : 'Reseller')
      });

      showSuccess("Transaksi berhasil!");
      setIsReceiptOpen(true);
      resetTransaction();
    } catch (error: any) {
      showError(error.message || "Gagal memproses transaksi.");
    }
  };

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name) {
      showError("Nama pelanggan tidak boleh kosong.");
      return;
    }
    const added = await addCustomer(newCustomer);
    if (added) {
      setIsAddCustomerDialogOpen(false);
      setNewCustomer({ name: '', phone: '', address: '' });
      setSelectedCustomerId(added.id);
    }
  };
  
  useEffect(() => {
    // Recalculate cart subtotals if customer type changes
    if (cart.length > 0) {
      setCart(cart.map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return item; // Should not happen
        const price = getPrice(product);
        return {
          ...item,
          subtotal: item.quantity * price
        };
      }));
    }
  }, [customerType, products]);


  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transaksi Penjualan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddItemToCart} className="flex items-end gap-4 mb-4">
                <div className="flex-grow">
                  <Label>Cari Barang</Label>
                  <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={isComboboxOpen} className="w-full justify-between">
                        {currentItemId ? products.find((product) => product.id === currentItemId)?.name : "Pilih Barang..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                      <Command>
                        <CommandInput placeholder="Cari nama, kode, atau barcode..." />
                        <CommandList>
                          <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {products.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={`${product.name} ${product.id} ${product.barcode}`}
                                onSelect={() => {
                                  setCurrentItemId(product.id);
                                  setIsComboboxOpen(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", currentItemId === product.id ? "opacity-100" : "opacity-0")} />
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-xs text-muted-foreground font-mono">{product.barcode}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Stok: {product.stock} | {formatCurrency(getPrice(product))}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button type="submit" className="flex-shrink-0">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Tambah
                </Button>
              </form>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Nama Barang</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead className="w-[100px]">Jumlah</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.length > 0 ? (
                      cart.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{formatCurrency(getPrice(item))}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                              className="h-8 w-20 text-center"
                              min="1"
                              max={item.stock}
                            />
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveItem(item.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                          Keranjang masih kosong
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Column */}
        <div>
          <Card className="bg-gray-900 text-white">
            <CardHeader>
              <CardTitle className="text-xl">Info Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-400">Tipe Pelanggan</Label>
                <Select value={customerType} onValueChange={handleCustomerTypeChange}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Eceran</SelectItem>
                    <SelectItem value="reseller">Reseller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {customerType === "reseller" && (
                <div>
                  <Label className="text-gray-400">Pilih Pelanggan</Label>
                  <div className="flex gap-2">
                    <Select value={selectedCustomerId || ""} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white flex-grow">
                        <SelectValue placeholder="Pilih pelanggan..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={isAddCustomerDialogOpen} onOpenChange={setIsAddCustomerDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-gray-800 border-gray-700 hover:bg-gray-700 flex-shrink-0">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader><DialogTitle>Tambah Pelanggan Baru</DialogTitle></DialogHeader>
                        <form onSubmit={handleAddCustomerSubmit}>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nama</Label><Input id="name" value={newCustomer.name} onChange={(e) => setNewCustomer(p => ({ ...p, name: e.target.value }))} className="col-span-3" /></div>
                            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="phone" className="text-right">Telepon</Label><Input id="phone" value={newCustomer.phone} onChange={(e) => setNewCustomer(p => ({ ...p, phone: e.target.value }))} className="col-span-3" /></div>
                            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="address" className="text-right">Alamat</Label><Input id="address" value={newCustomer.address} onChange={(e) => setNewCustomer(p => ({ ...p, address: e.target.value }))} className="col-span-3" /></div>
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setIsAddCustomerDialogOpen(false)}>Batal</Button>
                            <Button type="submit">Simpan</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
              <div className="space-y-2 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total</span>
                  <span className="text-2xl font-bold">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Bayar</span>
                  <Input
                    type="number"
                    placeholder="Rp 0"
                    value={paymentAmount || ""}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="bg-gray-800 border-gray-700 text-white text-right w-36 font-bold"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Kembali</span>
                  <span className={cn("text-xl font-bold", changeAmount < 0 ? "text-red-500" : "text-green-400")}>
                    {formatCurrency(changeAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={handleProcessTransaction}
                disabled={cart.length === 0 || changeAmount < 0}
              >
                Proses Transaksi
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      {lastTransaction && (
        <SalesReceipt
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          transaction={lastTransaction}
        />
      )}
    </DashboardLayout>
  );
};

export default SalesPage;