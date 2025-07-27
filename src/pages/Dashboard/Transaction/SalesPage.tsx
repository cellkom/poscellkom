import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SalesPage = () => {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Penjualan (Kasir)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Antarmuka kasir yang mudah digunakan untuk penjualan akan dikembangkan di sini. Fitur akan mencakup pemilihan harga, pengurangan stok otomatis, dan pilihan metode pembayaran.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default SalesPage;