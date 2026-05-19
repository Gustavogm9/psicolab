import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERSION = "v1.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// SHA256 hash para dados do usuário (requerido pela Meta)
async function hashData(data: string): Promise<string> {
  if (!data) return '';
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  console.log(`[${VERSION}] Meta CAPI Event - Request received`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      perfil_publico_id,
      pixel_id,
      event_name,
      event_id,
      event_data = {},
      user_data = {}
    } = body;

    console.log(`[${VERSION}] Processing event: ${event_name} for perfil: ${perfil_publico_id}`);

    if (!perfil_publico_id || !pixel_id || !event_name) {
      return new Response(JSON.stringify({ 
        error: 'Campos obrigatórios: perfil_publico_id, pixel_id, event_name'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Buscar token CAPI do perfil
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis_publicos')
      .select('meta_capi_access_token')
      .eq('id', perfil_publico_id)
      .single();

    if (perfilError) {
      console.error(`[${VERSION}] Error fetching perfil:`, perfilError);
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Perfil não encontrado'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!perfil?.meta_capi_access_token) {
      console.log(`[${VERSION}] Token CAPI não configurado para perfil: ${perfil_publico_id}`);
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Token CAPI não configurado',
        skipped: true
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Hash dados do usuário conforme especificação da Meta
    const hashedUserData: Record<string, string> = {};
    
    if (user_data.email) {
      hashedUserData.em = await hashData(user_data.email);
    }
    if (user_data.phone) {
      hashedUserData.ph = await hashData(user_data.phone.replace(/\D/g, ''));
    }
    if (user_data.first_name) {
      hashedUserData.fn = await hashData(user_data.first_name);
    }
    if (user_data.last_name) {
      hashedUserData.ln = await hashData(user_data.last_name);
    }
    
    // Campos que não precisam de hash
    if (user_data.client_ip_address) {
      hashedUserData.client_ip_address = user_data.client_ip_address;
    }
    if (user_data.client_user_agent) {
      hashedUserData.client_user_agent = user_data.client_user_agent;
    }
    if (user_data.fbc) {
      hashedUserData.fbc = user_data.fbc;
    }
    if (user_data.fbp) {
      hashedUserData.fbp = user_data.fbp;
    }

    // Montar payload para Meta Graph API
    const eventPayload = {
      data: [{
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event_id || crypto.randomUUID(),
        action_source: 'website',
        event_source_url: event_data.source_url || '',
        user_data: hashedUserData,
        custom_data: {
          ...event_data,
          source_url: undefined // Remover duplicata
        }
      }]
    };

    console.log(`[${VERSION}] Sending to Meta API for pixel: ${pixel_id}`);

    // Enviar para Meta Graph API
    const metaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pixel_id}/events?access_token=${perfil.meta_capi_access_token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload)
      }
    );

    const metaResult = await metaResponse.json();
    console.log(`[${VERSION}] Meta API Response:`, JSON.stringify(metaResult));

    if (!metaResponse.ok) {
      console.error(`[${VERSION}] Meta API Error:`, metaResult);
      return new Response(JSON.stringify({
        success: false,
        error: metaResult.error?.message || 'Erro ao enviar evento para Meta',
        details: metaResult
      }), {
        status: 200, // Não falhar o request do cliente
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      events_received: metaResult.events_received,
      fbtrace_id: metaResult.fbtrace_id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`[${VERSION}] Error:`, error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : String(error),
      _version: VERSION
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
