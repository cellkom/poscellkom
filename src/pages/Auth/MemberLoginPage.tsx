import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import logoSrc from '/logo.png';

const MemberLoginPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [authTheme, setAuthTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (session) {
      navigate('/products');
    }
  }, [session, navigate]);

  useEffect(() => {
    const getEffectiveTheme = () => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme;
    };
    setAuthTheme(getEffectiveTheme());
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 relative">
      <Link to="/" className="absolute top-4 left-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Beranda
      </Link>
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <img src={logoSrc} alt="Cellkom.Store Logo" className="h-20 w-auto mx-auto" />
          <h1 className="text-3xl font-bold text-primary font-poppins">Akun Member</h1>
          <p className="text-gray-500 dark:text-gray-400 -mt-2">Daftar atau masuk untuk mulai berbelanja.</p>
        </div>

        <Auth
          supabaseClient={supabase}
          providers={[]}
          view="sign_in"
          showLinks={true}
          theme={authTheme}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
                button_label: 'Masuk',
                link_text: 'Sudah punya akun? Masuk',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Password',
                button_label: 'Daftar Sekarang',
                link_text: 'Belum punya akun? Daftar',
                email_input_placeholder: 'Email Anda',
                password_input_placeholder: 'Buat Password Anda',
              },
              forgotten_password: {
                email_label: 'Email',
                button_label: 'Kirim instruksi reset password',
                link_text: 'Lupa password?',
              }
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
            }
          }}
        />

        <div className="text-center space-y-3 pt-4 border-t dark:border-gray-700">
          <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Transaksi Aman</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">&copy; {new Date().getFullYear()} Cellkom.Store</p>
        </div>
      </div>
    </div>
  );
};

export default MemberLoginPage;