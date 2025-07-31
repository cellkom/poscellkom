import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ServiceLandingPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Service</h1>
        <p className="text-muted-foreground">Kelola penerimaan service baru dan proses pembayaran service.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full"><ClipboardList className="h-6 w-6 text-green-600" /></div>
              <div>
                <CardTitle>Penerimaan Service</CardTitle>
                <CardDescription>Catat data service baru yang masuk dari pelanggan.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Modul untuk mencatat data pelanggan, detail perangkat, kerusakan, dan mencetak tanda terima service.
          </CardContent>
          <div className="p-6 pt-0">
            <Button asChild className="w-full">
              <Link to="/dashboard/service/entry">Buka Penerimaan Service <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full"><DollarSign className="h-6 w-6 text-yellow-600" /></div>
              <div>
                <CardTitle>Pembayaran Service</CardTitle>
                <CardDescription>Proses pembayaran untuk service yang telah selesai.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Modul untuk menyelesaikan transaksi service, menambahkan sparepart, dan mencetak nota pembayaran service.
          </CardContent>
          <div className="p-6 pt-0">
            <Button asChild className="w-full">
              <Link to="/dashboard/transaction/service">Buka Kasir Service <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ServiceLandingPage;