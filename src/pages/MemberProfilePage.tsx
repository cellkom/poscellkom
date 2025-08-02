import { useState, useEffect } from 'react';
import PublicLayout from "@/components/Layout/PublicLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, User, Mail, Phone, HomeIcon } from "lucide-react";
import { showError } from '@/utils/toast';

interface MemberProfile {
  full_name: string;
  phone: string | null;
  address: string | null;
  email: string | undefined;
}

const MemberProfilePage = () => {
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('full_name, phone, address')
        .eq('id', user.id)
        .single();

      if (error) {
        showError("Gagal memuat profil member.");
        console.error(error);
      } else if (data) {
        setProfile({ ...data, email: user.email });
      }
      setLoading(false);
    };

    fetchMemberProfile();
  }, [user]);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Profil Saya</CardTitle>
            <p className="text-muted-foreground">Detail informasi akun member Anda.</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : profile ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="w-full">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input id="fullName" value={profile.full_name} readOnly disabled />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div className="w-full">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.email} readOnly disabled />
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
                    <Input id="address" value={profile.address || '-'} readOnly disabled />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Profil tidak ditemukan.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default MemberProfilePage;