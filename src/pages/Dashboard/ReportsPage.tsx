import { useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSalesHistory } from "@/hooks/use-sales-history";
import { useServiceHistory } from "@/hooks/use-service-history";
import { useServiceEntries } from "@/hooks/use-service-entries"; // Updated import
import { useInstallments } from "@/hooks/use-installments";
import { isToday } from "date-fns";
import { Banknote, ShoppingCart, Wrench, Clock, BarChart3, Printer, Calendar as CalendarIcon, ArrowRight } from "lucide-react";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const ReportsPage = () => {
  const salesHistory = useSalesHistory();
  const serviceHistory = useServiceHistory();
  const { serviceEntries } = useServiceEntries(); // Use from hook
  const installments = useInstallments();

  const summaryToday = useMemo(() => {
    const todaySales = salesHistory.filter(s => isToday(s.date));
    const todayServices = serviceHistory.filter(s => isToday(s.date));
    
    const totalSales = todaySales.reduce((sum, s) => sum + s.summary.totalSale, 0);
    const totalServiceRevenue = todayServices.reduce((sum, s) => sum + s.total, 0);
    
    const totalTransactions = todaySales.length + todayServices.length;
    const servicesInProgress = serviceEntries.filter(e => e.status === 'Pending' || e.status === 'Proses').length;
    const activeReceivables = installments.filter(i => i.status === 'Belum Lunas').reduce((sum, i) => sum + i.remainingAmount, 0);

    return {
      totalRevenue: totalSales + totalServiceRevenue,
      totalTransactions,
      servicesInProgress,
      activeReceivables,
    };
  }, [salesHistory, serviceHistory, serviceEntries, installments]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan & Analisis</h1>
          <p className="text-muted-foreground">Ringkasan, analisis, dan ekspor data penjualan serta service.</p>
        </div>

        {/* Ringkasan Hari Ini */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Total Penjualan</CardTitle>
                <Banknote className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{formatCurrency(summaryToday.totalRevenue)}</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Transaksi</CardTitle>
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{summaryToday.totalTransactions}</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Service Proses</CardTitle>
                <Wrench className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{summaryToday.servicesInProgress}</div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-800">Piutang Aktif</CardTitle>
                <Clock className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-900">{formatCurrency(summaryToday.activeReceivables)}</div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Fitur Laporan */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Fitur Laporan</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full"><ShoppingCart className="h-6 w-6 text-blue-600" /></div>
                  <div>
                    <CardTitle>Laporan Penjualan</CardTitle>
                    <CardDescription>Analisis penjualan sparepart dan aksesoris.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Lihat detail transaksi, produk terlaris, dan ringkasan laba rugi dari penjualan barang.
              </CardContent>
              <div className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link to="/dashboard/reports/sales">Lihat Laporan <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-full"><Wrench className="h-6 w-6 text-purple-600" /></div>
                  <div>
                    <CardTitle>Laporan Service</CardTitle>
                    <CardDescription>Analisis pendapatan dari jasa perbaikan.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Lihat detail transaksi service, pendapatan jasa, dan laba dari sparepart yang digunakan.
              </CardContent>
              <div className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link to="/dashboard/reports/service">Lihat Laporan <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;