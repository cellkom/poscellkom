import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Wrench, Receipt, CreditCard, ShoppingCart, Activity, Users, ClipboardList } from "lucide-react";
import { useServiceEntries } from "@/hooks/use-service-entries";
import { useInstallments } from "@/hooks/use-installments";
import { supabase } from "@/integrations/supabase/client";
import { startOfToday, endOfToday } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'lunas':
        case 'selesai':
        case 'sudah diambil':
            return 'default';
        case 'proses':
            return 'secondary';
        case 'cicilan':
            return 'destructive';
        case 'pending':
        default:
            return 'outline';
    }
};

interface ActivityItem {
    id: string;
    transactionNumber: string;
    customer: string;
    type: 'Penjualan' | 'Servis';
    detail: string;
    status: string;
    total: number;
    createdAt: Date;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const { serviceEntries, loading: servicesLoading } = useServiceEntries();
  const { installments, loading: installmentsLoading } = useInstallments();
  
  const [summary, setSummary] = useState({ revenueToday: 0, transactionsToday: 0, visitorsToday: 0, ordersToday: 0 });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const todayStart = startOfToday().toISOString();
    const todayEnd = endOfToday().toISOString();
    const todayDate = new Date().toISOString().split('T')[0];

    const salesTodayPromise = supabase.from('sales_transactions').select('total_amount').gte('created_at', todayStart).lte('created_at', todayEnd);
    const servicesTodayPromise = supabase.from('service_transactions').select('total_amount').gte('created_at', todayStart).lte('created_at', todayEnd);
    const visitorsTodayPromise = supabase.from('daily_visits').select('count').eq('date', todayDate).single();
    const ordersTodayPromise = supabase.from('orders').select('id', { count: 'exact' }).gte('created_at', todayStart).lte('created_at', todayEnd);

    const recentSalesPromise = supabase.from('sales_transactions').select('id, created_at, transaction_id_display, customer_name_cache, total_amount, remaining_amount, sales_transaction_items(products(name))').order('created_at', { ascending: false }).limit(3);
    const recentServicesPromise = supabase.from('service_transactions').select('id, service_entry_id, created_at, customer_name_cache, total_amount, description, service_entries(status)').order('created_at', { ascending: false }).limit(3);

    const [
        salesTodayResult,
        servicesTodayResult,
        visitorsTodayResult,
        ordersTodayResult,
        recentSalesResult,
        recentServicesResult
    ] = await Promise.all([salesTodayPromise, servicesTodayPromise, visitorsTodayPromise, ordersTodayPromise, recentSalesPromise, recentServicesPromise]);

    const totalSalesRevenue = (salesTodayResult.data || []).reduce((sum, s) => sum + s.total_amount, 0);
    const totalServiceRevenue = (servicesTodayResult.data || []).reduce((sum, s) => sum + s.total_amount, 0);
    setSummary({
        revenueToday: totalSalesRevenue + totalServiceRevenue,
        transactionsToday: (salesTodayResult.data?.length || 0) + (servicesTodayResult.data?.length || 0),
        visitorsToday: visitorsTodayResult.data?.count || 0,
        ordersToday: ordersTodayResult.count || 0,
    });

    const mappedSales = (recentSalesResult.data || []).map((s: any) => ({
        id: s.id,
        transactionNumber: s.transaction_id_display,
        customer: s.customer_name_cache || 'Umum',
        type: 'Penjualan' as const,
        detail: s.sales_transaction_items[0]?.products?.name ? `${s.sales_transaction_items[0].products.name}...` : 'Penjualan Barang',
        status: s.remaining_amount > 0 ? 'Cicilan' : 'Lunas',
        total: s.total_amount,
        createdAt: new Date(s.created_at),
    }));

    const mappedServices = (recentServicesResult.data || []).map((s: any) => ({
        id: s.id,
        transactionNumber: `SVC-${s.service_entry_id}`,
        customer: s.customer_name_cache || 'N/A',
        type: 'Servis' as const,
        detail: s.description,
        status: s.service_entries?.status || 'N/A',
        total: s.total_amount,
        createdAt: new Date(s.created_at),
    }));

    const combinedActivities = [...mappedSales, ...mappedServices]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 6);

    setActivities(combinedActivities);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDashboardData();

    if (!user) return;

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_transactions' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_transactions' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_visits' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchDashboardData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData, user]);

  const servicesInProgress = useMemo(() => {
    return serviceEntries.filter(e => e.status === 'Pending' || e.status === 'Proses').length;
  }, [serviceEntries]);

  const totalReceivables = useMemo(() => {
    return installments.filter(i => i.status === 'Belum Lunas').reduce((sum, i) => sum + i.remaining_amount, 0);
  }, [installments]);

  const pageLoading = loading || servicesLoading || installmentsLoading;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pageLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pengunjung Hari Ini</CardTitle>
                <Users className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.visitorsToday} Pengunjung</div>
              </CardContent>
            </Card>
            <Link to="/dashboard/reports/today">
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(summary.revenueToday)}</div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/dashboard/reports/today">
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
                  <Receipt className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.transactionsToday} Transaksi</div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/dashboard/transaction/installments">
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
                  <CreditCard className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalReceivables)}</div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/dashboard/services-in-progress">
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Servis Dalam Proses</CardTitle>
                  <Wrench className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{servicesInProgress} Servis</div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/dashboard/orders">
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pesanan Hari Ini</CardTitle>
                  <ClipboardList className="h-4 w-4 text-cyan-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.ordersToday} Pesanan</div>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>

      {/* Recent Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Transaksi</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageLoading ? (
                <TableRow><TableCell colSpan={6} className="h-48 text-center">Memuat aktivitas terbaru...</TableCell></TableRow>
              ) : activities.length > 0 ? (
                activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-mono">{activity.transactionNumber}</TableCell>
                    <TableCell className="font-medium">{activity.customer}</TableCell>
                    <TableCell>
                      <Badge variant={activity.type === 'Penjualan' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                        {activity.type === 'Penjualan' ? <ShoppingCart className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
                        {activity.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{activity.detail}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(activity.status)}>
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(activity.total)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="h-48 text-center">Tidak ada aktivitas terbaru.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;