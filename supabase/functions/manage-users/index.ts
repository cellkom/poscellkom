import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to handle preflight requests
const handleOptions = () => new Response(null, { headers: corsHeaders });

// Function to create a Supabase client for the user making the request
const createSupabaseClient = (req: Request): SupabaseClient => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // 1. Check for required environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables.');
    }

    // 2. Create user and admin clients
    const supabaseClient = createSupabaseClient(req);
    const adminSupabaseClient = createClient(supabaseUrl, serviceRoleKey);

    // 3. Check user authentication and role
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated.');
    }

    const { data: profile, error: profileError } = await adminSupabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'Admin') {
      throw new Error('User is not authorized to perform this action.');
    }
    
    // 4. Process the request
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

        // The handle_new_user trigger should set the role to 'Kasir' by default.
        // We only need to update it if the role is 'Admin'.
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
        if (!id || !role || !full_name) {
          return new Response(JSON.stringify({ error: 'Missing user ID, role, or full name' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
    console.error("Edge function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})