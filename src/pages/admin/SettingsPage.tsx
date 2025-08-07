import AdminLayout from "@/components/Layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ManageAdvertisements } from "@/components/admin/ManageAdvertisements";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const GeneralSettings = () => {
  const { settings, updateSetting, loading } = useSettings();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updates: { key: string, value: string }[] = [];
    for (const [key, value] of formData.entries()) {
      if (settings[key as keyof typeof settings] !== value) {
        updates.push({ key, value: value as string });
      }
    }
    if (updates.length > 0) {
      updates.forEach(u => updateSetting(u.key, u.value));
      toast.success("Pengaturan berhasil disimpan!");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Umum</CardTitle>
        <CardDescription>Atur informasi dasar dan kontak aplikasi Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="appName">Nama Aplikasi</Label><Input id="appName" name="appName" defaultValue={settings.appName} /></div>
            <div><Label htmlFor="contactEmail">Email Kontak</Label><Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail} /></div>
            <div><Label htmlFor="contactPhone">Telepon Kontak</Label><Input id="contactPhone" name="contactPhone" defaultValue={settings.contactPhone} /></div>
            <div><Label htmlFor="contactAddress">Alamat</Label><Input id="contactAddress" name="contactAddress" defaultValue={settings.contactAddress} /></div>
          </div>
          <div><Label htmlFor="appDescription">Deskripsi Aplikasi</Label><Textarea id="appDescription" name="appDescription" defaultValue={settings.appDescription} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="footerCopyright">Teks Copyright Footer</Label><Input id="footerCopyright" name="footerCopyright" defaultValue={settings.footerCopyright} /></div>
            <div><Label htmlFor="consultationLink">Tautan Konsultasi IT</Label><Input id="consultationLink" name="consultationLink" defaultValue={settings.consultationLink} /></div>
          </div>
          <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ContentSettings = () => {
  const { settings, updateSetting, loading } = useSettings();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updates: { key: string, value: string }[] = [];
    for (const [key, value] of formData.entries()) {
      if (settings[key as keyof typeof settings] !== value) {
        updates.push({ key, value: value as string });
      }
    }
    if (updates.length > 0) {
      updates.forEach(u => updateSetting(u.key, u.value));
      toast.success("Pengaturan berhasil disimpan!");
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Konten & Tampilan</CardTitle>
        <CardDescription>Atur konten yang tampil di halaman utama dan halaman lainnya.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="logoUrl">URL Logo</Label><Input id="logoUrl" name="logoUrl" defaultValue={settings.logoUrl} /></div>
            <div><Label htmlFor="authorImageUrl">URL Foto Author</Label><Input id="authorImageUrl" name="authorImageUrl" defaultValue={settings.authorImageUrl} /></div>
          </div>
          <div><Label htmlFor="heroTitle">Judul Hero</Label><Input id="heroTitle" name="heroTitle" defaultValue={settings.heroTitle} /></div>
          <div><Label htmlFor="heroSubtitle">Subjudul Hero</Label><Textarea id="heroSubtitle" name="heroSubtitle" defaultValue={settings.heroSubtitle} /></div>
          <div><Label htmlFor="aboutUsContent">Konten Tentang Kami</Label><Textarea id="aboutUsContent" name="aboutUsContent" defaultValue={settings.aboutUsContent} /></div>
          <div><Label htmlFor="authorDescription">Deskripsi Author</Label><Textarea id="authorDescription" name="authorDescription" defaultValue={settings.authorDescription} /></div>
          <h4 className="font-semibold pt-4">Media Sosial</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="socialInstagram">Instagram URL</Label><Input id="socialInstagram" name="socialInstagram" defaultValue={settings.socialInstagram} /></div>
            <div><Label htmlFor="socialFacebook">Facebook URL</Label><Input id="socialFacebook" name="socialFacebook" defaultValue={settings.socialFacebook} /></div>
            <div><Label htmlFor="socialYoutube">YouTube URL</Label><Input id="socialYoutube" name="socialYoutube" defaultValue={settings.socialYoutube} /></div>
            <div><Label htmlFor="socialTiktok">TikTok URL</Label><Input id="socialTiktok" name="socialTiktok" defaultValue={settings.socialTiktok} /></div>
          </div>
          <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

const SettingsPage = () => {
  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-4">Pengaturan Aplikasi</h1>
        <Tabs defaultValue="advertisements" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Umum</TabsTrigger>
            <TabsTrigger value="content">Konten & Tampilan</TabsTrigger>
            <TabsTrigger value="advertisements">Iklan</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>
          <TabsContent value="content">
            <ContentSettings />
          </TabsContent>
          <TabsContent value="advertisements">
            <Card>
              <CardHeader>
                <CardTitle>Manajemen Iklan</CardTitle>
                <CardDescription>
                  Atur iklan yang tampil di berbagai halaman pada aplikasi Anda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ManageAdvertisements />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;