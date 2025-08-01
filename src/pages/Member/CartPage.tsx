import MemberLayout from "@/components/Layout/MemberLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();

  return (
    <MemberLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Keranjang Belanja Anda
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Keranjang Anda kosong.</p>
                  <Button asChild className="mt-4">
                    <Link to="/member/home">Mulai Belanja</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-center">Jumlah</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{formatCurrency(item.retailPrice)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.retailPrice * item.quantity)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        
        {cartItems.length > 0 && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-4">
                  <span>Total</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <Button size="lg" className="w-full mt-4">
                  Lanjut ke Checkout
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Fitur checkout sedang dalam pengembangan.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MemberLayout>
  );
};

export default CartPage;