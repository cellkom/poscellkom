import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Search, Edit, Trash2, Printer, Eye } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { useCustomers } from "@/hooks/use-customers";
import { ServiceStatus, ServiceEntry } from "@/types/service-types";

const initialServiceState: Omit<ServiceEntry, 'id' | 'date' | 'status'> = {
  customerName: '',
  customerPhone: '',
  device_type: '',
  serial_number: '',
  problem_description: '',
  equipment_received: '',
  estimated_cost: 0,
  technician: '',
};

const ServiceMasukPage = () => {
  const [serviceEntries, setServiceEntries] = useState<ServiceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newServiceEntry, setNewServiceEntry] = useState(initialServiceState);
  const [editingServiceEntry, setEditingServiceEntry] = useState<ServiceEntry | null>(null);
  const [viewingServiceEntry, setViewingServiceEntry] = useState<ServiceEntry | null>(null);
  const { customers, addCustomer } = useCustomers();

  const fetchServiceEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_entries')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      showError("Gagal memuat data servis: " + error.message);
      console.error("Error fetching service entries:", error);
    } else {
      setServiceEntries(data as ServiceEntry[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServiceEntries();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['estimated_cost'].includes(name);
    if (isEditDialogOpen && editingServiceEntry) {
      setEditingServiceEntry({ ...editingServiceEntry, [name]: isNumeric ? Number(value) : value });
    } else {
      setNewServiceEntry({ ...newServiceEntry, [name]: isNumeric ? Number(value) : value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (isEditDialogOpen && editingServiceEntry) {
      setEditingServiceEntry({ ...editingServiceEntry, [name]: value });
    } else {
      setNewServiceEntry({ ...newServiceEntry, [name]: value });
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer) {
      const customerData = {
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
      };
      if (isEditDialogOpen && editingServiceEntry) {
        setEditingServiceEntry({ ...editingServiceEntry, ...customerData });
      } else {
        setNewServiceEntry({ ...newServiceEntry, ...customerData });
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if customer exists, if not, add them
    let customer = customers.find(c => c.name === newServiceEntry.customerName && c.phone === newServiceEntry.customerPhone);
    if (!customer && newServiceEntry.customerName) {
        const newCustomer = await addCustomer({ name: newServiceEntry.customerName, phone: newServiceEntry.customerPhone, address: '' });
        if (newCustomer) {
            customer = newCustomer;
        }
    }

    const { error } = await supabase
      .from('service_entries')
      .insert([{ ...newServiceEntry, status: 'Pending' }]);

    if (error) {
      showError("Gagal menambah data servis: " + error.message);
    } else {
      showSuccess("Data servis berhasil ditambahkan!");
      setIsAddDialogOpen(false);
      setNewServiceEntry(initialServiceState);
      fetchServiceEntries();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServiceEntry) return;

    const { error } = await supabase
      .from('service_entries')
      .update({ ...editingServiceEntry })
      .eq('id', editingServiceEntry.id);

    if (error) {
      showError("Gagal memperbarui data servis: " + error.message);
    } else {
      showSuccess("Data servis berhasil diperbarui!");
      setIsEditDialogOpen(false);
      setEditingServiceEntry(null);
      fetchServiceEntries();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data servis ini?")) {
      const { error } = await supabase
        .from('service_entries')
        .delete()
        .eq('id', id);

      if (error) {
        showError("Gagal menghapus data servis: " + error.message);
      } else {
        showSuccess("Data servis berhasil dihapus.");
        fetchServiceEntries();
      }
    }
  };

  const openEditDialog = (entry: ServiceEntry) => {
    setEditingServiceEntry(entry);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (entry: ServiceEntry) => {
    setViewingServiceEntry(entry);
    setIsViewDialogOpen(true);
  };

  const filteredEntries = serviceEntries.filter(entry =>
    entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.device_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(entry.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'Pending': return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">Pending</span>;
      case 'In Progress': return <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">In Progress</span>;
      case 'Completed': return <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Completed</span>;
      case 'Cancelled': return <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">Cancelled</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">Unknown</span>;
    }
  };

  const renderFormFields = (entry: any, handler: any, customerHandler: any) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="customerName" className="text-right">Pelanggan</Label>
        <div className="col-span-3">
          <Select onValueChange={customerHandler}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih pelanggan yang sudah ada" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input id="customerName" name="customerName" placeholder="Atau masukkan nama baru" value={entry.customerName} onChange={handler} className="mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="customerPhone" className="text-right">No. HP</Label>
        <Input id="customerPhone" name="customerPhone" value={entry.customerPhone} onChange={handler} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="device_type" className="text-right">Tipe Perangkat</Label>
        <Input id="device_type" name="device_type" value={entry.device_type} onChange={handler} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="serial_number" className="text-right">Serial Number</Label>
        <Input id="serial_number" name="serial_number" value={entry.serial_number} onChange={handler} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="problem_description" className="text-right pt-2">Deskripsi Masalah</Label>
        <Textarea id="problem_description" name="problem_description" value={entry.problem_description} onChange={handler} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="equipment_received" className="text-right pt-2">Kelengkapan</Label>
        <Textarea id="equipment_received" name="equipment_received" value={entry.equipment_received} onChange={handler} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="estimated_cost" className="text-right">Estimasi Biaya</Label>
        <Input id="estimated_cost" name="estimated_cost" type="number" value={entry.estimated_cost} onChange={handler} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="technician" className="text-right">Teknisi</Label>
        <Input id="technician" name="technician" value={entry.technician} onChange={handler} className="col-span-3" />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-2xl font-bold">Servis Masuk</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Cari (nama, perangkat, no. servis)..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah Servis</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Tambah Data Servis Baru</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddSubmit}>
                    {renderFormFields(newServiceEntry, handleInputChange, handleCustomerSelect)}
                    <DialogFooter>
                      <Button type="button" variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                      <Button type="submit">Simpan</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Servis</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Perangkat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Estimasi Biaya</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center h-24">Memuat data...</TableCell></TableRow>
                ) : filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono">SVC-{String(entry.id).substring(0, 8)}</TableCell>
                      <TableCell>{format(new Date(entry.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{entry.customerName}</TableCell>
                      <TableCell>{entry.device_type}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.estimated_cost)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openViewDialog(entry)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditDialog(entry)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} className="text-center h-24">Tidak ada data servis.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Data Servis</DialogTitle>
          </DialogHeader>
          {editingServiceEntry && (
            <form onSubmit={handleEditSubmit}>
              {renderFormFields(editingServiceEntry, handleInputChange, handleCustomerSelect)}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select name="status" value={editingServiceEntry.status} onValueChange={(value) => handleSelectChange('status', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
                <Button type="submit">Simpan Perubahan</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Servis - SVC-{viewingServiceEntry?.id.substring(0, 8)}</DialogTitle>
          </DialogHeader>
          {viewingServiceEntry && (
            <div className="py-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{viewingServiceEntry.customerName}</h3>
                <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Cetak Nota</Button>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div><strong>No. HP:</strong> {viewingServiceEntry.customerPhone}</div>
                <div><strong>Tanggal:</strong> {format(new Date(viewingServiceEntry.date), "dd MMMM yyyy")}</div>
                <div><strong>Perangkat:</strong> {viewingServiceEntry.device_type}</div>
                <div><strong>Serial Number:</strong> {viewingServiceEntry.serial_number || '-'}</div>
                <div><strong>Teknisi:</strong> {viewingServiceEntry.technician || '-'}</div>
                <div><strong>Status:</strong> {getStatusBadge(viewingServiceEntry.status)}</div>
              </div>
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold">Deskripsi Masalah:</h4>
                <p className="p-2 bg-gray-50 rounded border">{viewingServiceEntry.problem_description}</p>
              </div>
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold">Kelengkapan:</h4>
                <p className="p-2 bg-gray-50 rounded border">{viewingServiceEntry.equipment_received}</p>
              </div>
              <div className="text-right font-bold text-lg">
                Estimasi Biaya: {formatCurrency(viewingServiceEntry.estimated_cost)}
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsViewDialogOpen(false)}>Tutup</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ServiceMasukPage;