import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingCart, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TransactionPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pilih Jenis Transaksi</h1>
        <p className="text-muted-foreground">Pilih transaksi penjualan untuk sparepart atau transaksi pembayaran service.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full"><ShoppingCart className="h-6 w-6 text-blue-600" /></div>
              <div>
                <CardTitle>Penjualan Barang</CardTitle>
                <CardDescription>Catat penjualan sparepart dan aksesoris.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Gunakan modul ini untuk transaksi jual beli barang, manajemen keranjang, dan pencetakan nota penjualan.
          </CardContent>
          <div className="p-6 pt-0">
            <Button asChild className="w-full">
              <Link to="/dashboard/transaction/sales">Buka Kasir Penjualan <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full"><Wrench className="h-6 w-6 text-purple-600" /></div>
              <div>
                <CardTitle>Pembayaran Service</CardTitle>
                <CardDescription>Proses pembayaran untuk service yang telah selesai.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Gunakan modul ini untuk menyelesaikan transaksi service, menambahkan sparepart, dan mencetak nota service.
          </CardContent>
          <div className="p-6 pt-0">
            <Button asChild className="w-full">
              <Link to="/dashboard/transaction/service">Buka Kasir Service <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TransactionPage;