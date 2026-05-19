import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeracaoResult {
  contratos_processados: number;
  faturas_geradas: number;
  faturas_ja_existentes: number;
  erros: number;
  detalhes: Array<{
    contrato_id: string;
    cliente_nome: string;
    fatura_gerada: boolean;
    fatura_id?: string;
    erro?: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Iniciando geração de faturas recorrentes...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Buscar contratos ativos
    const { data: contratos, error: contratosError } = await supabaseClient
      .from('contratos_financeiros')
      .select(`
        id,
        consultora_id,
        cliente_id,
        valor_mensal,
        dia_vencimento,
        forma_pagamento,
        asaas_customer_id,
        cliente:clientes!inner(id, nome, email)
      `)
      .eq('status', 'ativo')
      .is('data_fim', null); // Apenas contratos sem data de término

    if (contratosError) {
      throw new Error(`Erro ao buscar contratos: ${contratosError.message}`);
    }

    console.log(`📋 ${contratos?.length || 0} contratos ativos encontrados`);

    const result: GeracaoResult = {
      contratos_processados: 0,
      faturas_geradas: 0,
      faturas_ja_existentes: 0,
      erros: 0,
      detalhes: []
    };

    if (!contratos || contratos.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Nenhum contrato ativo para processar',
        ...result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Para cada contrato, gerar fatura se necessário
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    for (const contrato of contratos) {
      result.contratos_processados++;

      try {
        // Verificar se já existe fatura para este mês
        const primeiroDiaMes = new Date(anoAtual, mesAtual - 1, 1);
        const ultimoDiaMes = new Date(anoAtual, mesAtual, 0);

        const { data: faturaExistente } = await supabaseClient
          .from('faturas')
          .select('id')
          .eq('contrato_id', contrato.id)
          .gte('data_vencimento', primeiroDiaMes.toISOString().split('T')[0])
          .lte('data_vencimento', ultimoDiaMes.toISOString().split('T')[0])
          .single();

        if (faturaExistente) {
          console.log(`⏭️  Fatura já existe para contrato ${contrato.id}`);
          result.faturas_ja_existentes++;
        const clienteNome = (contrato as any).cliente?.nome || 'N/A';
        
        result.detalhes.push({
          contrato_id: contrato.id,
          cliente_nome: clienteNome,
          fatura_gerada: false,
          fatura_id: faturaExistente.id
        });
          continue;
        }

        // Calcular data de vencimento
        const diaVencimento = contrato.dia_vencimento || 10;
        let dataVencimento = new Date(anoAtual, mesAtual - 1, diaVencimento);
        
        // Se a data já passou este mês, gerar para o próximo mês
        if (dataVencimento < hoje) {
          dataVencimento = new Date(anoAtual, mesAtual, diaVencimento);
        }

        // Criar fatura local
        const clienteNome = (contrato as any).cliente?.nome || 'Cliente';
        
        const { data: novaFatura, error: faturaError } = await supabaseClient
          .from('faturas')
          .insert({
            consultora_id: contrato.consultora_id,
            cliente_id: contrato.cliente_id,
            contrato_id: contrato.id,
            valor: contrato.valor_mensal,
            data_emissao: hoje.toISOString().split('T')[0],
            data_vencimento: dataVencimento.toISOString().split('T')[0],
            descricao: `Mensalidade ${mesAtual}/${anoAtual} - ${clienteNome}`,
            forma_pagamento: contrato.forma_pagamento || 'PIX',
            status: 'pendente'
          })
          .select()
          .single();

        if (faturaError) {
          throw new Error(`Erro ao criar fatura: ${faturaError.message}`);
        }

        console.log(`✅ Fatura ${novaFatura.numero_fatura} gerada para contrato ${contrato.id}`);

        // Se tiver Asaas configurado, criar cobrança
        if (contrato.asaas_customer_id) {
          try {
            const { data: asaasCred } = await supabaseClient
              .from('asaas_credentials')
              .select('sandbox_api_key, production_api_key, environment')
              .eq('consultora_id', contrato.consultora_id)
              .eq('ativo', true)
              .single();

            if (asaasCred) {
              const apiKey = asaasCred.environment === 'production'
                ? asaasCred.production_api_key
                : asaasCred.sandbox_api_key;
              
              const asaasUrl = asaasCred.environment === 'production'
                ? 'https://www.asaas.com/api/v3'
                : 'https://sandbox.asaas.com/api/v3';

              if (!apiKey) {
                console.error('API Key não encontrada para o ambiente:', asaasCred.environment);
                throw new Error('API Key do Asaas não configurada');
              }

              const asaasResponse = await fetch(`${asaasUrl}/payments`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'access_token': apiKey
                },
                body: JSON.stringify({
                  customer: contrato.asaas_customer_id,
                  billingType: contrato.forma_pagamento === 'BOLETO' ? 'BOLETO' : 'PIX',
                  value: contrato.valor_mensal,
                  dueDate: dataVencimento.toISOString().split('T')[0],
                  description: novaFatura.descricao,
                  externalReference: novaFatura.id
                })
              });

              if (asaasResponse.ok) {
                const asaasData = await asaasResponse.json();

                await supabaseClient
                  .from('faturas')
                  .update({
                    asaas_payment_id: asaasData.id,
                    asaas_invoice_url: asaasData.invoiceUrl,
                    asaas_bank_slip_url: asaasData.bankSlipUrl,
                    asaas_pix_qr_code: asaasData.pixQrCodeBase64,
                    asaas_pix_copy_paste: asaasData.pixCopyAndPaste
                  })
                  .eq('id', novaFatura.id);

                console.log(`💳 Cobrança Asaas criada: ${asaasData.id}`);
              }
            }
          } catch (asaasError) {
            console.error('Erro ao criar cobrança no Asaas:', asaasError);
            // Continua mesmo com erro no Asaas - fatura local foi criada
          }
        }

        const clienteNome2 = (contrato as any).cliente?.nome || 'Cliente';
        
        result.faturas_geradas++;
        result.detalhes.push({
          contrato_id: contrato.id,
          cliente_nome: clienteNome2,
          fatura_gerada: true,
          fatura_id: novaFatura.id
        });

        // Criar alerta para consultora
        await supabaseClient
          .from('alertas')
          .insert({
            consultora_id: contrato.consultora_id,
            tipo: 'fatura_gerada',
            titulo: '📄 Nova Fatura Gerada',
            descricao: `Fatura ${novaFatura.numero_fatura} gerada automaticamente para ${clienteNome2}`
          });

      } catch (error) {
        console.error(`❌ Erro ao processar contrato ${contrato.id}:`, error);
        result.erros++;
        const clienteNome3 = (contrato as any).cliente?.nome || 'N/A';
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        result.detalhes.push({
          contrato_id: contrato.id,
          cliente_nome: clienteNome3,
          fatura_gerada: false,
          erro: errorMessage
        });
      }
    }

    console.log('✅ Geração de faturas concluída:', result);

    return new Response(JSON.stringify({
      success: true,
      message: `${result.faturas_geradas} faturas geradas com sucesso`,
      timestamp: new Date().toISOString(),
      ...result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na geração de faturas:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
