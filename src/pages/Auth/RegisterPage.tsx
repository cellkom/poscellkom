import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';
import PublicLayout from '@/components/Layout/PublicLayout';
import logoSrc from '/logo.png';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password || !fullName) {
      showError("Email, password, dan nama lengkap wajib diisi.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      showError("Password minimal harus 6 karakter.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
          address: address || null,
          is_member: true, // This flag is used by the Supabase trigger to set the role
        },
      },
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
      navigate('/member-login'); // Redirect to member login after successful registration
    }
    setLoading(false);
  };

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link to="/" className="inline-block">
              <img src={logoSrc} alt="Cellkom.Store Logo" className="h-20 w-auto mx-auto" />
            </Link>
            <CardTitle className="text-2xl font-bold font-poppins mt-2">
              <span className="text-primary">Cellkom</span>
              <span className="font-semibold text-muted-foreground">.Store</span>
            </CardTitle>
            <CardDescription>Daftar Akun Member Baru</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input id="fullName" placeholder="Nama Lengkap Anda" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@anda.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Minimal 6 karakter" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor HP (Opsional)</Label>
                <Input id="phone" placeholder="0812..." value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat (Opsional)</Label>
                <Input id="address" placeholder="Alamat lengkap Anda" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Daftar Sekarang
              </Button>
            </form>
            <div className="text-center mt-4 text-sm">
              Sudah punya akun?{' '}
              <Link to="/member-login" className="text-primary hover:underline">
                Masuk di sini
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default RegisterPage;