import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use the service role client to perform the login and check
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Attempt to sign in the user
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      // This catches wrong password, user not found, etc.
      return new Response(JSON.stringify({ error: 'Email atau password salah.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const user = signInData.user;
    const session = signInData.session;

    if (!user || !session) {
        // Should not happen if signInError is null, but as a safeguard
        return new Response(JSON.stringify({ error: 'Login failed unexpectedly.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // 2. Verify if the user exists in the 'users' (staff) table
    const { data: staffProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      // If there's a DB error, it's a server issue.
      console.error('Profile check database error:', profileError)
      return new Response(JSON.stringify({ error: 'Internal server error during profile check.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. If no profile is found, they are not a staff member.
    if (!staffProfile) {
      // We don't need to sign them out as we are not returning the session.
      // The session created by signInWithPassword is temporary and won't be set on the client.
      return new Response(JSON.stringify({ error: 'Akun staf tidak ditemukan. Silakan login di halaman member jika Anda adalah member.' }), {
        status: 403, // Forbidden
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. If everything is correct, return the session to the client.
    return new Response(JSON.stringify({ session }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Critical error in verify-staff-login function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})