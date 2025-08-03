import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, PlusCircle, Search, Edit, Trash2, Printer, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceEntryWithCustomer } from "@/hooks/use-service-entries";
import ReceiptModal from "@/components/modals/ReceiptModal";

type ServiceStatus = 'Pending' | 'Proses' | 'Selesai' | 'Gagal/Cancel' | 'Sudah Diambil';

interface ServiceEntryForm {
  customer_id: string;
  category: string;
  device_type: string;
  damage_type: string;
  description: string;
  status: ServiceStatus;
  service_info: string;
  info_date: string;
}

const ServiceMasukPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ServiceEntryWithCustomer | null>(null);
  const [form, setForm] = useState<ServiceEntryForm>({
    customer_id: "",
    category: "",
    device_type: "",
    damage_type: "",
    description: "",
    status: "Pending",
    service_info: "",
    info_date: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [kasirId, setKasirId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setKasirId(user.id);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase.from("customers").select("id, name");
      if (error) {
        toast.error("Gagal memuat data pelanggan.");
        console.error("Error fetching customers:", error);
      } else {
        setCustomers(data);
      }
    };
    fetchCustomers();
  }, []);

  const { data: serviceEntries, isLoading, error: fetchError } = useQuery<ServiceEntryWithCustomer[]>({
    queryKey: ["serviceEntries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_entries")
        .select(`
          id,
          created_at,
          customer_id,
          kasir_id,
          category,
          device_type,
          damage_type,
          description,
          status,
          date,
          service_info,
          info_date,
          customers ( name, phone )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(entry => ({
        ...entry,
        customerName: entry.customers?.name || 'N/A',
        customerPhone: entry.customers?.phone || 'N/A',
      }));
    },
  });

  const addServiceEntryMutation = useMutation({
    mutationFn: async (newEntry: Omit<ServiceEntryForm, 'info_date'> & { kasir_id: string | null, date: string }) => {
      const { data, error } = await supabase.from("service_entries").insert(newEntry).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceEntries"] });
      toast.success("Data servis berhasil ditambahkan.");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Gagal menambahkan data servis: ${error.message}`);
      console.error("Error adding service entry:", error);
    },
  });

  const updateServiceEntryMutation = useMutation({
    mutationFn: async (updatedEntry: Partial<ServiceEntryForm> & { id: number, kasir_id: string | null }) => {
      const { data, error } = await supabase.from("service_entries").update(updatedEntry).eq("id", updatedEntry.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceEntries"] });
      toast.success("Data servis berhasil diperbarui.");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Gagal memperbarui data servis: ${error.message}`);
      console.error("Error updating service entry:", error);
    },
  });

  const deleteServiceEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("service_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceEntries"] });
      toast.success("Data servis berhasil dihapus.");
    },
    onError: (error) => {
      toast.error(`Gagal menghapus data servis: ${error.message}`);
      console.error("Error deleting service entry:", error);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string, field: keyof ServiceEntryForm) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'status') {
      if (value === 'Selesai') {
        setForm((prev) => ({ ...prev, service_info: 'Telah Selesai', info_date: new Date().toISOString() }));
      } else if (value === 'Proses') {
        setForm((prev) => ({ ...prev, service_info: 'Sedang proses', info_date: new Date().toISOString() }));
      } else if (value === 'Gagal/Cancel') {
        setForm((prev) => ({ ...prev, service_info: 'Gagal', info_date: new Date().toISOString() }));
      } else if (value === 'Pending') {
        setForm((prev) => ({ ...prev, service_info: '', info_date: '' }));
      } else if (value === 'Sudah Diambil') {
        setForm((prev) => ({ ...prev, service_info: 'Sudah Diambil', info_date: new Date().toISOString() }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kasirId) {
      toast.error("ID Kasir tidak ditemukan. Harap login kembali.");
      return;
    }

    const entryToSave = {
      ...form,
      date: new Date().toISOString(), // Set current date for new entries
      kasir_id: kasirId,
    };

    if (isEditing && selectedEntry) {
      await updateServiceEntryMutation.mutateAsync({ id: selectedEntry.id, ...entryToSave });
    } else {
      await addServiceEntryMutation.mutateAsync(entryToSave);
    }
  };

  const handleEdit = (entry: ServiceEntryWithCustomer) => {
    setSelectedEntry(entry);
    setIsEditing(true);
    setForm({
      customer_id: entry.customer_id,
      category: entry.category || "",
      device_type: entry.device_type || "",
      damage_type: entry.damage_type || "",
      description: entry.description || "",
      status: entry.status,
      service_info: entry.service_info || "",
      info_date: entry.info_date || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data servis ini?")) {
      await deleteServiceEntryMutation.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setForm({
      customer_id: "",
      category: "",
      device_type: "",
      damage_type: "",
      description: "",
      status: "Pending",
      service_info: "",
      info_date: "",
    });
    setSelectedEntry(null);
    setIsEditing(false);
  };

  const filteredEntries = serviceEntries?.filter((entry) =>
    entry.id.toString().includes(searchTerm) ||
    entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.device_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.status.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleViewReceipt = (entry: ServiceEntryWithCustomer) => {
    setSelectedEntry(entry);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manajemen Servis Masuk</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Cari servis..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Servis Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Data Servis" : "Tambah Servis Baru"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Sesuaikan detail servis." : "Isi detail servis baru di sini."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer_id" className="text-right">
                  Pelanggan
                </Label>
                <Select
                  onValueChange={(value) => handleSelectChange(value, "customer_id")}
                  value={form.customer_id}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Pelanggan" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Kategori
                </Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Contoh: Handphone, Laptop"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="device_type" className="text-right">
                  Tipe Perangkat
                </Label>
                <Input
                  id="device_type"
                  value={form.device_type}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Contoh: iPhone 12, Asus ROG"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="damage_type" className="text-right">
                  Jenis Kerusakan
                </Label>
                <Input
                  id="damage_type"
                  value={form.damage_type}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Contoh: LCD Pecah, Mati Total"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Deskripsi
                </Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Detail kerusakan atau keluhan pelanggan"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  onValueChange={(value: ServiceStatus) => handleSelectChange(value, "status")}
                  value={form.status}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Proses">Proses</SelectItem>
                    <SelectItem value="Selesai">Selesai</SelectItem>
                    <SelectItem value="Gagal/Cancel">Gagal/Cancel</SelectItem>
                    <SelectItem value="Sudah Diambil">Sudah Diambil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service_info" className="text-right">
                  Info Status
                </Label>
                <Input
                  id="service_info"
                  value={form.service_info}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Informasi tambahan tentang status"
                  disabled={form.status === 'Pending'} // Disable if status is Pending
                />
              </div>
              {form.info_date && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="info_date" className="text-right">
                    Tanggal Info
                  </Label>
                  <Input
                    id="info_date"
                    value={format(new Date(form.info_date), 'yyyy-MM-dd HH:mm')}
                    onChange={handleChange}
                    className="col-span-3"
                    type="datetime-local"
                    disabled // This field is automatically set
                  />
                </div>
              )}
              <DialogFooter>
                <Button type="submit" disabled={addServiceEntryMutation.isPending || updateServiceEntryMutation.isPending}>
                  {addServiceEntryMutation.isPending || updateServiceEntryMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isEditing ? "Simpan Perubahan" : "Tambah Servis"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Memuat data servis...</p>
        </div>
      ) : fetchError ? (
        <div className="text-center text-destructive">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <p>Gagal memuat data servis: {fetchError.message}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Servis</TableHead>
                <TableHead>Tanggal Masuk</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Tipe Perangkat</TableHead>
                <TableHead>Jenis Kerusakan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Info Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Tidak ada data servis ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>SVC-{entry.id}</TableCell>
                    <TableCell>{format(new Date(entry.date), 'd MMM yyyy, HH:mm', { locale: id })}</TableCell>
                    <TableCell>{entry.customerName}</TableCell>
                    <TableCell>{entry.device_type}</TableCell>
                    <TableCell>{entry.damage_type}</TableCell>
                    <TableCell>{entry.status}</TableCell>
                    <TableCell>{entry.service_info || '-'}</TableCell>
                    <TableCell className="text-right flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewReceipt(entry)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {selectedEntry && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          entry={selectedEntry}
        />
      )}
    </div>
  );
};

export default ServiceMasukPage;