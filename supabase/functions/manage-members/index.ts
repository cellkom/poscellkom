import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const adminSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, payload } = await req.json();

    switch (action) {
      case 'list': {
        const { data: { users }, error: authError } = await adminSupabaseClient.auth.admin.listUsers();
        if (authError) throw authError;

        const { data: memberProfiles, error: profileError } = await adminSupabaseClient
          .from('members')
          .select('*');
        if (profileError) throw profileError;

        const memberIds = new Set(memberProfiles.map(p => p.id));
        
        const combinedData = users
          .filter(user => memberIds.has(user.id))
          .map(user => {
            const profile = memberProfiles.find(p => p.id === user.id);
            return {
              id: user.id,
              email: user.email,
              created_at: user.created_at,
              full_name: profile?.full_name,
              phone: profile?.phone,
              address: profile?.address,
              avatar_url: profile?.avatar_url,
              role: profile?.role,
            };
          });

        return new Response(JSON.stringify(combinedData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      case 'update': {
        const { id, ...updates } = payload;
        if (!id) {
          return new Response(JSON.stringify({ error: 'Missing member ID' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { error } = await adminSupabaseClient
          .from('members')
          .update(updates)
          .eq('id', id);
        
        if (error) throw error;

        return new Response(JSON.stringify({ message: 'Member updated successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      case 'delete': {
        const { id } = payload;
        if (!id) {
          return new Response(JSON.stringify({ error: 'Missing member ID' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Deleting the auth user will cascade and delete the member profile
        const { error } = await adminSupabaseClient.auth.admin.deleteUser(id);
        if (error) throw error;

        return new Response(JSON.stringify({ message: 'Member deleted successfully' }), {
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