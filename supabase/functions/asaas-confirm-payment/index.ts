import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Autenticação necessária');
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Token inválido');
    }

    const { fatura_id } = await req.json();
    if (!fatura_id) {
      throw new Error('fatura_id é obrigatório');
    }

    // Fetch the fatura
    const { data: fatura, error: faturaError } = await supabase
      .from('faturas')
      .select('*')
      .eq('id', fatura_id)
      .eq('consultora_id', user.id)
      .single();

    if (faturaError || !fatura) {
      throw new Error('Fatura não encontrada');
    }

    if (!fatura.asaas_payment_id) {
      throw new Error('Fatura não possui pagamento no Asaas');
    }

    // Fetch Asaas credentials
    const { data: cred, error: credError } = await supabase
      .from('asaas_credentials')
      .select('*')
      .eq('consultora_id', user.id)
      .eq('ativo', true)
      .single();

    if (credError || !cred) {
      throw new Error('Credenciais Asaas não encontradas');
    }

    const apiKey = cred.environment === 'production'
      ? cred.production_api_key
      : cred.sandbox_api_key;

    if (!apiKey) {
      throw new Error('API key do Asaas não configurada');
    }

    const asaasBaseUrl = cred.environment === 'production'
      ? 'https://www.asaas.com/api/v3'
      : 'https://sandbox.asaas.com/api/v3';

    const today = new Date().toISOString().split('T')[0];

    // Confirm payment in Asaas via receiveInCash
    const response = await fetch(
      `${asaasBaseUrl}/payments/${fatura.asaas_payment_id}/receiveInCash`,
      {
        method: 'POST',
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentDate: today,
          value: fatura.valor,
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.error(`Erro ao confirmar pagamento no Asaas: HTTP ${response.status} - ${errBody}`);
      throw new Error(`Erro ao confirmar pagamento no Asaas: HTTP ${response.status}`);
    }

    const responseData = await response.json().catch(() => ({}));

    // Update local status
    const { error: updateError } = await supabase
      .from('faturas')
      .update({ 
        status: 'pago', 
        data_pagamento: today 
      })
      .eq('id', fatura_id);

    if (updateError) {
      console.error('Pagamento confirmado no Asaas mas falhou ao atualizar localmente:', updateError);
      throw new Error('Confirmado no Asaas, mas falhou ao atualizar no sistema');
    }

    console.log(`Fatura ${fatura.numero_fatura} confirmada como paga no Asaas e localmente`);

    return new Response(
      JSON.stringify({ success: true, asaas_response: responseData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
