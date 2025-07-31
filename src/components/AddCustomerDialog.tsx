import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomers, Customer } from '@/hooks/use-customers';
import { Loader2 } from 'lucide-react';
import { showError } from '@/utils/toast';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded: (newCustomer: Customer) => void;
}

export const AddCustomerDialog = ({ open, onOpenChange, onCustomerAdded }: AddCustomerDialogProps) => {
  const { addCustomer } = useCustomers();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setName('');
    setPhone('');
    setAddress('');
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleReset();
    }
    onOpenChange(isOpen);
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      showError("Nama pelanggan tidak boleh kosong.");
      return;
    }
    setIsSubmitting(true);
    const newCustomer = await addCustomer({ name, phone: phone || null, address: address || null });
    setIsSubmitting(false);
    if (newCustomer) {
      onCustomerAdded(newCustomer);
      onOpenChange(false); // Close dialog
      handleReset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail pelanggan baru. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="Nama lengkap pelanggan" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              No. HP
            </Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" placeholder="0812..." />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Alamat
            </Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="col-span-3" placeholder="Alamat pelanggan" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !name}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Simpan Pelanggan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};