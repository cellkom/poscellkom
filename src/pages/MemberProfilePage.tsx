import { useState, useEffect } from 'react';
import PublicLayout from "@/components/Layout/PublicLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Mail, Phone, HomeIcon, Camera } from "lucide-react";
import { showSuccess, showError } from '@/utils/toast';
import { Link } from 'react-router-dom';

const MemberProfilePage = () => {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({ address: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({ address: profile.address || '' });
    }
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    let avatarUrl = profile?.avatar_url;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `public/${user.id}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, imageFile, { upsert: true });

      if (uploadError) {
        showError(`Gagal mengunggah foto: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      avatarUrl = publicUrl;
    }

    const { error: updateError } = await supabase
      .from('members')
      .update({
        address: formData.address,
        avatar_url: avatarUrl,
      })
      .eq('id', user.id);

    if (updateError) {
      showError(`Gagal memperbarui profil: ${updateError.message}`);
    } else {
      showSuccess("Profil berhasil diperbarui!");
      await refreshProfile(); // Refresh context to update header
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  if (!profile) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold">Profil Tidak Ditemukan</h2>
          <p className="text-muted-foreground mt-2">
            Sepertinya terjadi masalah saat memuat profil Anda. Silakan coba login kembali.
          </p>
          <Button asChild className="mt-6">
            <Link to="/member-login">Kembali ke Halaman Login</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Profil Saya</CardTitle>
            <p className="text-muted-foreground">Kelola informasi akun dan profil Anda.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={imagePreview || profile.avatar_url || ''} alt={profile.full_name} />
                  <AvatarFallback>{profile.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button asChild size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                  <Label htmlFor="picture" className="cursor-pointer">
                    <Camera className="h-4 w-4" />
                    <Input id="picture" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                  </Label>
                </Button>
              </div>
              <h2 className="text-xl font-semibold">{profile.full_name}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="w-full">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile.email || ''} readOnly disabled />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div className="w-full">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input id="phone" value={profile.phone || '-'} readOnly disabled />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <HomeIcon className="h-5 w-5 text-muted-foreground" />
                <div className="w-full">
                  <Label htmlFor="address">Alamat</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default MemberProfilePage;