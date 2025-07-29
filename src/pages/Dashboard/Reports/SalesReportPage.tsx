import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Printer, Loader2, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { subDays, format, startOfDay, endOfDay } from "date-fns";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import SalesReportPrintLayout from "@/components/SalesReportPrintLayout";
import { useReactToPrint } from 'react-to-print';
import { showError } from "@/utils/toast";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface SaleTransaction {
  id: string;
  created_at: string;
  transaction_id_display: string;
  customer_name_cache: string;
  total: number;
  profit: number;
}

const SalesReportPage = () => {
  const [transactions, setTransactions] = useState<SaleTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const printComponentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!date?.from) {
        setTransactions([]);
        return;
      };

      setLoading(true);
      
      const fromDate = startOfDay(date.from).toISOString();
      const toDate = date.to ? endOfDay(date.to).toISOString() : endOfDay(date.from).toISOString();

      const { data, error } = await supabase
        .from('sales_transactions')
        .select(`
          id,
          created_at,
          transaction_id_display,
          customer_name_cache,
          total,
          sales_transaction_items (
            quantity,
            buy_price_at_sale
          )
        `)
        .gte('created_at', fromDate)
        .lte('created_at', toDate)
        .order('created_at', { ascending: false });

      if (error) {
        showError("Gagal memuat data penjualan.");
        console.error(error);
        setTransactions([]);
      } else {
        const transactionsWithProfit = data.map(tx => {
          const totalCost = tx.sales_transaction_items.reduce((sum, item) => sum + (item.buy_price_at_sale * item.quantity), 0);
          const profit = tx.total - totalCost;
          return {
            id: tx.id,
            created_at: tx.created_at,
            transaction_id_display: tx.transaction_id_display,
            customer_name_cache: tx.customer_name_cache,
            total: tx.total,
            profit: profit,
          };
        });
        setTransactions(transactionsWithProfit);
      }
      setLoading(false);
    };

    fetchSalesData();
  }, [date]);

  const summary = useMemo(() => {
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
    const totalProfit = transactions.reduce((sum, tx) => sum + tx.profit, 0);
    return {
      totalRevenue,
      totalProfit,
      totalTransactions: transactions.length,
    };
  }, [transactions]);

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `Laporan-Penjualan-${format(new Date(), 'yyyy-MM-dd')}`,
    pageStyle: "@page { size: A4; margin: 20mm; } @media print { body { -webkit-print-color-adjust: exact; } }",
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button variant="outline" asChild>
              <Link to="/dashboard/reports"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Laporan</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight mt-2">Laporan Penjualan</h1>
            <p className="text-muted-foreground">Analisis detail transaksi penjualan dalam periode tertentu.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <DateRangePicker date={date} onDateChange={setDate} />
            <Button onClick={handlePrint} disabled={loading || transactions.length === 0}>
              <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Laba</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalProfit)}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Transaksi</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{summary.totalTransactions}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Detail Transaksi</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>No. Transaksi</TableHead><TableHead>Pelanggan</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Laba</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(new Date(tx.created_at), "yyyy-MM-dd HH:mm")}</TableCell>
                      <TableCell className="font-mono">{tx.transaction_id_display}</TableCell>
                      <TableCell>{tx.customer_name_cache || 'Umum'}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(tx.total)}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{formatCurrency(tx.profit)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} className="text-center h-24">Tidak ada transaksi pada periode yang dipilih.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="hidden print:block">
        {date?.from && (
          <SalesReportPrintLayout ref={printComponentRef} transactions={transactions} summary={summary} dateRange={{ from: date.from, to: date.to || date.from }} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default SalesReportPage;