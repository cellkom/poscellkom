import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/contexts/SettingsContext";
import { Loader2, Upload } from "lucide-react";

const SettingsPage = () => {
  const { settings, loading, updateSettings, uploadLogo, uploadAuthorImage, uploadHeroImage } = useSettings();
  const [formData, setFormData] = useState({
    appName: '',
    appDescription: '',
    heroTitle: '',
    heroSubtitle: '',
    aboutUsContent: '',
    contactAddress: '',
    contactEmail: '',
    contactPhone: '',
    socialInstagram: '',
    socialFacebook: '',
    socialYoutube: '',
    socialTiktok: '',
    footerCopyright: '',
    consultationLink: '',
    authorDescription: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [authorImageFile, setAuthorImageFile] = useState<File | null>(null);
  const [authorImagePreview, setAuthorImagePreview] = useState<string | null>(null);
  
  const [isTextSubmitting, setIsTextSubmitting] = useState(false);
  const [isLogoSubmitting, setIsLogoSubmitting] = useState(false);
  const [isAuthorImageSubmitting, setIsAuthorImageSubmitting] = useState(false);
  
  const [heroFiles, setHeroFiles] = useState<(File | null)[]>([null, null, null]);
  const [heroPreviews, setHeroPreviews] = useState<string[]>(['/hero-1.jpg', '/hero-2.jpg', '/hero-3.jpg']);
  const [isHeroSubmitting, setIsHeroSubmitting] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (settings) {
      setFormData({
        appName: settings.appName || '',
        appDescription: settings.appDescription || '',
        heroTitle: settings.heroTitle || '',
        heroSubtitle: settings.heroSubtitle || '',
        aboutUsContent: settings.aboutUsContent || '',
        contactAddress: settings.contactAddress || '',
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        socialInstagram: settings.socialInstagram || '',
        socialFacebook: settings.socialFacebook || '',
        socialYoutube: settings.socialYoutube || '',
        socialTiktok: settings.socialTiktok || '',
        footerCopyright: settings.footerCopyright || '',
        consultationLink: settings.consultationLink || '',
        authorDescription: settings.authorDescription || '',
      });
      setLogoPreview(settings.logoUrl || null);
      setAuthorImagePreview(settings.authorImageUrl || null);
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleAuthorImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAuthorImageFile(file);
      setAuthorImagePreview(URL.createObjectURL(file));
    }
  };

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...heroFiles];
      newFiles[index] = file;
      setHeroFiles(newFiles);

      const newPreviews = [...heroPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setHeroPreviews(newPreviews);
    }
  };

  const handleHeroSubmit = async (index: 0 | 1 | 2) => {
    const file = heroFiles[index];
    if (!file) return;

    const newSubmitting = [...isHeroSubmitting];
    newSubmitting[index] = true;
    setIsHeroSubmitting(newSubmitting);

    const success = await uploadHeroImage(file, (index + 1) as 1 | 2 | 3);

    if (success) {
      const newFiles = [...heroFiles];
      newFiles[index] = null;
      setHeroFiles(newFiles);
    }

    newSubmitting[index] = false;
    setIsHeroSubmitting(newSubmitting);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTextSubmitting(true);
    await updateSettings(formData);
    setIsTextSubmitting(false);
  };

  const handleLogoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile) return;
    setIsLogoSubmitting(true);
    await uploadLogo(logoFile);
    setLogoFile(null);
    setIsLogoSubmitting(false);
  };

  const handleAuthorImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorImageFile) return;
    setIsAuthorImageSubmitting(true);
    await uploadAuthorImage(authorImageFile);
    setAuthorImageFile(null);
    setIsAuthorImageSubmitting(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Aplikasi</h1>
        <p className="text-muted-foreground">Ubah informasi dasar dan konten yang ditampilkan di seluruh aplikasi.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manajemen Gambar Hero</CardTitle>
          <CardDescription>Unggah gambar untuk slider di halaman utama. Gunakan gambar dengan rasio 16:9.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-2">
              <Label>Gambar Hero {index + 1}</Label>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                <img src={heroPreviews[index]} alt={`Hero ${index + 1} Preview`} className="h-full w-full object-cover" />
              </div>
              <Input id={`heroFile${index}`} type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleHeroFileChange(e, index)} />
              <Button type="button" onClick={() => handleHeroSubmit(index as 0 | 1 | 2)} disabled={!heroFiles[index] || isHeroSubmitting[index]} className="w-full">
                {isHeroSubmitting[index] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Unggah Gambar {index + 1}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Umum</CardTitle>
            <CardDescription>Atur nama dan deskripsi aplikasi Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">Nama Aplikasi</Label>
              <Input id="appName" value={formData.appName} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appDescription">Deskripsi Singkat</Label>
              <Textarea id="appDescription" value={formData.appDescription} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Konten Halaman Utama</CardTitle>
            <CardDescription>Atur teks yang muncul di bagian atas (hero) dan bagian "Tentang Kami".</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Judul Hero</Label>
              <Input id="heroTitle" value={formData.heroTitle} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Subjudul Hero</Label>
              <Textarea id="heroSubtitle" value={formData.heroSubtitle} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutUsContent">Konten "Tentang Kami"</Label>
              <Textarea id="aboutUsContent" value={formData.aboutUsContent} onChange={handleInputChange} rows={5} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Kontak & Footer</CardTitle>
            <CardDescription>Atur detail kontak dan teks yang muncul di bagian bawah (footer) halaman.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactAddress">Alamat</Label>
              <Input id="contactAddress" value={formData.contactAddress} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input id="contactEmail" type="email" value={formData.contactEmail} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Telepon</Label>
                <Input id="contactPhone" value={formData.contactPhone} onChange={handleInputChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="socialInstagram">URL Instagram</Label>
              <Input id="socialInstagram" placeholder="https://instagram.com/username" value={formData.socialInstagram} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="socialFacebook">URL Facebook</Label>
              <Input id="socialFacebook" placeholder="https://facebook.com/username" value={formData.socialFacebook} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="socialYoutube">URL YouTube</Label>
              <Input id="socialYoutube" placeholder="https://youtube.com/channel/id" value={formData.socialYoutube} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="socialTiktok">URL TikTok</Label>
              <Input id="socialTiktok" placeholder="https://tiktok.com/@username" value={formData.socialTiktok} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultationLink">Tautan Konsultasi Gratis (Jasa Aplikasi)</Label>
              <Input id="consultationLink" placeholder="https://wa.me/6281234567890" value={formData.consultationLink} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footerCopyright">Teks Copyright Footer</Label>
              <Input id="footerCopyright" value={formData.footerCopyright} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Author</CardTitle>
            <CardDescription>Atur deskripsi dan foto author yang ditampilkan di footer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="authorDescription">Deskripsi Author</Label>
              <Textarea id="authorDescription" value={formData.authorDescription} onChange={handleInputChange} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Foto Author</Label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                  {authorImagePreview ? <img src={authorImagePreview} alt="Author Preview" className="h-full w-full object-cover rounded-md" /> : <span className="text-xs text-muted-foreground">No Image</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authorImageFile">Pilih file foto (PNG/JPG)</Label>
                  <Input id="authorImageFile" type="file" accept="image/png, image/jpeg" onChange={handleAuthorImageFileChange} />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" onClick={handleAuthorImageSubmit} disabled={!authorImageFile || isAuthorImageSubmitting}>
              {isAuthorImageSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Unggah Foto Author
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Logo Aplikasi</CardTitle>
            <CardDescription>Unggah logo baru. Logo akan ditampilkan di header utama.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                {logoPreview ? <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-contain" /> : <span className="text-xs text-muted-foreground">No Logo</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoFile">Pilih file logo (PNG/JPG)</Label>
                <Input id="logoFile" type="file" accept="image/png, image/jpeg" onChange={handleLogoFileChange} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" onClick={handleLogoSubmit} disabled={!logoFile || isLogoSubmitting}>
              {isLogoSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Unggah Logo
            </Button>
          </CardFooter>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isTextSubmitting}>
            {isTextSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Semua Perubahan Teks
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;