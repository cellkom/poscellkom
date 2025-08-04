import { useState, useEffect } from 'react';
import PublicLayout from "@/components/Layout/PublicLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Mail, Phone, HomeIcon, Camera, Shield } from "lucide-react";
import { showSuccess, showError } from '@/utils/toast';
import { Link } from 'react-router-dom';

const MemberProfilePage = () => {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  
  // State for profile form
  const [formData, setFormData] = useState({ phone: '', address: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  // State for password form
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({ 
        phone: profile.phone || '',
        address: profile.address || '' 
      });
      setImagePreview(profile.avatar_url || null);
    }
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async () => {
    if (!user) return;
    setIsProfileSubmitting(true);

    let avatarUrl = profile?.avatar_url;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `public/${user.id}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, imageFile, { upsert: true });

      if (uploadError) {
        showError(`Gagal mengunggah foto: ${uploadError.message}`);
        setIsProfileSubmitting(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      avatarUrl = `${publicUrl}?t=${new Date().getTime()}`;
    }

    const { error: updateError } = await supabase
      .from('members')
      .update({
        phone: formData.phone,
        address: formData.address,
        avatar_url: avatarUrl,
      })
      .eq('id', user.id);

    if (updateError) {
      showError(`Gagal memperbarui profil: ${updateError.message}`);
    } else {
      showSuccess("Profil berhasil diperbarui!");
      await refreshProfile();
    }
    setIsProfileSubmitting(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      showError("Harap isi kedua kolom password.");
      return;
    }
    if (password !== confirmPassword) {
      showError("Password tidak cocok.");
      return;
    }
    if (password.length < 6) {
      showError("Password minimal harus 6 karakter.");
      return;
    }

    setIsPasswordSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: password });
    setIsPasswordSubmitting(false);

    if (error) {
      showError(`Gagal mengubah password: ${error.message}`);
    } else {
      showSuccess("Password berhasil diubah!");
      setPassword('');
      setConfirmPassword('');
    }
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
      <div className="container mx-auto px-4 md:px-6 py-12 space-y-8">
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
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
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
            <Button onClick={handleProfileSave} disabled={isProfileSubmitting} className="w-full">
              {isProfileSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan Profil
            </Button>
          </CardFooter>
        </Card>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Shield className="h-5 w-5" /> Keamanan Akun</CardTitle>
            <CardDescription>Ubah password Anda secara berkala untuk menjaga keamanan.</CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPasswordSubmitting} className="w-full">
                {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ubah Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default MemberProfilePage;