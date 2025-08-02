import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { showError } from '@/utils/toast';
import { Loader2, ShieldCheck, Star, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import logoSrc from '/logo.png';

const LoginPage = () => {
  const { session, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!authLoading && session && profile) {
      if (profile.role === 'Admin' || profile.role === 'Kasir') {
        navigate('/dashboard');
      } else if (profile.role === 'Member') {
        navigate('/products');
      }
    }
  }, [session, profile, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      showError("Email atau password salah.");
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Verify the user is in the public.users table (i.e., they are a staff member)
      const { count, error: profileError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('id', authData.user.id);

      if (profileError) {
        showError(`Terjadi kesalahan saat verifikasi: ${profileError.message}`);
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (count === 0 || count === null) {
        showError("Akun staf tidak ditemukan. Silakan login di halaman member jika Anda adalah member.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      
      // Let AuthContext handle setting the session and profile.
      // The useEffect will then navigate to the dashboard.
    } else {
      // Should not happen if authError is null, but as a safeguard
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4 p-8">
          <Link to="/">
            <img src={logoSrc} alt="Cellkom.Store Logo" className="h-24 w-auto mx-auto" />
          </Link>
          <CardTitle className="text-3xl font-bold font-poppins">
            <span className="text-primary">Cellkom</span>
            <span className="font-semibold text-muted-foreground">.Store</span>
          </CardTitle>
          <CardDescription className="-mt-2">Pusat Service HP dan Komputer</CardDescription>
          <div className="flex justify-center gap-2 pt-2">
            <Link to="/member-login">
              <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                <Star className="h-3 w-3 mr-1" /> Member
              </Badge>
            </Link>
            <Badge variant="default"><ShoppingCart className="h-3 w-3 mr-1" /> Penjualan</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@anda.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Masuk
            </Button>
          </form>
          <div className="text-center space-y-3 pt-6 mt-6 border-t dark:border-gray-700">
            <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Transaksi Aman</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">&copy; {new Date().getFullYear()} Cellkom.Store</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;