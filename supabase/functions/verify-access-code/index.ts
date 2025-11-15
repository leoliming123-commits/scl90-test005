import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { code, sessionToken } = await req.json();

    if (!code || !sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: accessCode, error: queryError } = await supabaseAdmin
      .from('access_codes')
      .select('*')
      .eq('code', code.trim())
      .maybeSingle();

    if (queryError) {
      return new Response(
        JSON.stringify({ error: 'Query failed', valid: false }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!accessCode) {
      return new Response(
        JSON.stringify({ valid: false, message: '访问码无效' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!accessCode.is_active) {
      return new Response(
        JSON.stringify({ valid: false, message: '此访问码尚未激活或已被禁用' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: existingSession } = await supabaseAdmin
      .from('user_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (existingSession) {
      const firstAccessTime = new Date(existingSession.first_access_at).getTime();
      const now = Date.now();
      const hoursPassed = (now - firstAccessTime) / (1000 * 60 * 60);

      if (hoursPassed > 24) {
        return new Response(
          JSON.stringify({ valid: false, message: '您的会话已过期（超过24小时）' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      await supabaseAdmin
        .from('user_sessions')
        .update({ last_access_at: new Date().toISOString() })
        .eq('session_token', sessionToken);

      return new Response(
        JSON.stringify({ 
          valid: true, 
          firstAccessAt: existingSession.first_access_at 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const now = new Date().toISOString();
    const { error: insertError } = await supabaseAdmin
      .from('user_sessions')
      .insert({
        access_code_id: accessCode.id,
        session_token: sessionToken,
        first_access_at: now,
        last_access_at: now
      });

    if (insertError) {
      return new Response(
        JSON.stringify({ valid: false, message: '创建会话失败' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!accessCode.activated_at) {
      await supabaseAdmin
        .from('access_codes')
        .update({ activated_at: now })
        .eq('id', accessCode.id);
    }

    return new Response(
      JSON.stringify({ valid: true, firstAccessAt: now }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ 
        error: err instanceof Error ? err.message : 'Unknown error',
        valid: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});