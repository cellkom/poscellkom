import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/contexts/SettingsContext";
import { useAdvertisements, Advertisement } from "@/hooks/use-advertisements";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SettingsPage = () => {
  const { settings, loading, updateSettings, uploadLogo, uploadAuthorImage } = useSettings();
  const { advertisements, loading: adsLoading, addAdvertisement, deleteAdvertisement } = useAdvertisements();
  
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
  const [isAuthorSubmitting, setIsAuthorSubmitting] = useState(false);
  const [isAdSubmitting, setIsAdSubmitting] = useState(false);

  const [adFile, setAdFile] = useState<File | null>(null);
  const [adAltText, setAdAltText] = useState('');
  const [adLinkUrl, setAdLinkUrl] = useState('');
  const [adPlacement, setAdPlacement] = useState('homepage_carousel');
  const [adPreview, setAdPreview] = useState<string | null>(null);

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

  const handleAdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdFile(file);
      setAdPreview(URL.createObjectURL(file));
    }
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
    setIsAuthorSubmitting(true);
    await uploadAuthorImage(authorImageFile);
    setAuthorImageFile(null);
    setIsAuthorSubmitting(false);
  };

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adFile) return;
    setIsAdSubmitting(true);
    const adData = {
      alt_text: adAltText,
      link_url: adLinkUrl,
      placement: adPlacement,
      is_active: true,
      sort_order: 0,
      image_url: '', // This will be set by the hook
    };
    const success = await addAdvertisement(adData, adFile);
    if (success) {
      setAdFile(null);
      setAdAltText('');
      setAdLinkUrl('');
      setAdPreview(null);
      setAdPlacement('homepage_carousel');
    }
    setIsAdSubmitting(false);
  };

  const adsByPlacement = advertisements.reduce((acc, ad) => {
    (acc[ad.placement] = acc[ad.placement] || []).push(ad);
    return acc;
  }, {} as Record<string, Advertisement[]>);

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
          <CardTitle>Manajemen Iklan</CardTitle>
          <CardDescription>Unggah dan kelola gambar yang akan ditampilkan di berbagai halaman.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Iklan Saat Ini:</h4>
          {adsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            Object.entries(adsByPlacement).map(([placement, ads]) => (
              <div key={placement} className="mt-4">
                <h5 className="font-semibold capitalize text-muted-foreground mb-2">{placement.replace(/_/g, ' ')}</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {ads.map(ad => (
                    <div key={ad.id} className="relative group">
                      <img src={ad.image_url} alt={ad.alt_text || 'Iklan'} className="w-full aspect-video object-cover rounded-md" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteAdvertisement(ad)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          <form onSubmit={handleAdSubmit} className="border-t pt-4 mt-4 space-y-4">
            <h4 className="font-semibold">Tambah Iklan Baru:</h4>
            <div className="space-y-2">
              <Label htmlFor="adPlacement">Penempatan Iklan</Label>
              <Select value={adPlacement} onValueChange={setAdPlacement}>
                <SelectTrigger id="adPlacement">
                  <SelectValue placeholder="Pilih penempatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homepage_carousel">Carousel Halaman Utama</SelectItem>
                  <SelectItem value="products_page_banner">Banner Halaman Produk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adFile">File Gambar Iklan</Label>
              <Input id="adFile" type="file" accept="image/*" onChange={handleAdFileChange} required />
              {adPreview && <img src={adPreview} alt="Ad Preview" className="mt-2 h-32 w-auto object-cover rounded-md border" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="adAltText">Teks Alternatif (untuk SEO)</Label>
              <Input id="adAltText" value={adAltText} onChange={(e) => setAdAltText(e.target.value)} placeholder="Contoh: Promo Servis LCD" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adLinkUrl">URL Tautan (Opsional)</Label>
              <Input id="adLinkUrl" value={adLinkUrl} onChange={(e) => setAdLinkUrl(e.target.value)} placeholder="Contoh: /products" />
            </div>
            <Button type="submit" disabled={!adFile || isAdSubmitting}>
              {isAdSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Unggah Iklan
            </Button>
          </form>
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

        {/* Other cards remain unchanged... */}
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
            <Button type="button" onClick={handleAuthorImageSubmit} disabled={!authorImageFile || isAuthorSubmitting}>
              {isAuthorSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
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
            Simpan Semua Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;