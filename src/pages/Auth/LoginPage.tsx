import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { ShieldCheck, Star, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import logoSrc from '/logo.png';

const LoginPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [authTheme, setAuthTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <img src={logoSrc} alt="Cellkom.Store Logo" className="h-24 w-auto mx-auto" />
          <h1 className="text-3xl font-bold font-poppins">
            <span className="text-primary">Cellkom</span>
            <span className="font-semibold text-muted-foreground">.Store</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 -mt-2">Pusat Service HP dan Komputer</p>
          <div className="flex justify-center gap-2 pt-2">
            <Link to="/member-login">
              <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                <Star className="h-3 w-3 mr-1" /> Member
              </Badge>
            </Link>
            <Badge variant="default"><ShoppingCart className="h-3 w-3 mr-1" /> Penjualan</Badge>
          </div>
        </div>

        <Auth
          supabaseClient={supabase}
          providers={[]}
          view="sign_in"
          showLinks={false}
          theme={authTheme}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
                button_label: 'Masuk',
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

export default LoginPage;