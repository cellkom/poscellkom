import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { ShieldCheck, User, Building } from 'lucide-react';
import logoSrc from '/logo.png';
import { Button } from '@/components/ui/button';

const LoginPage = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [authTheme, setAuthTheme] = useState<'light' | 'dark'>('light');
  const [loginType, setLoginType] = useState<'member' | 'staff'>('member');

  useEffect(() => {
    if (session && loginType === 'staff') {
      navigate('/dashboard');
    }
  }, [session, navigate, loginType]);

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

  if (loading && !session) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-gray-800 dark:text-gray-200 text-2xl font-semibold">Loading...</div>
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
          <p className="text-gray-500 dark:text-gray-400 -mt-2">Sistem Manajemen Penjualan & Servis</p>
        </div>

        {/* Login Type Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
          <Button
            onClick={() => setLoginType('member')}
            variant={loginType === 'member' ? 'default' : 'ghost'}
            className="w-full"
          >
            <User className="mr-2 h-4 w-4" />
            Member
          </Button>
          <Button
            onClick={() => setLoginType('staff')}
            variant={loginType === 'staff' ? 'default' : 'ghost'}
            className="w-full"
          >
            <Building className="mr-2 h-4 w-4" />
            Staf
          </Button>
        </div>

        {/* Conditional Content */}
        {loginType === 'staff' ? (
          <>
            <p className="text-center text-sm text-muted-foreground">
              Silakan masuk untuk melanjutkan ke dasbor.
            </p>
            <Auth
              supabaseClient={supabase}
              providers={[]}
              view={'sign_in'}
              showLinks={false}
              theme={authTheme}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Password',
                    button_label: 'Masuk ke Sistem',
                    email_input_placeholder: 'Email Anda',
                    password_input_placeholder: 'Password Anda',
                    loading_button_label: 'Memproses...',
                    invalid_login_credentials: 'Email atau password yang Anda masukkan salah. Silakan coba lagi.',
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
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Masuk sebagai member untuk melihat riwayat transaksi dan status servis Anda.
            </p>
            <Button asChild size="lg" className="w-full">
              <Link to="/member-login">Lanjutkan ke Login Member</Link>
            </Button>
          </div>
        )}

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