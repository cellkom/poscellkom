import { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useSettings } from '@/contexts/SettingsContext';

type AppSettings = {
  [key: string]: string;
};

const SettingsPage = () => {
  const { settings: initialSettings, refreshSettings, loading: settingsLoading } = useSettings();
  const [settings, setSettings] = useState<AppSettings>({});
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!settingsLoading) {
      setSettings(initialSettings);
      if (initialSettings.app_logo_url) {
        setLogoPreview(initialSettings.app_logo_url);
      }
    }
  }, [initialSettings, settingsLoading]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Ukuran file logo tidak boleh lebih dari 2MB.');
        return;
      }
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    let logoUrl = settings.app_logo_url;

    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `public/logo_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('appassets')
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        toast.error('Gagal mengunggah logo: ' + uploadError.message);
        setSaving(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('appassets').getPublicUrl(fileName);
      logoUrl = publicUrl;
    }

    const settingsToSave = Object.entries({ ...settings, app_logo_url: logoUrl })
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => ({ key, value: String(value) }));

    if (settingsToSave.length > 0) {
        const { error: upsertError } = await supabase.from('app_settings').upsert(settingsToSave, { onConflict: 'key' });

        if (upsertError) {
            toast.error('Gagal menyimpan pengaturan: ' + upsertError.message);
        } else {
            toast.success('Pengaturan berhasil disimpan!');
            await refreshSettings();
        }
    } else {
        toast.info("Tidak ada perubahan untuk disimpan.");
    }

    setSaving(false);
  };

  if (settingsLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold">Pengaturan Aplikasi</h1>
            <p className="text-muted-foreground">Kelola pengaturan umum dan tampilan untuk aplikasi Anda.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="contact">Kontak & Media Sosial</TabsTrigger>
          <TabsTrigger value="homepage">Halaman Utama</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Umum</CardTitle>
              <CardDescription>Atur identitas dasar aplikasi Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="app_title">Judul Aplikasi</Label>
                <Input id="app_title" value={settings.app_title || ''} onChange={handleInputChange} placeholder="Contoh: Cellkom.Store" />
              </div>
              <div className="space-y-2">
                <Label>Logo Aplikasi</Label>
                <div className="flex items-center gap-4">
                    {logoPreview && <img src={logoPreview} alt="Logo preview" className="h-16 w-16 object-contain rounded-md bg-muted p-1" />}
                    <Input id="logo-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} className="hidden" />
                    <Button asChild variant="outline">
                        <Label htmlFor="logo-upload" className="cursor-pointer flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            <span>{logoFile ? logoFile.name : 'Pilih File'}</span>
                        </Label>
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">Rekomendasi: format PNG/SVG transparan, maks 2MB.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contact" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kontak & Media Sosial</CardTitle>
              <CardDescription>Bantu pelanggan untuk terhubung dengan Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="app_contact_phone">Nomor Telepon/WhatsApp</Label>
                        <Input id="app_contact_phone" value={settings.app_contact_phone || ''} onChange={handleInputChange} placeholder="0812-3456-7890" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="app_contact_email">Email Kontak</Label>
                        <Input id="app_contact_email" type="email" value={settings.app_contact_email || ''} onChange={handleInputChange} placeholder="kontak@bisnisanda.com" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="app_address">Alamat Toko/Kantor</Label>
                    <Textarea id="app_address" value={settings.app_address || ''} onChange={handleInputChange} placeholder="Jl. Pahlawan No. 123, Kota, Provinsi, Kode Pos" />
                </div>
                <div className="space-y-4 pt-4">
                    <Label>Tautan Media Sosial</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="social_facebook_url" className="text-sm font-normal">Facebook URL</Label>
                            <Input id="social_facebook_url" value={settings.social_facebook_url || ''} onChange={handleInputChange} placeholder="https://facebook.com/username" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="social_instagram_url" className="text-sm font-normal">Instagram URL</Label>
                            <Input id="social_instagram_url" value={settings.social_instagram_url || ''} onChange={handleInputChange} placeholder="https://instagram.com/username" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="social_tiktok_url" className="text-sm font-normal">TikTok URL</Label>
                            <Input id="social_tiktok_url" value={settings.social_tiktok_url || ''} onChange={handleInputChange} placeholder="https://tiktok.com/@username" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="social_twitter_url" className="text-sm font-normal">X/Twitter URL</Label>
                            <Input id="social_twitter_url" value={settings.social_twitter_url || ''} onChange={handleInputChange} placeholder="https://x.com/username" />
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="homepage" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Halaman Utama</CardTitle>
              <CardDescription>Sesuaikan konten yang tampil di halaman depan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="homepage_hero_title">Judul Hero</Label>
                <Input id="homepage_hero_title" value={settings.homepage_hero_title || ''} onChange={handleInputChange} placeholder="Solusi Total untuk Gadget & Komputer Anda" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homepage_hero_subtitle">Subjudul Hero</Label>
                <Textarea id="homepage_hero_subtitle" value={settings.homepage_hero_subtitle || ''} onChange={handleInputChange} placeholder="Dari perbaikan cepat hingga penjualan sparepart berkualitas..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homepage_about_us_content">Konten Tentang Kami</Label>
                <Textarea id="homepage_about_us_content" value={settings.homepage_about_us_content || ''} onChange={handleInputChange} placeholder="Cellkom.Store adalah..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homepage_it_services_title">Judul Jasa IT</Label>
                <Input id="homepage_it_services_title" value={settings.homepage_it_services_title || ''} onChange={handleInputChange} placeholder="Butuh Aplikasi Untuk Bisnis Anda?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homepage_it_services_content">Konten Jasa IT</Label>
                <Textarea id="homepage_it_services_content" value={settings.homepage_it_services_content || ''} onChange={handleInputChange} placeholder="Selain layanan servis, tim IT kami juga siap..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;