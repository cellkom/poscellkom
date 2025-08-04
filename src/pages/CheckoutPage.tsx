import PublicLayout from "@/components/Layout/PublicLayout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const CheckoutPage = () => {
  const { cartItems } = useCart();
  const { profile, loading } = useAuth();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.retailPrice * item.quantity), 0);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Jumlah: {item.quantity}</p>
                        </div>
                        <p>{formatCurrency(item.retailPrice * item.quantity)}</p>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <p>Subtotal</p>
                      <p>{formatCurrency(subtotal)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Keranjang Anda kosong.</p>
                    <Button asChild variant="link" className="mt-2">
                        <Link to="/products">Mulai Belanja</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pembayaran</CardTitle>
                <CardDescription>Tunjukkan halaman ini kepada kasir untuk menyelesaikan transaksi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Nama</p>
                  <p className="text-muted-foreground">{profile?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-muted-foreground">{profile?.email}</p>
                </div>
                <Separator />
                <p className="text-sm text-muted-foreground p-3 bg-blue-50 border border-blue-200 rounded-md">
                  Untuk saat ini, pembayaran hanya dapat dilakukan secara langsung di toko.
                </p>
                <Button className="w-full" disabled>Proses di Kasir</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default CheckoutPage;