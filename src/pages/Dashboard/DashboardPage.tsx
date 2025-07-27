import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Wrench, ShoppingBag, Archive, ArrowUp, ArrowDown } from "lucide-react";

const salesData = [
  { name: 'Sen', Penjualan: 400000 },
  { name: 'Sel', Penjualan: 300000 },
  { name: 'Rab', Penjualan: 600000 },
  { name: 'Kam', Penjualan: 800000 },
  { name: 'Jum', Penjualan: 500000 },
  { name: 'Sab', Penjualan: 1200000 },
  { name: 'Min', Penjualan: 900000 },
];

const recentSales = [
    { invoice: 'INV001', customer: 'Budi', item: 'LCD iPhone X', total: 'Rp 850.000' },
    { invoice: 'INV002', customer: 'Ani', item: 'Baterai Samsung A50', total: 'Rp 350.000' },
    { invoice: 'INV003', customer: 'Citra', item: 'Charger Type-C', total: 'Rp 150.000' },
    { invoice: 'INV004', customer: 'Dewi', item: 'Tempered Glass', total: 'Rp 50.000' },
];

const serviceStatus = [
    { id: 'SRV001', customer: 'Eko', device: 'Poco X3 Pro', status: 'Selesai' },
    { id: 'SRV002', customer: 'Fahmi', device: 'Laptop Asus', status: 'Dikerjakan' },
    { id: 'SRV003', customer: 'Gilang', device: 'iPhone 11', status: 'Antrian' },
    { id: 'SRV004', customer: 'Hadi', device: 'Realme 5', status: 'Menunggu Sparepart' },
];

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
              <div className="text-2xl font-bold">Rp 1.250.000</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                +20.1% dari kemarin
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servis Masuk</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                +5 dari kemarin
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Barang Terjual</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+35</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                -10.5% dari kemarin
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,245 pcs</div>
              <p className="text-xs text-muted-foreground">
                25 item di bawah stok minimum
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Grafik Penjualan Mingguan</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `Rp${Number(value) / 1000}k`} />
                  <Tooltip formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(value))} />
                  <Legend />
                  <Bar dataKey="Penjualan" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Penjualan Terakhir</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSales.map((sale) => (
                      <TableRow key={sale.invoice}>
                        <TableCell className="font-medium">{sale.invoice}</TableCell>
                        <TableCell>{sale.item}</TableCell>
                        <TableCell className="text-right">{sale.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status Servis Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceStatus.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                            <div className="font-medium">{service.device}</div>
                            <div className="text-xs text-muted-foreground">{service.customer}</div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Badge variant={
                                service.status === 'Selesai' ? 'default' : 
                                service.status === 'Dikerjakan' ? 'secondary' : 'destructive'
                            }>
                                {service.status}
                            </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;