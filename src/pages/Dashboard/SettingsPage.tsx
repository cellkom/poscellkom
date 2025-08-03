import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks/use-settings";
import { Loader2, Upload } from "lucide-react";

const SettingsPage = () => {
  const { settings, loading, updateSettings, uploadLogo } = useSettings();
  const [formData, setFormData] = useState({ appName: '', appDescription: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        appName: settings.appName || '',
        appDescription: settings.appDescription || '',
      });
      setLogoPreview(settings.logoUrl || null);
    }
  }, [settings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await updateSettings(formData);
    setIsSubmitting(false);
  };

  const handleLogoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile) return;
    setIsSubmitting(true);
    await uploadLogo(logoFile);
    setLogoFile(null);
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Aplikasi</h1>
        <p className="text-muted-foreground">Ubah informasi dasar yang ditampilkan di seluruh aplikasi.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Umum</CardTitle>
          <CardDescription>Atur nama dan deskripsi aplikasi Anda.</CardDescription>
        </CardHeader>
        <form onSubmit={handleTextSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">Nama Aplikasi</Label>
              <Input id="appName" value={formData.appName} onChange={(e) => setFormData(p => ({ ...p, appName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appDescription">Deskripsi Singkat</Label>
              <Textarea id="appDescription" value={formData.appDescription} onChange={(e) => setFormData(p => ({ ...p, appDescription: e.target.value }))} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Informasi
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo Aplikasi</CardTitle>
          <CardDescription>Unggah logo baru. Logo akan ditampilkan di header utama.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogoSubmit}>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                {logoPreview ? <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-contain" /> : <span className="text-xs text-muted-foreground">No Logo</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoFile">Pilih file logo (PNG/JPG)</Label>
                <Input id="logoFile" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!logoFile || isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Unggah Logo
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SettingsPage;