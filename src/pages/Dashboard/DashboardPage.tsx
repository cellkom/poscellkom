import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Wrench, Receipt, CreditCard, ArrowUp } from "lucide-react";

// Mock data for dashboard summary
const summaryData = {
  revenueToday: 1850000,
  transactionsToday: 25,
  totalReceivables: 12500000,
  servicesInProgress: 8,
};

// Mock data for recent activities (sales and services)
const recentActivities = [
  { id: 'TRX001', customer: 'Budi Santoso', type: 'Penjualan', detail: 'iPhone 13 Pro', status: 'Lunas', total: 15000000 },
  { id: 'SRV005', customer: 'Ani Wijaya', type: 'Servis', detail: 'Ganti Baterai Samsung S21', status: 'Dikerjakan', total: 450000 },
  { id: 'TRX002', customer: 'Citra Lestari', type: 'Penjualan', detail: 'Charger Anker 65W', status: 'Lunas', total: 350000 },
  { id: 'SRV006', customer: 'Doni Firmansyah', type: 'Servis', detail: 'Perbaikan LCD Xiaomi Note 10', status: 'Menunggu Sparepart', total: 750000 },
  { id: 'TRX003', customer: 'Eka Putri', type: 'Penjualan', detail: 'Headset Bluetooth', status: 'Cicilan', total: 600000 },
  { id: 'SRV007', customer: 'Fahmi Rizal', type: 'Servis', detail: 'Update Software Laptop', status: 'Selesai', total: 150000 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summaryData.revenueToday)}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                +15% dari kemarin
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.transactionsToday} Transaksi</div>
              <p className="text-xs text-muted-foreground">+5 dari kemarin</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summaryData.totalReceivables)}</div>
              <p className="text-xs text-muted-foreground">dari 15 pelanggan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servis Dalam Proses</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.servicesInProgress} Servis</div>
              <p className="text-xs text-muted-foreground">3 servis baru hari ini</p>
            </CardContent>
          </Card>
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
                {recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.customer}</TableCell>
                    <TableCell>
                      <Badge variant={activity.type === 'Penjualan' ? 'secondary' : 'outline'} className={activity.type === 'Penjualan' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                        {activity.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{activity.detail}</TableCell>
                    <TableCell>
                      <Badge variant={
                        activity.status === 'Lunas' || activity.status === 'Selesai' ? 'default' :
                        activity.status === 'Dikerjakan' ? 'secondary' :
                        activity.status === 'Cicilan' ? 'destructive' : 'outline'
                      }>
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(activity.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;