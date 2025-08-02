import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Search, Edit, Trash2, Truck } from "lucide-react";
import { useSuppliers, Supplier } from "@/hooks/use-suppliers";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

const SupplierPage = () => {
  const { suppliers, loading } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const handleOpenDialog = (supplier: Supplier | null = null) => {
    setEditingSupplier(supplier);
    setFormData(supplier ? { name: supplier.name, phone: supplier.phone || '', address: supplier.address || '' } : { name: '', phone: '', address: '' });
    setIsDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showError("Nama supplier tidak boleh kosong.");
      return;
    }

    let error;
    if (editingSupplier) {
      // Update existing supplier
      const { error: updateError } = await supabase
        .from('suppliers')
        .update({ name: formData.name, phone: formData.phone, address: formData.address })
        .eq('id', editingSupplier.id);
      error = updateError;
    } else {
      // Add new supplier
      const { error: insertError } = await supabase
        .from('suppliers')
        .insert({ name: formData.name, phone: formData.phone, address: formData.address });
      error = insertError;
    }

    if (error) {
      showError(`Gagal menyimpan data: ${error.message}`);
    } else {
      showSuccess(`Data supplier berhasil ${editingSupplier ? 'diperbarui' : 'ditambahkan'}.`);
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (supplierId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus supplier ini?")) {
      const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);
      if (error) {
        showError(`Gagal menghapus: ${error.message}`);
      } else {
        showSuccess("Supplier berhasil dihapus.");
      }
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.phone && s.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6" />
              <CardTitle className="text-2xl font-bold">Data Supplier</CardTitle>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input placeholder="Cari nama atau telepon..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah Supplier</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Telepon</TableHead><TableHead>Alamat</TableHead><TableHead className="text-center">Aksi</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center h-24">Memuat data supplier...</TableCell></TableRow>
              ) : filteredSuppliers.length > 0 ? (
                filteredSuppliers.map(supplier => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.phone || '-'}</TableCell>
                    <TableCell>{supplier.address || '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(supplier)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(supplier.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center h-24">Tidak ada data supplier.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Tambah Supplier Baru'}</DialogTitle></DialogHeader>
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
    </>
  );
};

export default SupplierPage;