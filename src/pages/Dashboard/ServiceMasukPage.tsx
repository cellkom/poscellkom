import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useServiceEntries } from "@/hooks/useServiceEntries";
import { Eye, Printer, Trash2 } from "lucide-react";
import { useState } from "react";
import ReceiptModal from "@/components/modals/ReceiptModal";
import { ServiceEntry } from "@/types";
import { supabase } from "@/integrations/supabase";
import toast from "react-hot-toast";
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

type Status = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

const getStatusBadgeVariant = (status: Status) => {
  switch (status) {
    case 'Pending':
      return 'secondary';
    case 'In Progress':
      return 'default';
    case 'Completed':
      return 'success';
    case 'Cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const ServiceMasukPage = () => {
  const { serviceEntries, isLoading, error, refetch } = useServiceEntries();
  const [selectedEntry, setSelectedEntry] = useState<ServiceEntry | null>(null);
  const [isReceiptModalOpen, setReceiptModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<ServiceEntry | null>(null);

  const handleViewReceipt = (entry: ServiceEntry) => {
    setSelectedEntry(entry);
    setReceiptModalOpen(true);
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;

    const { error } = await supabase
      .from('service_entries')
      .delete()
      .eq('id', entryToDelete.id);

    if (error) {
      toast.error(`Gagal menghapus data: ${error.message}`);
    } else {
      toast.success('Data berhasil dihapus.');
      refetch();
      setEntryToDelete(null);
    }
  };

  const handleServiceInfoChange = async (id: any, service_info: string) => {
    const { error } = await supabase
      .from('service_entries')
      .update({ service_info })
      .eq('id', id);

    if (error) {
      toast.error(`Gagal memperbarui status: ${error.message}`);
    } else {
      toast.success('Status berhasil diperbarui.');
      refetch();
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;

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
                <TableHead>Tanggal</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Info Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.id}</TableCell>
                  <TableCell>{entry.customers?.name || 'N/A'}</TableCell>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.device_type}</TableCell>
                  <TableCell><Badge variant={getStatusBadgeVariant(entry.status as Status)}>{entry.status}</Badge></TableCell>
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