import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import { format, subDays, endOfDay } from "date-fns";
import { ArrowLeft, Printer, Loader2, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import SalesReportPrint from "@/components/Reports/SalesReportPrint";

export interface SalesTransaction {
  id: string;
  created_at: string;
  transaction_id_display: string;
  customer_name_cache: string;
  total: number;
  sales_transaction_items: {
    quantity: number;
    buy_price_at_sale: number;
  }[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const SalesReportPage = () => {
  const [transactions, setTransactions] = useState<SalesTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const fetchTransactions = async () => {
    if (!date?.from || !date?.to) {
      showError("Harap pilih rentang tanggal yang valid.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('sales_transactions')
      .select('id, created_at, transaction_id_display, customer_name_cache, total, sales_transaction_items(quantity, buy_price_at_sale)')
      .gte('created_at', date.from.toISOString())
      .lte('created_at', endOfDay(date.to).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching sales transactions:", error);
      showError("Gagal memuat data transaksi penjualan.");
      setTransactions([]);
    } else {
      setTransactions(data as SalesTransaction[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalCost = transactions.reduce((sum, t) => {
      const cost = t.sales_transaction_items.reduce((itemSum, item) => itemSum + (item.buy_price_at_sale * item.quantity), 0);
      return sum + cost;
    }, 0);
    const totalProfit = totalRevenue - totalCost;
    return { totalRevenue, totalProfit, totalTransactions: transactions.length };
  }, [transactions]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="print:hidden space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <Button variant="outline" asChild>
              <Link to="/dashboard/reports"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight mt-2">Laporan Penjualan</h1>
            <p className="text-muted-foreground">Lihat riwayat transaksi penjualan berdasarkan periode.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Filter Laporan</CardTitle>
              <div className="flex items-center gap-2">
                <DatePickerWithRange date={date} setDate={setDate} />
                <Button onClick={fetchTransactions} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
                  Filter
                </Button>
                <Button onClick={handlePrint} variant="outline" disabled={transactions.length === 0}>
                  <Printer className="mr-2 h-4 w-4" /> Cetak
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Laba</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                ) : transactions.length > 0 ? (
                  transactions.map((t) => {
                    const cost = t.sales_transaction_items.reduce((sum, item) => sum + (item.buy_price_at_sale * item.quantity), 0);
                    const profit = t.total - cost;
                    return (
                      <TableRow key={t.id}>
                        <TableCell>{format(new Date(t.created_at), 'd MMM yyyy, HH:mm')}</TableCell>
                        <TableCell className="font-mono">{t.transaction_id_display}</TableCell>
                        <TableCell>{t.customer_name_cache || 'Umum'}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(t.total)}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">{formatCurrency(profit)}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow><TableCell colSpan={5} className="text-center h-24">Tidak ada data untuk periode yang dipilih.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Transaksi</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{summary.totalTransactions}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Laba</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalProfit)}</div></CardContent></Card>
        </div>
      </div>
      <div className="hidden print:block">
        <SalesReportPrint data={transactions} range={date} />
      </div>
    </DashboardLayout>
  );
};

export default SalesReportPage;