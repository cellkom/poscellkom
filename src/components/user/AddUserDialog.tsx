import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useUsers } from "@/hooks/use-users";
import { showError } from "@/utils/toast";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddUserDialog = ({ open, onOpenChange, onSuccess }: AddUserDialogProps) => {
  const { addUser } = useUsers();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Admin' | 'Kasir'>('Kasir');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('Kasir');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !role) {
      showError("Harap isi semua field yang wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const success = await addUser(email, password, fullName, role);
    setIsSubmitting(false);

    if (success) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah User Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">Nama Lengkap</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="col-span-3" placeholder="Nama lengkap user" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" placeholder="email@example.com" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" placeholder="Minimal 6 karakter" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <Select value={role} onValueChange={(value: 'Admin' | 'Kasir') => setRole(value)}>
                <SelectTrigger className="col-span-3">
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
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Tambah User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};