import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { ShoppingCart, ShieldCheck, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoSrc from '/logo.png';

const LoginPage = () => {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [authTheme, setAuthTheme] = useState<'light' | 'dark'>('light');
  const [authMode, setAuthMode] = useState<'member' | 'staff'>('member');

  useEffect(() => {
    // Efek ini menangani pengalihan setelah profil pengguna dimuat
    if (!loading && profile) {
      if (profile.role === 'Admin' || profile.role === 'Kasir') {
        navigate('/dashboard', { replace: true });
      } else if (profile.role === 'Member') {
        navigate('/member/home', { replace: true });
      }
    }
  }, [session, profile, loading, navigate]);

  useEffect(() => {
    const getEffectiveTheme = () => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme;
    };

    setAuthTheme(getEffectiveTheme());

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => setAuthTheme(mediaQuery.matches ? 'dark' : 'light');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  if (loading || session) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-block cursor-pointer group">
            <img src={logoSrc} alt="Cellkom.Store Logo" className="h-24 w-auto mx-auto transition-transform group-hover:scale-105" />
            <h1 className="text-3xl font-bold text-primary font-poppins transition-colors group-hover:text-primary/90">Cellkom.Store</h1>
          </Link>
          <p className="text-gray-500 dark:text-gray-400 -mt-2">Pusat Service HP dan Komputer</p>
          
          {/* Auth Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button 
              variant={authMode === 'member' ? 'default' : 'outline'} 
              onClick={() => setAuthMode('member')}
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" /> Member
            </Button>
            <Button 
              variant={authMode === 'staff' ? 'default' : 'outline'} 
              onClick={() => setAuthMode('staff')}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" /> Penjualan
            </Button>
          </div>
        </div>

        {/* Supabase Auth UI */}
        <>
            <p className="text-center text-sm text-muted-foreground">
              {authMode === 'member' ? 'Daftar atau masuk sebagai Member untuk memesan layanan.' : 'Silakan masuk untuk melanjutkan.'}
            </p>
            <Auth
              supabaseClient={supabase}
              providers={[]}
              view={authMode === 'member' ? 'sign_up' : 'sign_in'}
              showLinks={authMode === 'member'}
              theme={authTheme}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Password',
                    button_label: authMode === 'member' ? 'Masuk Akun Member' : 'Masuk ke Sistem',
                    email_input_placeholder: 'Email Anda',
                    password_input_placeholder: 'Password Anda',
                    loading_button_label: 'Memproses...',
                    link_text: 'Belum punya akun? Daftar',
                  },
                  sign_up: {
                    email_label: 'Email',
                    password_label: 'Password',
                    button_label: 'Daftar Akun Member',
                    email_input_placeholder: 'Email Anda',
                    password_input_placeholder: 'Buat Password Kuat',
                    loading_button_label: 'Memproses...',
                    link_text: 'Sudah punya akun? Masuk',
                    confirmation_text: 'Cek email Anda untuk link konfirmasi.'
                  },
                },
              }}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(0 84.2% 60.2%)',
                      brandAccent: 'hsl(0 74.2% 50.2%)',
                    },
                  },
                },
                className: {
                  input: 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
                  button: 'py-3 text-base',
                  label: 'text-sm font-medium',
                }
              }}
            />
          </>

        {/* Footer */}
        <div className="text-center space-y-3 pt-4 border-t dark:border-gray-700">
            <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Sistem Aman</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">&copy; {new Date().getFullYear()} Cellkom.Store - management system</p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;