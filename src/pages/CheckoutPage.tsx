import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "@/components/Layout/PublicLayout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { profile, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.retailPrice * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (!profile || cartItems.length === 0) return;

    setIsSubmitting(true);
    const orderItems = cartItems.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price_at_order: item.retailPrice,
    }));

    const { error } = await supabase.rpc('create_order_with_items', {
      p_member_id: profile.id,
      p_total_amount: subtotal,
      p_items: orderItems,
    });

    setIsSubmitting(false);
    if (error) {
      showError(`Gagal membuat pesanan: ${error.message}`);
    } else {
      showSuccess("Pesanan Anda berhasil dibuat!");
      clearCart();
      setOrderPlaced(true);
    }
  };

  if (authLoading) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </PublicLayout>
    );
  }

  if (orderPlaced) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
          <Card>
            <CardContent className="p-10">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold">Pesanan Berhasil Dibuat!</h1>
              <p className="text-muted-foreground mt-2">
                Silakan datang ke toko untuk melakukan pembayaran dan pengambilan barang. Tunjukkan profil Anda kepada kasir.
              </p>
              <div className="mt-6 flex gap-4 justify-center">
                <Button asChild><Link to="/products">Lanjut Belanja</Link></Button>
                <Button asChild variant="outline"><Link to="/member-profile">Lihat Profil</Link></Button>
              </div>
            </CardContent>
          </Card>
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
              <CardHeader><CardTitle>Ringkasan Pesanan</CardTitle></CardHeader>
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
                      <p>Total</p>
                      <p>{formatCurrency(subtotal)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Keranjang Anda kosong.</p>
                    <Button asChild variant="link" className="mt-2"><Link to="/products">Mulai Belanja</Link></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pengambilan</CardTitle>
                <CardDescription>Pesanan ini akan disiapkan untuk Anda ambil di toko.</CardDescription>
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
                  Pembayaran dilakukan secara langsung saat pengambilan barang di toko.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handlePlaceOrder} disabled={isSubmitting || cartItems.length === 0}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Buat Pesanan
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default CheckoutPage;