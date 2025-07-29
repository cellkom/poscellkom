import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useServiceEntries } from "@/hooks/use-service-entries";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Wrench } from "lucide-react";

const ServicesInProgressPage = () => {
  const { serviceEntries, loading } = useServiceEntries();

  const inProgressServices = serviceEntries.filter(
    (entry) => entry.status === 'Pending' || entry.status === 'Proses'
  );

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Laporan Servis Dalam Proses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal Masuk</TableHead>
                <TableHead>Nama Pelanggan</TableHead>
                <TableHead>Tipe Perangkat</TableHead>
                <TableHead>Jenis Kerusakan</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : inProgressServices.length > 0 ? (
                inProgressServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      {format(new Date(service.created_at), "d MMMM yyyy, HH:mm", { locale: id })}
                    </TableCell>
                    <TableCell className="font-medium">{service.customerName}</TableCell>
                    <TableCell>{service.device_type}</TableCell>
                    <TableCell>{service.damage_type}</TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell>
                      <Badge variant={service.status === 'Pending' ? 'outline' : 'secondary'}>
                        {service.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Tidak ada servis yang sedang dalam proses.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ServicesInProgressPage;