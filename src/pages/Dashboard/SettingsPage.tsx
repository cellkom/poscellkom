import { useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const SettingsPage = () => {
  // Data ini akan diambil dari database pada implementasi nyata
  const [settings, setSettings] = useState({
    businessName: "CELLKOM",
    address: "Jl. Raya Jember No. 123, Banyuwangi",
    phone: "081234567890",
    email: "support@cellkom.com",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    // Di sini kita akan memanggil API untuk menyimpan perubahan
    console.log("Menyimpan pengaturan:", settings);
    toast({
      title: "Pengaturan Disimpan",
      description: "Informasi bisnis Anda telah berhasil diperbarui.",
      variant: "default",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-muted-foreground">
            Kelola informasi bisnis dan preferensi aplikasi Anda.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Bisnis</CardTitle>
            <CardDescription>
              Perbarui detail bisnis Anda yang akan ditampilkan di seluruh aplikasi dan pada struk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nama Bisnis</Label>
                <Input 
                  id="businessName" 
                  name="businessName"
                  value={settings.businessName}
                  onChange={handleInputChange}
                  placeholder="Contoh: CELLKOM" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo Bisnis</Label>
                <Input id="logo" type="file" className="cursor-pointer" />
                <p className="text-xs text-muted-foreground">Unggah file gambar (PNG, JPG). Ukuran maks 2MB.</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea 
                id="address" 
                name="address"
                value={settings.address}
                onChange={handleInputChange}
                placeholder="Masukkan alamat lengkap bisnis Anda" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  value={settings.phone}
                  onChange={handleInputChange}
                  placeholder="Contoh: 08123456789" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={handleInputChange}
                  placeholder="Contoh: kontak@cellkom.com" 
                />
              </div>
            </div>
          </CardContent>
          <div className="p-6 pt-0 flex justify-end">
            <Button onClick={handleSaveChanges}>Simpan Perubahan</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;