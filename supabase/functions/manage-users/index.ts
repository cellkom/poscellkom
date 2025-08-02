import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to verify if the user is an admin
async function isAdmin(supabaseClient: SupabaseClient): Promise<boolean> {
  console.log('Checking if user is admin...');
  try {
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Admin check failed: Not authenticated or user fetch error:', userError);
      return false;
    }
    console.log('Authenticated user ID:', user.id);

    const { data: profile, error: profileError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Admin check failed: Error fetching profile from public.users or no profile found:', profileError);
      return false; // If there's an error or no profile, it's not an admin
    }

    if (!profile) { // Explicitly check if profile data is null
      console.warn('Admin check failed: Profile data is null after query.');
      return false;
    }

    console.log('User role from DB:', profile.role);
    return profile.role === 'Admin';
  } catch (e) {
    console.error('Error in isAdmin check (catch block):', e);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client for the authenticated user
    const userSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const isUserAdmin = await isAdmin(userSupabaseClient);
    if (!isUserAdmin) {
      console.warn('Request blocked: User is not an admin.');
      return new Response(JSON.stringify({ error: 'Forbidden: Not an admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create a Supabase client with service role key for admin actions
    const adminSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, payload } = await req.json();
    console.log('Edge Function Action:', action);

    switch (action) {
      case 'list': {
        const { data: { users }, error } = await adminSupabaseClient.auth.admin.listUsers();
        if (error) {
          console.error('Error listing users:', error);
          throw error;
        }

        const userIds = users.map(u => u.id);
        const { data: profiles, error: profileError } = await adminSupabaseClient
          .from('users')
          .select('*')
          .in('id', userIds);
        if (profileError) {
          console.error('Error fetching user profiles for list:', profileError);
          throw profileError;
        }

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

        // Ensure the user profile is created/updated in public.users table
        const { error: upsertProfileError } = await adminSupabaseClient
          .from('users')
          .upsert({ id: data.user.id, full_name: full_name, role: role }); // Use upsert to handle cases where trigger might not fire or needs update
        
        if (upsertProfileError) {
          console.error('Error upserting user profile after creation:', upsertProfileError);
          // Decide if this should be a hard error or just log
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

        // Also delete from public.users table if it exists (handle cascade if not set up)
        const { error: deleteProfileError } = await adminSupabaseClient
          .from('users')
          .delete()
          .eq('id', id);
        
        if (deleteProfileError) {
          console.error('Error deleting user profile from public.users:', deleteProfileError);
          // Log but don't fail the main delete operation if auth.admin.deleteUser succeeded
        }

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
    console.error('Edge Function execution error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})