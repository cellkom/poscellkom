import { useState } from 'react';
import { useAdvertisements } from '@/hooks/use-advertisements';
import { Advertisement } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const placementOptions = [
  { value: 'homepage_carousel', label: 'Carousel Halaman Utama' },
  { value: 'products_page_banner', label: 'Banner Halaman Produk' },
];

const AdForm = ({ ad, onSave, onCancel }: { ad?: Advertisement | null, onSave: (data: any, file: File | null) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    image_url: ad?.image_url || '',
    alt_text: ad?.alt_text || '',
    link_url: ad?.link_url || '',
    is_active: ad?.is_active ?? true,
    sort_order: ad?.sort_order || 0,
    placement: ad?.placement || 'homepage_carousel',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(ad?.image_url || null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const isNumeric = ['sort_order'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
  };
  
  const handleCheckedChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url && !imageFile) {
      toast.error("Gambar iklan wajib diunggah.");
      return;
    }
    onSave(formData, imageFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
      <div>
        <Label htmlFor="placement">Penempatan Iklan</Label>
        <Select
          value={formData.placement}
          onValueChange={(value) => setFormData(prev => ({ ...prev, placement: value }))}
        >
          <SelectTrigger><SelectValue placeholder="Pilih penempatan" /></SelectTrigger>
          <SelectContent>
            {placementOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="image">Gambar Iklan</Label>
        <Input id="image" type="file" accept="image/*" onChange={handleFileChange} />
        {preview && <img src={preview} alt="Preview" className="mt-2 h-32 w-auto object-contain rounded-md border" />}
      </div>
      <div><Label htmlFor="alt_text">Teks Alternatif (untuk SEO)</Label><Input id="alt_text" name="alt_text" value={formData.alt_text} onChange={handleChange} /></div>
      <div><Label htmlFor="link_url">URL Tautan (opsional)</Label><Input id="link_url" name="link_url" value={formData.link_url} onChange={handleChange} placeholder="https://..." /></div>
      <div><Label htmlFor="sort_order">Urutan</Label><Input id="sort_order" name="sort_order" type="number" value={formData.sort_order} onChange={handleChange} /></div>
      <div className="flex items-center space-x-2"><Switch id="is_active" name="is_active" checked={formData.is_active} onCheckedChange={handleCheckedChange} /><Label htmlFor="is_active">Aktifkan Iklan</Label></div>
      <DialogFooter className="pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Batal</Button>
        <Button type="submit">Simpan</Button>
      </DialogFooter>
    </form>
  );
};

export const ManageAdvertisements = () => {
  const { advertisements, loading, addAdvertisement, updateAdvertisement, deleteAdvertisement } = useAdvertisements();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  const handleAdd = async (data: any, file: File | null) => {
    await addAdvertisement(data, file);
    setIsAddDialogOpen(false);
  };

  const handleUpdate = async (data: any, file: File | null) => {
    if (!editingAd) return;
    await updateAdvertisement(editingAd.id, data, file);
    setEditingAd(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus iklan ini?")) {
      await deleteAdvertisement(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Daftar Iklan</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Tambah Iklan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Iklan Baru</DialogTitle></DialogHeader>
            <AdForm onSave={handleAdd} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gambar</TableHead>
              <TableHead>Penempatan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Memuat...</TableCell></TableRow>
            ) : advertisements.map(ad => (
              <TableRow key={ad.id}>
                <TableCell><img src={ad.image_url} alt={ad.alt_text} className="h-16 w-auto object-contain rounded" /></TableCell>
                <TableCell>{placementOptions.find(p => p.value === ad.placement)?.label || ad.placement}</TableCell>
                <TableCell>{ad.is_active ? 'Aktif' : 'Nonaktif'}</TableCell>
                <TableCell>{ad.sort_order}</TableCell>
                <TableCell className="space-x-2">
                  <Dialog open={editingAd?.id === ad.id} onOpenChange={(open) => !open && setEditingAd(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => setEditingAd(ad)}><Edit className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Edit Iklan</DialogTitle></DialogHeader>
                      <AdForm ad={ad} onSave={handleUpdate} onCancel={() => setEditingAd(null)} />
                    </DialogContent>
                  </Dialog>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(ad.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};