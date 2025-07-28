import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Smartphone, Wrench, ShoppingCart, ShieldCheck, LifeBuoy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <div className="text-white text-2xl font-semibold">Loading...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block bg-blue-600 text-white p-4 rounded-full">
            <Smartphone size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">CELLKOM</h1>
          <p className="text-gray-500">Pusat Service HP dan Komputer</p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Wrench className="h-3 w-3 mr-1" /> Service</Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800"><ShoppingCart className="h-3 w-3 mr-1" /> Penjualan</Badge>
          </div>
        </div>

        {/* Supabase Auth UI */}
        {!session ? (
          <Auth
            supabaseClient={supabase}
            providers={[]}
            view="sign_in"
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
                forgotten_password: {
                    link_text: 'Lupa password?',
                    email_label: 'Alamat Email',
                    button_label: 'Kirim Instruksi Reset',
                    email_input_placeholder: 'Alamat email Anda',
                },
              },
            }}
            appearance={{
              className: {
                container: 'space-y-4',
                button: 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg w-full text-base',
                input: 'bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 text-base',
                label: 'text-sm font-medium text-gray-700',
                anchor: 'text-sm text-blue-600 hover:underline',
                message: 'text-sm text-red-600',
              }
            }}
          />
        ) : (
          <p className="text-center">Mengarahkan ke dasbor...</p>
        )}

        {/* Footer */}
        <div className="text-center space-y-3 pt-4 border-t">
            <div className="flex justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> Sistem Aman</span>
                <span className="flex items-center gap-1.5"><LifeBuoy className="h-4 w-4 text-blue-500" /> 24/7 Support</span>
            </div>
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} CELLKOM - management system</p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;