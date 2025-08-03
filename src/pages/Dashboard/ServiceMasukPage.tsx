import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useServiceEntries } from "@/hooks/use-service-entries";
import { Eye, Printer, Trash2 } from "lucide-react";
import { useState } from "react";
import ReceiptModal from "@/components/modals/ReceiptModal";
import { ServiceEntryWithCustomer } from "@/hooks/use-service-entries";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type Status = 'Pending' | 'Proses' | 'Selesai' | 'Gagal/Cancel' | 'Sudah Diambil';

const getStatusBadgeVariant = (status: Status) => {
  switch (status) {
    case 'Pending':
      return 'secondary';
    case 'Proses':
      return 'default';
    case 'Selesai':
    case 'Sudah Diambil':
      return 'default';
    case 'Gagal/Cancel':
      return 'destructive';
    default:
      return 'outline';
  }
};

const ServiceMasukPage = () => {
  const { serviceEntries, loading: isLoading, deleteServiceEntry, updateServiceEntry } = useServiceEntries();
  const [selectedEntry, setSelectedEntry] = useState<ServiceEntryWithCustomer | null>(null);
  const [isReceiptModalOpen, setReceiptModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<ServiceEntryWithCustomer | null>(null);

  const handleViewReceipt = (entry: ServiceEntryWithCustomer) => {
    setSelectedEntry(entry);
    setReceiptModalOpen(true);
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;

    const success = await deleteServiceEntry(entryToDelete.id);
    if (success) {
      setEntryToDelete(null);
    }
  };

  const handleServiceInfoChange = async (id: string, service_info: string) => {
    const updated = await updateServiceEntry(id, { service_info });
    // The useServiceEntries hook will automatically refetch and update state
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Service Masuk</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Servis</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Tanggal Masuk</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Info Status</TableHead>
                <TableHead>Tanggal Info</TableHead> {/* New column */}
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>SVC-{entry.id}</TableCell>
                  <TableCell>{entry.customerName || 'N/A'}</TableCell>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.device_type}</TableCell>
                  <TableCell><Badge variant={getStatusBadgeVariant(entry.status)}>{entry.status}</Badge></TableCell>
                  <TableCell>
                    <Select
                      value={entry.service_info || ''}
                      onValueChange={(newValue) => handleServiceInfoChange(entry.id, newValue)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Pilih Info" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sedang proses">Sedang proses</SelectItem>
                        <SelectItem value="Telah Selesai">Telah Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell> {/* New TableCell for Tanggal Info */}
                    {entry.updated_at ? format(new Date(entry.updated_at), 'dd MMM yyyy, HH:mm', { locale: id }) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleViewReceipt(entry)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => window.print()}>
                        <Printer className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setEntryToDelete(entry)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus entri layanan secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setEntryToDelete(null)}>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedEntry && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          entry={selectedEntry}
        />
      )}
    </>
  );
};

export default ServiceMasukPage;