import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Wrench, ShoppingCart, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import logoSrc from '/logo.png';

const LoginPage = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  if (loading && !session) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-gray-800 text-2xl font-semibold">Loading...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <img src={logoSrc} alt="CELLKOM Logo" className="h-24 w-auto mx-auto" />
          <h1 className="text-3xl font-bold text-primary font-poppins">CELLKOM</h1>
          <p className="text-gray-500 -mt-2">Pusat Service HP dan Komputer</p>
          <div className="flex justify-center gap-2 pt-2">
            <Badge variant="secondary"><Wrench className="h-3 w-3 mr-1" /> Service</Badge>
            <Badge variant="default"><ShoppingCart className="h-3 w-3 mr-1" /> Penjualan</Badge>
          </div>
        </div>

        {/* Supabase Auth UI */}
        {!session ? (
          <Auth
            supabaseClient={supabase}
            providers={[]}
            view="sign_in"
            showLinks={false}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Masuk ke Sistem',
                  email_input_placeholder: 'Email Anda',
                  password_input_placeholder: 'Password Anda',
                  loading_button_label: 'Memproses...',
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
                input: 'bg-gray-50 border-gray-300',
              }
            }}
          />
        ) : (
          <p className="text-center">Mengarahkan ke dasbor...</p>
        )}

        {/* Footer */}
        <div className="text-center space-y-3 pt-4 border-t">
            <div className="flex justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Sistem Aman</span>
            </div>
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} CELLKOM - management system</p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;