import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to verify if the user is an admin
async function isAdmin(supabaseClient: SupabaseClient): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Admin check failed: Not authenticated', userError);
      return false;
    }

    // Use a non-strict query to avoid errors if the profile is temporarily missing
    const { data: profiles, error: profileError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id);

    if (profileError) {
      console.error('Admin check failed: Error fetching profile', profileError);
      return false;
    }

    // Check if a profile was found and if the role is 'Admin'
    if (!profiles || profiles.length === 0) {
      console.error('Admin check failed: Profile not found for user', user.id);
      return false;
    }

    return profiles[0].role === 'Admin';
  } catch (e) {
    console.error('Error in isAdmin check:', e);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Ensure the request is a POST request
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Create a Supabase client with the user's authorization to check their role
    const userSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Verify if the user is an admin
    const isUserAdmin = await isAdmin(userSupabaseClient);
    if (!isUserAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Not an admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create a Supabase client with the service role for performing admin actions
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

        // The handle_new_user trigger should create the profile in public.users
        // If the role needs to be Admin, we update it.
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
        const { id, role } = payload;
        if (!id || !role) {
          return new Response(JSON.stringify({ error: 'Missing user ID or role' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { error } = await adminSupabaseClient
          .from('users')
          .update({ role })
          .eq('id', id);
        
        if (error) throw error;

        return new Response(JSON.stringify({ message: 'User role updated successfully' }), {
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