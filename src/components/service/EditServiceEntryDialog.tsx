import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useServiceEntries, ServiceEntryWithCustomer } from "@/hooks/use-service-entries";
import { useCustomers, Customer } from "@/hooks/use-customers";
import { showError } from "@/utils/toast";

interface EditServiceEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  entry: ServiceEntryWithCustomer | null;
}

export const EditServiceEntryDialog = ({ open, onOpenChange, onSuccess, entry }: EditServiceEntryDialogProps) => {
  const { updateServiceEntry } = useServiceEntries();
  const { customers, loading: customersLoading } = useCustomers();
  const [formData, setFormData] = useState<ServiceEntryWithCustomer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (entry) {
      setFormData({ ...entry });
    } else {
      setFormData(null);
    }
  }, [entry]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev!, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, date: (date || new Date()).toISOString() }));
  };

  const handleInfoDateChange = (date: Date | undefined) => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, info_date: date ? date.toISOString() : null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !formData.customer_id || !formData.device_type || !formData.damage_type || !formData.description) {
      showError("Harap isi semua field yang wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const updatedEntry = {
      customer_id: formData.customer_id,
      category: formData.category || null,
      device_type: formData.device_type,
      damage_type: formData.damage_type,
      description: formData.description,
      status: formData.status,
      date: formData.date,
      service_info: formData.service_info || null,
      info_date: formData.info_date,
    };

    const success = await updateServiceEntry(formData.id, updatedEntry);

    setIsSubmitting(false);
    if (success) {
      onSuccess();
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Data Servis</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer_id" className="text-right">Pelanggan</Label>
              <Select value={formData.customer_id} onValueChange={(value) => handleSelectChange('customer_id', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Pelanggan" />
                </SelectTrigger>
                <SelectContent>
                  {customersLoading ? (
                    <div className="p-4 text-center text-sm">Memuat pelanggan...</div>
                  ) : (
                    customers.map((customer: Customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} ({customer.phone || 'No HP'})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Tanggal Masuk</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !formData.date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(new Date(formData.date), "PPP") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={new Date(formData.date)} onSelect={handleDateChange} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Kategori</Label>
              <Select value={formData.category || ''} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Handphone">Handphone</SelectItem>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Komputer">Komputer</SelectItem>
                  <SelectItem value="Printer">Printer</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="device_type" className="text-right">Tipe Perangkat</Label>
              <Input id="device_type" name="device_type" value={formData.device_type} onChange={handleChange} className="col-span-3" placeholder="Contoh: iPhone 12, Asus ROG" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="damage_type" className="text-right">Jenis Kerusakan</Label>
              <Input id="damage_type" name="damage_type" value={formData.damage_type} onChange={handleChange} className="col-span-3" placeholder="Contoh: LCD Pecah, Mati Total" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Deskripsi</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="col-span-3" placeholder="Detail keluhan pelanggan" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Proses">Proses</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                  <SelectItem value="Sudah Diambil">Sudah Diambil</SelectItem>
                  <SelectItem value="Gagal/Cancel">Gagal/Cancel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="service_info" className="text-right">Info Status</Label>
              <Input id="service_info" name="service_info" value={formData.service_info || ''} onChange={handleChange} className="col-span-3" placeholder="Contoh: Menunggu sparepart" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="info_date" className="text-right">Tanggal Info</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !formData.info_date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.info_date ? format(new Date(formData.info_date), "PPP") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.info_date ? new Date(formData.info_date) : undefined} onSelect={handleInfoDateChange} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};