import { useState, useEffect } from 'react';
import PublicLayout from "@/components/Layout/PublicLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, Loader2, Camera } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

const UserProfilePage = () => {
  const { profile, session, loading, refreshProfile } = useAuth();
  
  // State for profile form
  const [formData, setFormData] = useState({ full_name: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  // State for password form
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({ full_name: profile.full_name || '' });
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

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setIsProfileSubmitting(true);

    let avatarUrl = profile?.avatar_url;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `public/${session.user.id}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, imageFile, { upsert: true });

      if (uploadError) {
        showError(`Gagal mengunggah foto: ${uploadError.message}`);
        setIsProfileSubmitting(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      avatarUrl = `${publicUrl}?t=${new Date().getTime()}`; // Add timestamp to bust cache
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        full_name: formData.full_name,
        avatar_url: avatarUrl,
      })
      .eq('id', session.user.id);

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

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto mt-2" />
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="w-full space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  if (!profile || !session) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8 md:py-12 text-center">
          <p>Profil tidak ditemukan. Silakan login kembali.</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Profil Saya</CardTitle>
            <CardDescription>Ubah informasi akun Anda sebagai staf.</CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileSave}>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={imagePreview || ''} alt={profile.full_name || ''} />
                    <AvatarFallback className="text-3xl">
                      {profile.full_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button asChild size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                    <Label htmlFor="picture" className="cursor-pointer">
                      <Camera className="h-4 w-4" />
                      <Input id="picture" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </Label>
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input id="fullName" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={session.user.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={profile.role || ''} disabled />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isProfileSubmitting}>
                {isProfileSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan Profil
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Ubah Password</CardTitle>
            <CardDescription>Masukkan password baru Anda di bawah ini.</CardDescription>
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
              <Button type="submit" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Password Baru
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default UserProfilePage;