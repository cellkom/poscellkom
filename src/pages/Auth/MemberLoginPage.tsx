import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showSuccess, showError } from '@/utils/toast';
import logoSrc from '/logo.png';
import { Loader2, Star, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const MemberLoginPage = () => {
  const { session, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State for sign-in form
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // State for sign-up form
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (authLoading) {
      return; // Tunggu hingga proses pengecekan autentikasi selesai
    }

    if (session && profile) {
      // Pengguna sudah login dan punya profil, arahkan sesuai peran
      if (profile.role === 'Member') {
        navigate('/products');
      } else if (profile.role === 'Admin' || profile.role === 'Kasir') {
        // Staf mendarat di halaman login member, arahkan ke dashboard
        navigate('/dashboard');
      }
    }
    // Jika sesi ada tapi profil belum termuat, jangan lakukan apa-apa.
    // Ini mencegah logout otomatis saat terjadi race condition.
  }, [session, profile, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    });

    if (error) {
      showError("Email atau password salah.");
    }
    // useEffect akan menangani pengalihan setelah login berhasil
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signUpEmail,
      password: signUpPassword,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          address: address,
          is_member: 'true', // Marker for the trigger
        },
      },
    });
    if (error) {
      showError(error.message);
    } else {
      showSuccess('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
    }
    setLoading(false);
  };

  return (
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
          <CardDescription>Akun Member</CardDescription>
          <div className="flex justify-center gap-2 pt-2">
            <Badge variant="default"><Star className="h-3 w-3 mr-1" /> Member</Badge>
            <Link to="/login">
              <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                <ShoppingCart className="h-3 w-3 mr-1" /> Penjualan
              </Badge>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" type="email" placeholder="email@anda.com" required value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" type="password" required value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Masuk
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">Nama Lengkap</Label>
                  <Input id="signup-fullname" placeholder="Nama Lengkap Anda" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="email@anda.com" required value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" placeholder="Buat password" required value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Nomor HP</Label>
                  <Input id="signup-phone" placeholder="0812..." value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-address">Alamat</Label>
                  <Input id="signup-address" placeholder="Alamat lengkap" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Daftar Sekarang
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberLoginPage;