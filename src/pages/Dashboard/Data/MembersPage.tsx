import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useMembers, MemberProfile } from "@/hooks/use-members";
import { EditMemberDialog } from "@/components/members/EditMemberDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MembersPage = () => {
  const { members, loading, error, deleteMember } = useMembers();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberProfile | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<MemberProfile | null>(null);

  const handleEdit = (member: MemberProfile) => {
    setEditingMember(member);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingMember(null);
  };

  const handleDelete = async () => {
    if (memberToDelete) {
      await deleteMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Manajemen Member</CardTitle>
          <p className="text-muted-foreground">Kelola pengguna yang terdaftar sebagai member.</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Tanggal Bergabung</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24 text-destructive">{error}</TableCell></TableRow>
              ) : (
                members.map(member => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone || '-'}</TableCell>
                    <TableCell>{format(new Date(member.created_at), 'dd MMMM yyyy')}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(member)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setMemberToDelete(member)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini akan menghapus member "{memberToDelete?.full_name}" secara permanen dari sistem.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setMemberToDelete(null)}>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingMember && (
        <EditMemberDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
          member={editingMember}
        />
      )}
    </>
  );
};

export default MembersPage;