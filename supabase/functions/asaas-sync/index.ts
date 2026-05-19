import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SyncResult {
  success: boolean;
  timestamp: string;
  consultoras_processadas: number;
  total_faturas: number;
  atualizadas: number;
  importadas: number;
  erros: number;
  detalhes: Array<{
    fatura_id: string;
    numero_fatura: string;
    status_anterior: string;
    status_novo: string;
    sincronizado: boolean;
    erro?: string;
  }>;
}

function mapAsaasStatus(asaasStatus: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'pendente',
    'RECEIVED': 'pago',
    'CONFIRMED': 'pago',
    'OVERDUE': 'atrasado',
    'REFUNDED': 'cancelado',
    'RECEIVED_IN_CASH': 'pago',
    'REFUND_REQUESTED': 'cancelado',
    'CHARGEBACK_REQUESTED': 'cancelado',
    'CHARGEBACK_DISPUTE': 'cancelado',
    'AWAITING_CHARGEBACK_REVERSAL': 'cancelado',
    'DUNNING_REQUESTED': 'atrasado',
    'DUNNING_RECEIVED': 'pago',
    'AWAITING_RISK_ANALYSIS': 'pendente',
  };
  return statusMap[asaasStatus] || 'pendente';
}

function mapBillingType(billingType: string): string {
  const map: Record<string, string> = {
    'BOLETO': 'boleto',
    'CREDIT_CARD': 'cartao',
    'PIX': 'pix',
    'UNDEFINED': 'outro',
  };
  return map[billingType] || 'outro';
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-cron, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const isCronJob = req.headers.get('x-supabase-cron') === 'true';
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Autenticação: cron job ou token de usuário
    let authenticatedUserId: string | null = null;
    
    if (!isCronJob) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('Autenticação necessária');
      }
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        throw new Error('Token inválido');
      }
      authenticatedUserId = user.id;
    }

    const { fatura_id, cliente_id } = await req.json().catch(() => ({}));

    console.log('Iniciando sincronização...', {
      isCronJob,
      fatura_id,
      cliente_id
    });

    // Buscar credenciais ativas
    let credsQuery = supabase
      .from('asaas_credentials')
      .select('*')
      .eq('ativo', true);

    if (authenticatedUserId) {
      credsQuery = credsQuery.eq('consultora_id', authenticatedUserId);
    }

    const { data: credentials, error: credsError } = await credsQuery;

    if (credsError) {
      console.error('Erro ao buscar credenciais:', credsError);
      throw new Error('Erro ao buscar credenciais do Asaas');
    }

    if (!credentials || credentials.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Nenhuma credencial ativa encontrada',
          timestamp: new Date().toISOString(),
          consultoras_processadas: 0,
          total_faturas: 0,
          atualizadas: 0,
          importadas: 0,
          erros: 0,
          detalhes: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const result: SyncResult = {
      success: true,
      timestamp: new Date().toISOString(),
      consultoras_processadas: 0,
      total_faturas: 0,
      atualizadas: 0,
      importadas: 0,
      erros: 0,
      detalhes: []
    };

    // Processar cada consultora
    for (const cred of credentials) {
      const apiKey = cred.environment === 'production' 
        ? cred.production_api_key 
        : cred.sandbox_api_key;

      if (!apiKey) continue;

      const asaasBaseUrl = cred.environment === 'production'
        ? 'https://www.asaas.com/api/v3'
        : 'https://sandbox.asaas.com/api/v3';

      result.consultoras_processadas++;

      let consultoraImportadas = 0;

      // ===== ETAPA 1: Atualizar status de faturas existentes =====
      let faturasQuery = supabase
        .from('faturas')
        .select('*')
        .eq('consultora_id', cred.consultora_id)
        .in('status', ['pendente', 'atrasado'])
        .not('asaas_payment_id', 'is', null);

      if (fatura_id) {
        faturasQuery = faturasQuery.eq('id', fatura_id);
      }

      if (cliente_id) {
        faturasQuery = faturasQuery.eq('cliente_id', cliente_id);
      }

      const { data: faturas, error: faturasError } = await faturasQuery;

      if (faturasError) {
        console.error('Erro ao buscar faturas:', faturasError);
        result.erros++;
        continue;
      }

      console.log(`Consultora ${cred.consultora_id}: ${faturas?.length || 0} faturas para sincronizar`);

      if (faturas && faturas.length > 0) {
        result.total_faturas += faturas.length;

        // Verificar status no Asaas
        for (const fatura of faturas) {
          try {
            const response = await fetch(
              `${asaasBaseUrl}/payments/${fatura.asaas_payment_id}`,
              {
                headers: {
                  'access_token': apiKey,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (!response.ok) {
              const errBody = await response.text().catch(() => '');
              console.error(`Erro ao consultar Asaas para fatura ${fatura.numero_fatura}: HTTP ${response.status} - ${errBody}`);
              result.erros++;
              result.detalhes.push({
                fatura_id: fatura.id,
                numero_fatura: fatura.numero_fatura,
                status_anterior: fatura.status,
                status_novo: fatura.status,
                sincronizado: false,
                erro: `HTTP ${response.status}`
              });
              continue;
            }

            const asaasPayment = await response.json();
            const novoStatus = mapAsaasStatus(asaasPayment.status);

            // Atualizar se status mudou
            if (novoStatus !== fatura.status) {
              const updateData: any = {
                status: novoStatus,
              };

              // Se foi pago, registrar data
              if (novoStatus === 'pago' && !fatura.data_pagamento) {
                updateData.data_pagamento = asaasPayment.paymentDate || new Date().toISOString();
              }

              const { error: updateError } = await supabase
                .from('faturas')
                .update(updateData)
                .eq('id', fatura.id);

              if (updateError) {
                console.error('Erro ao atualizar fatura:', updateError);
                result.erros++;
                result.detalhes.push({
                  fatura_id: fatura.id,
                  numero_fatura: fatura.numero_fatura,
                  status_anterior: fatura.status,
                  status_novo: novoStatus,
                  sincronizado: false,
                  erro: updateError.message
                });
              } else {
                console.log(`Fatura ${fatura.numero_fatura} atualizada: ${fatura.status} → ${novoStatus}`);
                result.atualizadas++;
                result.detalhes.push({
                  fatura_id: fatura.id,
                  numero_fatura: fatura.numero_fatura,
                  status_anterior: fatura.status,
                  status_novo: novoStatus,
                  sincronizado: true
                });

                // Criar registro de pagamento se foi pago
                if (novoStatus === 'pago') {
                  await supabase.from('pagamentos').insert({
                    fatura_id: fatura.id,
                    consultora_id: fatura.consultora_id,
                    valor_pago: fatura.valor,
                    data_pagamento: updateData.data_pagamento,
                    forma_pagamento: asaasPayment.billingType || 'N/A',
                    asaas_payment_id: fatura.asaas_payment_id,
                  });
                }
              }
            }
          } catch (error) {
            console.error(`Erro ao processar fatura ${fatura.numero_fatura}:`, error);
            result.erros++;
            result.detalhes.push({
              fatura_id: fatura.id,
              numero_fatura: fatura.numero_fatura,
              status_anterior: fatura.status,
              status_novo: fatura.status,
              sincronizado: false,
              erro: error instanceof Error ? error.message : String(error)
            });
          }
        }
      }

      // ===== ETAPA 2: Importar cobranças do Asaas que não existem no Guilds =====
      // Só importa se não é filtro por fatura específica
      if (!fatura_id) {
        try {
          console.log(`Consultora ${cred.consultora_id}: Buscando cobranças do Asaas para importação...`);
          
          const paymentsResponse = await fetch(
            `${asaasBaseUrl}/payments?offset=0&limit=100`,
            {
              headers: {
                'access_token': apiKey,
                'Content-Type': 'application/json',
              },
            }
          );

          if (paymentsResponse.ok) {
            const paymentsData = await paymentsResponse.json();
            const asaasPayments = paymentsData.data || [];

            console.log(`Encontradas ${asaasPayments.length} cobranças no Asaas`);

            // Buscar todos os asaas_payment_id já existentes para esta consultora
            const { data: existingFaturas } = await supabase
              .from('faturas')
              .select('asaas_payment_id')
              .eq('consultora_id', cred.consultora_id)
              .not('asaas_payment_id', 'is', null);

            const existingPaymentIds = new Set(
              (existingFaturas || []).map(f => f.asaas_payment_id)
            );

            // Match de cliente: primeiro via clientes.asaas_customer_id
            const { data: clientesDiretos } = await supabase
              .from('clientes')
              .select('id, asaas_customer_id')
              .eq('consultora_id', cred.consultora_id)
              .not('asaas_customer_id', 'is', null);

            const customerToClienteMap = new Map<string, string>();
            if (clientesDiretos) {
              for (const c of clientesDiretos) {
                if (c.asaas_customer_id) {
                  customerToClienteMap.set(c.asaas_customer_id, c.id);
                }
              }
            }

            // Fallback: contratos_financeiros para clientes sem asaas_customer_id direto
            const { data: contratos } = await supabase
              .from('contratos_financeiros')
              .select('cliente_id, asaas_customer_id')
              .eq('consultora_id', cred.consultora_id)
              .not('asaas_customer_id', 'is', null);

            if (contratos) {
              for (const c of contratos) {
                if (c.asaas_customer_id && !customerToClienteMap.has(c.asaas_customer_id)) {
                  customerToClienteMap.set(c.asaas_customer_id, c.cliente_id);
                }
              }
            }

            // Importar cobranças que não existem
            for (const payment of asaasPayments) {
              if (existingPaymentIds.has(payment.id)) continue;

              // Ignorar cobranças deletadas
              if (payment.deleted) continue;

              const clienteId = customerToClienteMap.get(payment.customer) || null;
              
              // Backfill: se match veio do contratos_financeiros, salvar no cliente direto
              if (clienteId && payment.customer) {
                const clienteDireto = clientesDiretos?.find(c => c.id === clienteId);
                if (!clienteDireto?.asaas_customer_id) {
                  await supabase
                    .from('clientes')
                    .update({ asaas_customer_id: payment.customer })
                    .eq('id', clienteId);
                }
              }

              const status = mapAsaasStatus(payment.status);

              const novaFatura: any = {
                asaas_payment_id: payment.id,
                consultora_id: cred.consultora_id,
                cliente_id: clienteId,
                valor: payment.value,
                status: status,
                data_emissao: payment.dateCreated || new Date().toISOString().split('T')[0],
                data_vencimento: payment.dueDate,
                descricao: payment.description || `Cobrança importada do Asaas #${payment.id}`,
                forma_pagamento: mapBillingType(payment.billingType),
                asaas_invoice_url: payment.invoiceUrl || null,
                asaas_bank_slip_url: payment.bankSlipUrl || null,
              };

              if (status === 'pago' && payment.paymentDate) {
                novaFatura.data_pagamento = payment.paymentDate;
              }

              const { data: inserted, error: insertError } = await supabase
                .from('faturas')
                .insert(novaFatura)
                .select('id, numero_fatura')
                .single();

              if (insertError) {
                console.error(`Erro ao importar cobrança ${payment.id}:`, insertError.message);
                result.erros++;
              } else {
                console.log(`Cobrança ${payment.id} importada como fatura ${inserted.numero_fatura}`);
                consultoraImportadas++;
                result.importadas++;
                result.detalhes.push({
                  fatura_id: inserted.id,
                  numero_fatura: inserted.numero_fatura,
                  status_anterior: 'importada',
                  status_novo: status,
                  sincronizado: true
                });
              }
            }
          } else {
            const errBody = await paymentsResponse.text().catch(() => '');
            console.error(`Erro ao buscar cobranças do Asaas: HTTP ${paymentsResponse.status} - ${errBody}`);
          }
        } catch (importError) {
          console.error('Erro na importação de cobranças:', importError);
        }
      }

      // Salvar log de sincronização para essa consultora
      const duracao = Date.now() - startTime;
      const consultoraFaturas = (faturas?.length || 0);
      const consultoraAtualizadas = result.detalhes.filter(d => 
        d.sincronizado && d.status_anterior !== 'importada' &&
        faturas?.some(f => f.id === d.fatura_id)
      ).length;
      const consultoraErros = result.detalhes.filter(d => 
        !d.sincronizado && 
        faturas?.some(f => f.id === d.fatura_id)
      ).length;
      
      await supabase.from('asaas_sync_logs').insert({
        consultora_id: cred.consultora_id,
        tipo: isCronJob ? 'automatica' : 'manual',
        total_faturas: consultoraFaturas + consultoraImportadas,
        atualizadas: consultoraAtualizadas + consultoraImportadas,
        erros: consultoraErros,
        detalhes: {
          environment: cred.environment,
          fatura_id_filtro: fatura_id,
          cliente_id_filtro: cliente_id,
          importadas: consultoraImportadas
        },
        duracao_ms: duracao
      });
    }

    // Chamar função para atualizar faturas vencidas
    await supabase.rpc('atualizar_faturas_vencidas');

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro na sincronização:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        success: false,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
