import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // The OPTIONS method is for CORS preflight requests.
  // I'm updating this to return a 204 No Content status, which is a best practice.
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    // Pengecekan admin dihapus sesuai permintaan.
    // Sekarang, setiap pengguna yang terautentikasi dapat memanggil fungsi ini.
    // Gunakan service_role_key untuk melakukan operasi admin.
    const adminSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, payload } = await req.json();

    switch (action) {
      case 'list': {
        const { data: { users }, error } = await adminSupabaseClient.auth.admin.listUsers();
        if (error) throw error;

        const userIds = users.map(u => u.id);
        const { data: profiles, error: profileError } = await adminSupabaseClient
          .from('users')
          .select('*')
          .in('id', userIds);
        if (profileError) throw profileError;

        const combinedData = users.map(user => {
          const profile = profiles.find(p => p.id === user.id);
          return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            full_name: profile?.full_name || user.email,
            role: profile?.role || 'Kasir',
          };
        });

        return new Response(JSON.stringify(combinedData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      case 'create': {
        const { email, password, full_name, role } = payload;
        if (!email || !password || !full_name || !role) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { data, error } = await adminSupabaseClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name },
        });

        if (error) throw error;

        if (role === 'Admin') {
          const { error: updateError } = await adminSupabaseClient
            .from('users')
            .update({ role: 'Admin' })
            .eq('id', data.user.id);
          if (updateError) throw updateError;
        }

        return new Response(JSON.stringify(data.user), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });
      }
      case 'update': {
        const { id, role, full_name } = payload;
        if (!id || !role) {
          return new Response(JSON.stringify({ error: 'Missing user ID or role' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { error } = await adminSupabaseClient
          .from('users')
          .update({ role, full_name })
          .eq('id', id);
        
        if (error) throw error;

        return new Response(JSON.stringify({ message: 'User updated successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      case 'delete': {
        const { id } = payload;
        if (!id) {
          return new Response(JSON.stringify({ error: 'Missing user ID' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { error } = await adminSupabaseClient.auth.admin.deleteUser(id);
        if (error) throw error;

        return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})