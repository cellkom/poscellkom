import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, startOfToday, endOfToday } from "date-fns";
import { ArrowLeft, Loader2, ShoppingCart, Wrench, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface SaleTransaction {
  id: string;
  created_at: string;
  transaction_id_display: string;
  customer_name_cache: string;
  total_amount: number;
}

interface ServiceTransaction {
  id: string;
  created_at: string;
  service_entry_id: number;
  customer_name_cache: string;
  description: string;
  total_amount: number;
}

const TodayReportPage = () => {
  const [salesData, setSalesData] = useState<SaleTransaction[]>([]);
  const [serviceData, setServiceData] = useState<ServiceTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayData = useCallback(async () => {
    setLoading(true);
    const from = startOfToday().toISOString();
    const to = endOfToday().toISOString();

    const salesPromise = supabase
      .from('sales_transactions')
      .select('id, created_at, transaction_id_display, customer_name_cache, total_amount')
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: false });

    const servicePromise = supabase
      .from('service_transactions')
      .select('id, created_at, service_entry_id, customer_name_cache, description, total_amount')
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: false });

    const [salesResult, serviceResult] = await Promise.all([salesPromise, servicePromise]);

    if (salesResult.error) console.error("Error fetching sales data:", salesResult.error);
    else setSalesData(salesResult.data as SaleTransaction[]);

    if (serviceResult.error) console.error("Error fetching service data:", serviceResult.error);
    else setServiceData(serviceResult.data as ServiceTransaction[]);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTodayData();

    const channel = supabase
      .channel('today-report-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_transactions' }, fetchTodayData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_transactions' }, fetchTodayData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTodayData]);

  const summary = useMemo(() => {
    const totalSales = salesData.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalServices = serviceData.reduce((sum, service) => sum + service.total_amount, 0);
    return {
      totalSales,
      totalServices,
      totalRevenue: totalSales + totalServices,
      totalTransactions: salesData.length + serviceData.length,
    };
  }, [salesData, serviceData]);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" asChild>
          <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Dasbor</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mt-2">Laporan Transaksi Hari Ini</h1>
        <p className="text-muted-foreground">Detail semua transaksi penjualan dan service untuk tanggal {format(new Date(), "d MMMM yyyy")}.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Transaksi Penjualan</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{salesData.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Transaksi Service</CardTitle><Wrench className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{serviceData.length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Detail Transaksi Penjualan</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Waktu</TableHead><TableHead>No. Transaksi</TableHead><TableHead>Pelanggan</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? (<TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>) : salesData.length > 0 ? salesData.map((sale) => (<TableRow key={sale.id}><TableCell>{format(new Date(sale.created_at), "HH:mm")}</TableCell><TableCell className="font-mono">{sale.transaction_id_display}</TableCell><TableCell>{sale.customer_name_cache}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(sale.total_amount)}</TableCell></TableRow>)) : (<TableRow><TableCell colSpan={4} className="text-center h-24">Tidak ada transaksi penjualan hari ini.</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Detail Transaksi Service</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Waktu</TableHead><TableHead>No. Service</TableHead><TableHead>Pelanggan</TableHead><TableHead>Deskripsi</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? (<TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>) : serviceData.length > 0 ? serviceData.map((service) => (<TableRow key={service.id}><TableCell>{format(new Date(service.created_at), "HH:mm")}</TableCell><TableCell className="font-mono">SVC-{service.service_entry_id}</TableCell><TableCell>{service.customer_name_cache}</TableCell><TableCell>{service.description}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(service.total_amount)}</TableCell></TableRow>)) : (<TableRow><TableCell colSpan={5} className="text-center h-24">Tidak ada transaksi service hari ini.</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TodayReportPage;