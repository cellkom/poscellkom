import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface AppSettings {
  business_name: string;
  address: string;
  logo_url: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>({
    business_name: '',
    address: '',
    logo_url: '',
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile && profile.role !== 'Admin') {
      toast({
        title: 'Akses Ditolak',
        description: 'Anda harus menjadi Admin untuk mengakses halaman ini.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [profile, navigate, toast]);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('app_settings').select('key, value');

    if (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat pengaturan.',
        variant: 'destructive',
      });
    } else {
      const settingsData = data.reduce((acc, { key, value }) => {
        if (key in settings) {
          (acc as any)[key] = value;
        }
        return acc;
      }, { ...settings });
      setSettings(settingsData as AppSettings);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from('app_settings').update({ value }).eq('key', key).select()
    );

    const results = await Promise.all(updates);
    
    const hasError = results.some(res => res.error);

    if (hasError) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan. Pastikan Anda adalah Admin.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sukses',
        description: 'Pengaturan berhasil disimpan.',
      });
      fetchSettings(); // Re-fetch to confirm
    }
    setLoading(false);
  };

  if (!profile || profile.role !== 'Admin') {
    return null; // or a loading/access denied component
  }

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Pengaturan Aplikasi</CardTitle>
          <CardDescription>
            Ubah detail bisnis Anda. Perubahan akan diterapkan di seluruh aplikasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Nama Bisnis</Label>
            <Input
              id="business_name"
              name="business_name"
              value={settings.business_name}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              name="address"
              value={settings.address}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo_url">URL Logo</Label>
            <Input
              id="logo_url"
              name="logo_url"
              value={settings.logo_url}
              onChange={handleInputChange}
              placeholder="Contoh: /logo.png"
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;