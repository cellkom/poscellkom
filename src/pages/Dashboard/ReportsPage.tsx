import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingCart, Wrench, BarChart3, CheckCircle } from "lucide-react";

const ReportsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h1 className="text-3xl font-bold tracking-tight">Laporan Penjualan & Service</h1>
          <p className="text-muted-foreground">Analisis dan ringkasan data penjualan sparepart dan service</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 pt-6">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Laporan Sparepart</CardTitle>
                  <CardDescription>Analisis penjualan komponen dan aksesoris.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Transaksi penjualan barang</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Analisis produk terlaris</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Ringkasan laba rugi</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Filter berdasarkan periode</span></div>
            </CardContent>
            <div className="p-6 pt-0">
              <Link to="/dashboard/reports/sales">
                <Button className="w-full">Lihat Laporan Sparepart</Button>
              </Link>
            </div>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Wrench className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Laporan Service</CardTitle>
                  <CardDescription>Analisis layanan perbaikan dan jasa service.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-gray-400" /><span>Transaksi jasa service (Segera Hadir)</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-gray-400" /><span>Analisis jenis service (Segera Hadir)</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-gray-400" /><span>Status progress service (Segera Hadir)</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-gray-400" /><span>Sparepart yang digunakan (Segera Hadir)</span></div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button className="w-full" disabled>Lihat Laporan Service</Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;