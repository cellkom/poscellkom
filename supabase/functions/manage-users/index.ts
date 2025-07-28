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

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Admin check failed: Profile not found', profileError);
      return false;
    }

    return profile.role === 'Admin';
  } catch (e) {
    console.error('Error in isAdmin check:', e);
    return false;
  }
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the user's authorization
    const userSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Check if the user is an admin
    const isUserAdmin = await isAdmin(userSupabaseClient);
    if (!isUserAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Not an admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create a Supabase client with the service role for admin actions
    const adminSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle different request methods
    if (req.method === 'GET') {
      // List all users
      const { data: { users }, error } = await adminSupabaseClient.auth.admin.listUsers();
      if (error) throw error;

      // Get profiles for all users
      const userIds = users.map(u => u.id);
      const { data: profiles, error: profileError } = await adminSupabaseClient
        .from('profiles')
        .select('*')
        .in('id', userIds);
      if (profileError) throw profileError;

      // Combine user and profile data
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
    } else if (req.method === 'POST') {
        // Create a new user
        const { email, password, full_name, role } = await req.json();
        if (!email || !password || !full_name || !role) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { data, error } = await adminSupabaseClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm user
            user_metadata: { full_name },
        });

        if (error) throw error;

        // The trigger will create the profile, but we need to update the role if it's Admin
        if (role === 'Admin') {
            const { error: updateError } = await adminSupabaseClient
                .from('profiles')
                .update({ role: 'Admin' })
                .eq('id', data.user.id);
            if (updateError) throw updateError;
        }

        return new Response(JSON.stringify(data.user), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201,
        });
    } else if (req.method === 'PUT') {
        // Update user role
        const { id, role } = await req.json();
        if (!id || !role) {
            return new Response(JSON.stringify({ error: 'Missing user ID or role' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { error } = await adminSupabaseClient
            .from('profiles')
            .update({ role })
            .eq('id', id);
        
        if (error) throw error;

        return new Response(JSON.stringify({ message: 'User role updated successfully' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } else if (req.method === 'DELETE') {
        // Delete a user
        const { id } = await req.json();
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

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})