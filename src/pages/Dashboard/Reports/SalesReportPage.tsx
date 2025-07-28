import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useSalesHistory, SaleTransaction } from "@/data/salesHistory";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar as CalendarIcon, Printer, Receipt, DollarSign, TrendingUp, BarChart, CheckCircle, XCircle } from "lucide-react";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const SalesReportPage = () => {
  const salesHistory = useSalesHistory();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const printRef = useRef<HTMLDivElement>(null);

  const filteredSales = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return salesHistory;
    const from = startOfDay(dateRange.from);
    const to = endOfDay(dateRange.to);
    return salesHistory.filter(sale => sale.date >= from && sale.date <= to);
  }, [salesHistory, dateRange]);

  const summary = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
      acc.totalTransactions += 1;
      acc.totalSales += sale.summary.totalSale;
      acc.totalProfit += sale.summary.profit;
      if (sale.paymentMethod === 'tunai') {
        acc.totalTunai += sale.summary.totalSale;
      } else {
        acc.totalCicilan += sale.summary.totalSale;
      }
      return acc;
    }, { totalTransactions: 0, totalSales: 0, totalProfit: 0, totalTunai: 0, totalCicilan: 0 });
  }, [filteredSales]);

  const bestSellingProducts = useMemo(() => {
    const productCount = filteredSales.flatMap(sale => sale.items).reduce((acc, item) => {
      acc[item.name] = (acc[item.name] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredSales]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" ref={printRef}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div>
            <Button variant="outline" asChild>
              <Link to="/dashboard/reports"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Laporan</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight mt-2">Laporan Penjualan Sparepart</h1>
            <p className="text-muted-foreground">Analisis penjualan komponen dan aksesoris HP.</p>
          </div>
          <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Cetak Laporan</Button>
        </div>

        <Card className="print:shadow-none print:border-0">
          <CardHeader className="print:hidden">
            <CardTitle>Filter Periode</CardTitle>
          </CardHeader>
          <CardContent className="print:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date" variant={"outline"} className={cn("w-[300px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
              </PopoverContent>
            </Popover>
          </CardContent>
          <CardContent className="hidden print:block text-center mb-4">
            <h1 className="text-2xl font-bold">Laporan Penjualan Sparepart</h1>
            <p>Periode: {dateRange?.from && format(dateRange.from, "d MMMM yyyy", { locale: id })} - {dateRange?.to && format(dateRange.to, "d MMMM yyyy", { locale: id })}</p>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Transaksi</CardTitle><Receipt className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{summary.totalTransactions}</div><p className="text-xs text-muted-foreground">Transaksi Sparepart</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Penjualan</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</div><p className="text-xs text-muted-foreground">Omzet Kotor</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Laba</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalProfit)}</div><p className="text-xs text-muted-foreground">Keuntungan Bersih</p></CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Breakdown Pembayaran</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /><span>Pembayaran Tunai</span></div>
                <span className="font-bold text-green-700">{formatCurrency(summary.totalTunai)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2"><XCircle className="h-5 w-5 text-yellow-600" /><span>Pembayaran Cicilan</span></div>
                <span className="font-bold text-yellow-700">{formatCurrency(summary.totalCicilan)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Produk Terlaris</CardTitle></CardHeader>
            <CardContent>
              {bestSellingProducts.length > 0 ? (
                <ul className="space-y-2">
                  {bestSellingProducts.map(([name, count]) => (
                    <li key={name} className="flex justify-between items-center text-sm">
                      <span>{name}</span>
                      <span className="font-semibold bg-gray-100 px-2 py-1 rounded">{count} terjual</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Tidak ada data produk.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Detail Transaksi</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Detail Barang</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Laba</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length > 0 ? filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{format(sale.date, "dd/MM/yy")}</TableCell>
                    <TableCell className="font-mono">{sale.id}</TableCell>
                    <TableCell>{sale.customerName}</TableCell>
                    <TableCell>{sale.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(sale.summary.totalSale)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(sale.summary.profit)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={6} className="text-center h-24">Tidak ada data untuk periode ini.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SalesReportPage;