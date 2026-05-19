import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FaturaData {
  id: string;
  cliente_id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  forma_pagamento?: string;
  consultora_id: string;
}

interface ClienteData {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  cpf_cnpj?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { fatura_id } = await req.json();

    if (!fatura_id) {
      throw new Error('fatura_id é obrigatório');
    }

    // Buscar fatura com dados do cliente
    const { data: fatura, error: faturaError } = await supabaseClient
      .from('faturas')
      .select(`
        *,
        cliente:clientes(id, nome, email, telefone, cpf_cnpj)
      `)
      .eq('id', fatura_id)
      .single();

    if (faturaError || !fatura) {
      throw new Error('Fatura não encontrada');
    }

    const faturaData = fatura as FaturaData;
    const cliente = (fatura as any).cliente as ClienteData;

    // Validar se cliente tem CPF/CNPJ
    if (!cliente.cpf_cnpj) {
      throw new Error(`O cliente "${cliente.nome}" não possui CPF/CNPJ cadastrado. Por favor, atualize o cadastro do cliente antes de criar cobranças no Asaas.`);
    }

    // Buscar credenciais Asaas
    const { data: credentials, error: credError } = await supabaseClient
      .from('asaas_credentials')
      .select('*')
      .eq('consultora_id', faturaData.consultora_id)
      .eq('ativo', true)
      .single();

    if (credError || !credentials) {
      throw new Error('Credenciais Asaas não configuradas');
    }

    // Validação de valor mínimo em produção
    const VALOR_MINIMO_PRODUCAO = 5.0;
    if (credentials.environment === 'production' && faturaData.valor < VALOR_MINIMO_PRODUCAO) {
      throw new Error(`Ambiente de produção: O valor mínimo para cobranças no Asaas é R$ ${VALOR_MINIMO_PRODUCAO.toFixed(2)}. Valor informado: R$ ${faturaData.valor.toFixed(2)}`);
    }

    const baseUrl = credentials.environment === 'sandbox'
      ? 'https://sandbox.asaas.com/api/v3'
      : 'https://www.asaas.com/api/v3';

    // Pegar API key correta baseada no ambiente
    const apiKey = credentials.environment === 'sandbox'
      ? credentials.sandbox_api_key
      : credentials.production_api_key;

    if (!apiKey) {
      throw new Error(`API Key do Asaas não configurada para o ambiente ${credentials.environment}`);
    }

    // 1. Criar/buscar cliente no Asaas
    let asaasCustomerId = null;
    
    // Buscar se já existe contrato com asaas_customer_id
    const { data: contrato } = await supabaseClient
      .from('contratos_financeiros')
      .select('asaas_customer_id')
      .eq('cliente_id', cliente.id)
      .not('asaas_customer_id', 'is', null)
      .limit(1)
      .maybeSingle();

    // Verificar primeiro na tabela clientes
    const { data: clienteData } = await supabaseClient
      .from('clientes')
      .select('asaas_customer_id')
      .eq('id', cliente.id)
      .not('asaas_customer_id', 'is', null)
      .maybeSingle();

    if (clienteData?.asaas_customer_id) {
      asaasCustomerId = clienteData.asaas_customer_id;
    } else if (contrato?.asaas_customer_id) {
      asaasCustomerId = contrato.asaas_customer_id;
      // Backfill: salvar no cliente para acesso direto futuro
      await supabaseClient
        .from('clientes')
        .update({ asaas_customer_id: contrato.asaas_customer_id })
        .eq('id', cliente.id);
    } else {
      // Criar cliente no Asaas
      const customerResponse = await fetch(`${baseUrl}/customers`, {
        method: 'POST',
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: cliente.nome,
          email: cliente.email,
          phone: cliente.telefone,
          cpfCnpj: cliente.cpf_cnpj,
          externalReference: cliente.id
        })
      });

      if (!customerResponse.ok) {
        const error = await customerResponse.json();
        throw new Error(`Erro ao criar cliente no Asaas: ${JSON.stringify(error)}`);
      }

      const customerData = await customerResponse.json();
      asaasCustomerId = customerData.id;

      // Salvar asaas_customer_id no cliente
      await supabaseClient
        .from('clientes')
        .update({ asaas_customer_id: asaasCustomerId })
        .eq('id', cliente.id);

      // Atualizar contratos existentes
      await supabaseClient
        .from('contratos_financeiros')
        .update({ asaas_customer_id: asaasCustomerId })
        .eq('cliente_id', cliente.id);
    }

    // 2. Criar cobrança no Asaas
    const paymentData = {
      customer: asaasCustomerId,
      billingType: faturaData.forma_pagamento || 'PIX',
      value: faturaData.valor,
      dueDate: faturaData.data_vencimento,
      description: faturaData.descricao,
      externalReference: fatura_id
    };

    const paymentResponse = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json();
      throw new Error(`Erro ao criar cobrança no Asaas: ${JSON.stringify(error)}`);
    }

    const payment = await paymentResponse.json();

    // 3. Atualizar fatura com dados do Asaas
    const { error: updateError } = await supabaseClient
      .from('faturas')
      .update({
        asaas_payment_id: payment.id,
        asaas_invoice_url: payment.invoiceUrl,
        asaas_bank_slip_url: payment.bankSlipUrl,
        asaas_pix_qr_code: payment.pixQrCodeBase64,
        asaas_pix_copy_paste: payment.pixCopyAndPaste
      })
      .eq('id', fatura_id);

    if (updateError) {
      console.error('Erro ao atualizar fatura:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        invoice_url: payment.invoiceUrl,
        bank_slip_url: payment.bankSlipUrl,
        pix_qr_code: payment.pixQrCodeBase64,
        pix_copy_paste: payment.pixCopyAndPaste
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na edge function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
