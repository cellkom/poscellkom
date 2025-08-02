import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useServiceEntries } from "@/hooks/use-service-entries";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

const ServicesInProgressPage = () => {
  const { serviceEntries, loading } = useServiceEntries();

  const inProgressServices = useMemo(() => {
    return serviceEntries.filter(entry => entry.status === 'Pending' || entry.status === 'Proses');
  }, [serviceEntries]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">Servis Dalam Proses</CardTitle>
          <p className="text-muted-foreground">Daftar semua service yang masih dalam status Pending atau Proses.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dasbor
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Service</TableHead>
              <TableHead>Tanggal Masuk</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Tipe Perangkat</TableHead>
              <TableHead>Jenis Kerusakan</TableHead>
              <TableHead>Deskripsi</TableHead>
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
              inProgressServices.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono">SVC-{entry.id}</TableCell>
                  <TableCell>{format(new Date(entry.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{entry.customerName}</TableCell>
                  <TableCell>{entry.device_type}</TableCell>
                  <TableCell>{entry.damage_type}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Tidak ada service yang sedang dalam proses.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ServicesInProgressPage;