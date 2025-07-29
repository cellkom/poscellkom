import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar as CalendarIcon, Printer, Wrench, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface ServicePartUsed {
  quantity: number;
  products: {
    name: string;
    buy_price: number;
  };
}

interface ServiceTransaction {
  id: string;
  created_at: string;
  service_entry_id: number;
  customer_name_cache: string;
  description: string;
  total_amount: number;
  service_parts_used: ServicePartUsed[];
}

const ServiceReportPage = () => {
  const [serviceData, setServiceData] = useState<ServiceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchServiceData = async () => {
      if (!dateRange?.from || !dateRange?.to) return;
      setLoading(true);

      const from = startOfDay(dateRange.from);
      const to = endOfDay(dateRange.to);

      const { data, error } = await supabase
        .from('service_transactions')
        .select(`
          id,
          created_at,
          service_entry_id,
          customer_name_cache,
          description,
          total_amount,
          service_parts_used (
            quantity,
            products ( name, buy_price )
          )
        `)
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching service data:", error);
        setServiceData([]);
      } else {
        setServiceData(data as ServiceTransaction[]);
      }
      setLoading(false);
    };

    fetchServiceData();
  }, [dateRange]);

  const calculateProfit = (service: ServiceTransaction) => {
    const partsCost = service.service_parts_used.reduce((sum, part) => {
      return sum + (part.products.buy_price * part.quantity);
    }, 0);
    return service.total_amount - partsCost;
  };

  const summary = useMemo(() => {
    return serviceData.reduce((acc, service) => {
      acc.totalTransactions += 1;
      acc.totalRevenue += service.total_amount;
      acc.totalProfit += calculateProfit(service);
      return acc;
    }, { totalTransactions: 0, totalRevenue: 0, totalProfit: 0 });
  }, [serviceData]);

  const handlePrint = () => window.print();

  return (
    <DashboardLayout>
      <div className="space-y-6" ref={printRef}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div>
            <Button variant="outline" asChild>
              <Link to="/dashboard/reports"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Laporan</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight mt-2">Laporan Jasa Service</h1>
            <p className="text-muted-foreground">Analisis pendapatan dan laba dari layanan perbaikan.</p>
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
                  {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>) : (format(dateRange.from, "LLL dd, y"))) : (<span>Pilih tanggal</span>)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
              </PopoverContent>
            </Popover>
          </CardContent>
          <CardContent className="hidden print:block text-center mb-4">
            <h1 className="text-2xl font-bold">Laporan Jasa Service</h1>
            <p>Periode: {dateRange?.from && format(dateRange.from, "d MMMM yyyy", { locale: id })} - {dateRange?.to && format(dateRange.to, "d MMMM yyyy", { locale: id })}</p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Service Selesai</CardTitle><Wrench className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{summary.totalTransactions}</div><p className="text-xs text-muted-foreground">Transaksi Service</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div><p className="text-xs text-muted-foreground">Dari Jasa & Sparepart</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Laba</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalProfit)}</div><p className="text-xs text-muted-foreground">Keuntungan Bersih</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Detail Transaksi Service</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>No. Service</TableHead><TableHead>Pelanggan</TableHead><TableHead>Deskripsi</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Laba</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? (<TableRow><TableCell colSpan={6} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>) : serviceData.length > 0 ? serviceData.map((service) => (<TableRow key={service.id}><TableCell>{format(new Date(service.created_at), "dd/MM/yy")}</TableCell><TableCell className="font-mono">SVC-{service.service_entry_id}</TableCell><TableCell>{service.customer_name_cache}</TableCell><TableCell>{service.description}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(service.total_amount)}</TableCell><TableCell className="text-right text-green-600">{formatCurrency(calculateProfit(service))}</TableCell></TableRow>)) : (<TableRow><TableCell colSpan={6} className="text-center h-24">Tidak ada data untuk periode ini.</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ServiceReportPage;