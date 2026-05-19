import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    const { event, payment } = payload;

    console.log('Webhook recebido:', { event, paymentId: payment?.id });

    // Tratamento especial para eventos de teste
    if (event === 'WEBHOOK_TEST') {
      console.log('Teste de webhook recebido com sucesso');
      return new Response(
        JSON.stringify({ success: true, message: 'Webhook de teste processado com sucesso' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if (!event || !payment?.id) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos no webhook' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Buscar fatura pelo asaas_payment_id
    const { data: fatura, error: faturaError } = await supabase
      .from('faturas')
      .select('*, asaas_credentials!inner(webhook_token, sandbox_webhook_token, production_webhook_token, environment)')
      .eq('asaas_payment_id', payment.id)
      .single();

    if (faturaError || !fatura) {
      // Pagamento criado diretamente no Asaas, não via sistema
      // Aceitar silenciosamente para evitar retentativas
      console.log('Pagamento externo (não rastreado):', payment.id, '- Evento:', event);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Pagamento externo aceito (não rastreado no sistema)',
          external: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Preparar log (ANTES da validação)
    const webhookLog = {
      event,
      timestamp: new Date().toISOString(),
      payment_id: payment.id,
      validation_status: 'aceito' as 'aceito' | 'rejeitado',
      error_message: undefined as string | undefined,
      status_anterior: fatura.status,
      status_novo: fatura.status
    };

    // Validar token
    const webhookTokenHeader = req.headers.get('asaas-access-token');
    const credentials = fatura.asaas_credentials as any;
    
    const expectedToken = credentials.environment === 'production'
      ? credentials.production_webhook_token
      : credentials.sandbox_webhook_token;

    if (webhookTokenHeader !== expectedToken) {
      console.error('Token de webhook inválido');
      
      // Marcar log como rejeitado
      webhookLog.validation_status = 'rejeitado';
      webhookLog.error_message = 'Token de webhook inválido';

      // Salvar log do webhook rejeitado
      const currentLogs = fatura.webhook_logs || [];
      await supabase
        .from('faturas')
        .update({
          webhook_logs: [...currentLogs, webhookLog]
        })
        .eq('id', fatura.id);

      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Processar eventos de pagamento
    const statusEventos = [
      'PAYMENT_RECEIVED',
      'PAYMENT_CONFIRMED',
      'PAYMENT_OVERDUE',
      'PAYMENT_DELETED',
      'PAYMENT_RESTORED',
      'PAYMENT_REFUNDED',
      'PAYMENT_RECEIVED_IN_CASH',
      'PAYMENT_CHARGEBACK_REQUESTED',
      'PAYMENT_CHARGEBACK_DISPUTE',
      'PAYMENT_AWAITING_CHARGEBACK_REVERSAL',
      'PAYMENT_DUNNING_RECEIVED',
      'PAYMENT_DUNNING_REQUESTED',
      'PAYMENT_BANK_SLIP_VIEWED',
      'PAYMENT_CHECKOUT_VIEWED'
    ];

    if (statusEventos.includes(event)) {
      const novoStatus = mapAsaasStatus(payment.status);
      webhookLog.status_novo = novoStatus;

      const updateData: any = {
        status: novoStatus,
      };

      // Atualizar dados específicos com base no evento
      if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED_IN_CASH') {
        updateData.data_pagamento = payment.paymentDate || new Date().toISOString();
        updateData.metodo_pagamento_real = payment.billingType;
        
        if (payment.confirmedDate) {
          updateData.data_pagamento = payment.confirmedDate;
        }
      }

      // Informações de PIX
      if (payment.pixTransaction) {
        updateData.asaas_pix_qr_code = payment.pixTransaction.qrCode?.encodedImage;
        updateData.asaas_pix_copy_paste = payment.pixTransaction.qrCode?.payload;
      }

      // Informações de boleto
      if (payment.bankSlipUrl) {
        updateData.asaas_bank_slip_url = payment.bankSlipUrl;
      }

      if (payment.invoiceUrl) {
        updateData.asaas_invoice_url = payment.invoiceUrl;
      }

      // Salvar log do webhook aceito
      const currentLogs = fatura.webhook_logs || [];
      updateData.webhook_logs = [...currentLogs, webhookLog];

      const { error: updateError } = await supabase
        .from('faturas')
        .update(updateData)
        .eq('id', fatura.id);

      if (updateError) {
        console.error('Erro ao atualizar fatura:', updateError);
        throw updateError;
      }

      // Criar registro de pagamento se foi pago
      if (novoStatus === 'pago' && !fatura.data_pagamento) {
        await supabase.from('pagamentos').insert({
          fatura_id: fatura.id,
          consultora_id: fatura.consultora_id,
          valor_pago: payment.value || fatura.valor,
          data_pagamento: updateData.data_pagamento,
          forma_pagamento: payment.billingType || 'N/A',
          asaas_payment_id: payment.id,
          asaas_transaction_id: payment.transactionReceiptUrl || null,
        });
      }

      console.log(`Fatura ${fatura.numero_fatura} atualizada via webhook: ${fatura.status} → ${novoStatus}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processado com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
