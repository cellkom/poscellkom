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
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img src="/logo-cellkom.png" alt="CELLKOM Logo" className="h-16" />
        </div>
        {!session ? (
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
                  password_label: 'Kata Sandi',
                  button_label: 'Masuk',
                  email_input_placeholder: 'Alamat email Anda',
                  password_input_placeholder: 'Kata sandi Anda',
                  loading_button_label: 'Sedang memproses...',
                },
                forgotten_password: {
                    link_text: 'Lupa kata sandi?',
                    email_label: 'Alamat Email',
                    button_label: 'Kirim instruksi reset',
                    email_input_placeholder: 'Alamat email Anda',
                },
              },
            }}
          />
        ) : (
          <p>Mengarahkan ke dasbor...</p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;