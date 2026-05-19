import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { api_key, environment } = await req.json();

    if (!api_key || !environment) {
      console.error('Missing required fields:', { hasApiKey: !!api_key, hasEnvironment: !!environment });
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'API Key e ambiente são obrigatórios' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const baseUrl = environment === 'sandbox' 
      ? 'https://sandbox.asaas.com/api/v3'
      : 'https://www.asaas.com/api/v3';
    
    console.log('Validating Asaas API Key:', { 
      environment, 
      baseUrl,
      apiKeyPrefix: api_key.substring(0, 10) + '...'
    });

    const response = await fetch(`${baseUrl}/myAccount`, {
      headers: {
        'access_token': api_key,
        'Content-Type': 'application/json',
        'User-Agent': 'Lovable-Cloud/1.0'
      }
    });

    console.log('Asaas API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Asaas API Error:', { 
        status: response.status, 
        statusText: response.statusText,
        body: errorText 
      });

      if (response.status === 401 || response.status === 403) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'API Key inválida ou sem permissões necessárias' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (response.status >= 500) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'Serviço Asaas temporariamente indisponível. Tente novamente em alguns minutos.' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `Erro ao validar API Key: ${response.statusText}` 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('Asaas account validated successfully:', { 
      name: data.name, 
      email: data.email,
      walletId: data.walletId 
    });

    return new Response(
      JSON.stringify({ 
        valid: true, 
        accountInfo: {
          name: data.name,
          email: data.email,
          walletId: data.walletId
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    
    // Verificar se é erro de rede/conexão
    const isNetworkError = error instanceof TypeError && 
      error.message?.includes('fetch');
    
    if (isNetworkError) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Erro de conexão com Asaas. Verifique sua internet e tente novamente.' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Erro interno ao validar API Key. Contate o suporte.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
