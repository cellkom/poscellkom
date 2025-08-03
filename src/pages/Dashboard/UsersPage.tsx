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
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";
import { useUsers, UserProfile } from "@/hooks/use-users"; // Import the new useUsers hook
import { AddUserDialog } from "@/components/user/AddUserDialog.tsx"; // Import AddUserDialog
import { EditUserDialog } from "@/components/user/EditUserDialog.tsx"; // Import EditUserDialog
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

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const { users, loading, error, fetchUsers, deleteUser } = useUsers(); // Use the new hook
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // fetchUsers is already called by the useUsers hook on mount,
  // but we can call it again after successful operations if needed.

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    // fetchUsers is called internally by useUsers after add, so no need to call here.
  };

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingUser(null);
    // fetchUsers is called internally by useUsers after update, so no need to call here.
  };

  const handleDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setUserToDelete(null);
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
            <Button onClick={() => setIsAddDialogOpen(true)}>
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
              ) : error ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24 text-destructive">{error}</TableCell></TableRow>
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
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setUserToDelete(user)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tindakan ini akan menghapus pengguna "{userToDelete?.full_name}" secara permanen.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setUserToDelete(null)}>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleAddSuccess}
      />
      {editingUser && (
        <EditUserDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
          user={editingUser}
        />
      )}
    </>
  );
};

export default UsersPage;