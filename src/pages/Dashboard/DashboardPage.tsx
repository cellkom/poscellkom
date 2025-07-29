import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Wrench, Receipt, CreditCard } from "lucide-react";
import { useServiceEntries } from "@/hooks/use-service-entries";
import { useInstallments } from "@/hooks/use-installments";
import { supabase } from "@/integrations/supabase/client";
import { startOfToday, endOfToday } from "date-fns";

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

interface Activity {
    id: string;
    customer: string;
    type: 'Penjualan' | 'Servis';
    detail: string;
    status: string;
    total: number;
    createdAt: Date;
}

const DashboardPage = () => {
  const { serviceEntries, loading: servicesLoading } = useServiceEntries();
  const { installments, loading: installmentsLoading } = useInstallments();
  
  const [summary, setSummary] = useState({ revenueToday: 0, transactionsToday: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const servicesInProgress = useMemo(() => {
    return serviceEntries.filter(e => e.status === 'Pending' || e.status === 'Proses').length;
  }, [serviceEntries]);

  const totalReceivables = useMemo(() => {
    return installments.filter(i => i.status === 'Belum Lunas').reduce((sum, i) => sum + i.remaining_amount, 0);
  }, [installments]);

  useEffect(() => {
    const fetchDashboardData = async () => {
        setLoading(true);
        const todayStart = startOfToday().toISOString();
        const todayEnd = endOfToday().toISOString();

        // Fetch summary data for today
        const salesTodayPromise = supabase.from('sales_transactions').select('total_amount').gte('created_at', todayStart).lte('created_at', todayEnd);
        const servicesTodayPromise = supabase.from('service_transactions').select('total_amount').gte('created_at', todayStart).lte('created_at', todayEnd);

        // Fetch recent activities
        const recentSalesPromise = supabase.from('sales_transactions').select('id, created_at, customer_name_cache, total_amount, remaining_amount, sales_transaction_items(products(name))').order('created_at', { ascending: false }).limit(3);
        const recentServicesPromise = supabase.from('service_transactions').select('id, created_at, customer_name_cache, total_amount, description, service_entries(status)').order('created_at', { ascending: false }).limit(3);

        const [
            salesTodayResult,
            servicesTodayResult,
            recentSalesResult,
            recentServicesResult
        ] = await Promise.all([salesTodayPromise, servicesTodayPromise, recentSalesPromise, recentServicesPromise]);

        // Process summary
        const totalSalesRevenue = (salesTodayResult.data || []).reduce((sum, s) => sum + s.total_amount, 0);
        const totalServiceRevenue = (servicesTodayResult.data || []).reduce((sum, s) => sum + s.total_amount, 0);
        setSummary({
            revenueToday: totalSalesRevenue + totalServiceRevenue,
            transactionsToday: (salesTodayResult.data?.length || 0) + (servicesTodayResult.data?.length || 0),
        });

        // Process activities
        const mappedSales = (recentSalesResult.data || []).map((s: any) => ({
            id: `TRX-${s.id.substring(0, 6)}`,
            customer: s.customer_name_cache || 'Umum',
            type: 'Penjualan' as const,
            detail: s.sales_transaction_items[0]?.products?.name ? `${s.sales_transaction_items[0].products.name}...` : 'Penjualan Barang',
            status: s.remaining_amount > 0 ? 'Cicilan' : 'Lunas',
            total: s.total_amount,
            createdAt: new Date(s.created_at),
        }));

        const mappedServices = (recentServicesResult.data || []).map((s: any) => ({
            id: `SRV-${s.id}`,
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
    };

    fetchDashboardData();
  }, []);

  const pageLoading = loading || servicesLoading || installmentsLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pageLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(summary.revenueToday)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.transactionsToday} Transaksi</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalReceivables)}</div>
                </CardContent>
              </Card>
              <Link to="/dashboard/reports/services-in-progress">
                <Card className="hover:bg-muted transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Servis Dalam Proses</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{servicesInProgress} Servis</div>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}
        </div>

        {/* Recent Activities Table */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageLoading ? (
                  <TableRow><TableCell colSpan={5} className="h-48 text-center">Memuat aktivitas terbaru...</TableCell></TableRow>
                ) : activities.length > 0 ? (
                  activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.customer}</TableCell>
                      <TableCell>
                        <Badge variant={activity.type === 'Penjualan' ? 'default' : 'secondary'}>
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
                  <TableRow><TableCell colSpan={5} className="h-48 text-center">Tidak ada aktivitas terbaru.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;