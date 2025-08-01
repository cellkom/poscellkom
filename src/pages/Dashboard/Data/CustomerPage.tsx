import { useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Search, Edit, Trash2, Users } from "lucide-react";
import { useCustomers, Customer } from "@/hooks/use-customers";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

const CustomerPage = () => {
  const { customers, loading } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const handleOpenDialog = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    setFormData(customer ? { name: customer.name, phone: customer.phone || '', address: customer.address || '' } : { name: '', phone: '', address: '' });
    setIsDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showError("Nama pelanggan tidak boleh kosong.");
      return;
    }

    let error;
    if (editingCustomer) {
      // Update existing customer
      const { error: updateError } = await supabase
        .from('customers')
        .update({ name: formData.name, phone: formData.phone, address: formData.address })
        .eq('id', editingCustomer.id);
      error = updateError;
    } else {
      // Add new customer
      const { error: insertError } = await supabase
        .from('customers')
        .insert({ name: formData.name, phone: formData.phone, address: formData.address });
      error = insertError;
    }

    if (error) {
      showError(`Gagal menyimpan data: ${error.message}`);
    } else {
      showSuccess(`Data pelanggan berhasil ${editingCustomer ? 'diperbarui' : 'ditambahkan'}.`);
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pelanggan ini? Aksi ini tidak dapat dibatalkan.")) {
      const { error } = await supabase.from('customers').delete().eq('id', customerId);
      if (error) {
        if (error.message.includes('violates foreign key constraint')) {
            showError("Gagal menghapus: Pelanggan ini memiliki riwayat transaksi (penjualan/servis) dan tidak dapat dihapus.");
        } else {
            showError(`Gagal menghapus: ${error.message}`);
        }
      } else {
        showSuccess("Pelanggan berhasil dihapus.");
      }
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6" />
              <CardTitle className="text-2xl font-bold">Data Pelanggan</CardTitle>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input placeholder="Cari nama atau telepon..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah Pelanggan</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Telepon</TableHead><TableHead>Alamat</TableHead><TableHead className="text-center">Aksi</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center h-24">Memuat data pelanggan...</TableCell></TableRow>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>{customer.address || '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(customer)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(customer.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center h-24">Tidak ada data pelanggan.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nama</Label><Input id="name" name="name" value={formData.name} onChange={handleFormChange} className="col-span-3" /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="phone" className="text-right">Telepon</Label><Input id="phone" name="phone" value={formData.phone} onChange={handleFormChange} className="col-span-3" /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="address" className="text-right">Alamat</Label><Input id="address" name="address" value={formData.address} onChange={handleFormChange} className="col-span-3" /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CustomerPage;