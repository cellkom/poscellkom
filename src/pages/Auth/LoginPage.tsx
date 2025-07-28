import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate('/dashboard');
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Loading...</h1>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img src="/logo-cellkom.png" alt="CELLKOM Logo" className="h-16" />
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="light"
          view="sign_in"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Alamat Email',
                password_label: 'Password',
                button_label: 'Masuk ke Sistem',
                link_text: 'Belum punya akun? Daftar',
              },
              sign_up: {
                email_label: 'Alamat Email',
                password_label: 'Password',
                button_label: 'Daftar',
                link_text: 'Sudah punya akun? Masuk',
              },
              forgotten_password: {
                email_label: 'Alamat Email',
                button_label: 'Kirim instruksi reset password',
                link_text: 'Lupa password?',
              }
            },
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;