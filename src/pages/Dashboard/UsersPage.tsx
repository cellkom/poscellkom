import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, User, Shield, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";

interface ManagedUser {
  id: string;
  email: string;
  full_name: string;
  role: 'Admin' | 'Kasir';
  created_at: string;
}

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'Kasir' as 'Admin' | 'Kasir',
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: { action: 'list' },
    });
    if (error) {
      showError(`Gagal memuat pengguna: ${error.message}`);
      console.error(error);
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (user: ManagedUser | null = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        password: '', // Don't show password on edit
        role: user.role,
      });
    } else {
      setFormData({ full_name: '', email: '', password: '', role: 'Kasir' });
    }
    setIsDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (value: 'Admin' | 'Kasir') => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (editingUser) {
      // Update user
      const { error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'update', payload: { id: editingUser.id, role: formData.role, full_name: formData.full_name } },
      });
      if (error) {
        showError(`Gagal memperbarui pengguna: ${error.message}`);
      } else {
        showSuccess("Pengguna berhasil diperbarui.");
        fetchUsers();
        setIsDialogOpen(false);
      }
    } else {
      // Create new user
      if (!formData.password) {
        showError("Password wajib diisi untuk pengguna baru.");
        setIsSubmitting(false);
        return;
      }
      const { error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'create', payload: formData },
      });
      if (error) {
        showError(`Gagal menambah pengguna: ${error.message}`);
      } else {
        showSuccess("Pengguna baru berhasil ditambahkan.");
        fetchUsers();
        setIsDialogOpen(false);
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini? Aksi ini tidak dapat dibatalkan.")) {
      const { error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'delete', payload: { id: userId } },
      });
      if (error) {
        showError(`Gagal menghapus pengguna: ${error.message}`);
      } else {
        showSuccess("Pengguna berhasil dihapus.");
        fetchUsers();
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Manajemen User</CardTitle>
              <p className="text-muted-foreground">Kelola pengguna sistem (Admin & Kasir)</p>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'Admin' ? 'destructive' : 'secondary'}>
                        {user.role === 'Admin' ? <Crown className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(user.created_at), 'dd MMMM yyyy')}</TableCell>
                    <TableCell className="text-center">
                      {user.id === currentUser?.id ? (
                        <span className="text-muted-foreground text-sm italic">Tidak bisa edit diri sendiri</span>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(user.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Tambah User Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nama Lengkap</Label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleFormChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleFormChange} disabled={!!editingUser} />
              </div>
              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" value={formData.password} onChange={handleFormChange} />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kasir">Kasir</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersPage;