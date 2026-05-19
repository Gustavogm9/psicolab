import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WebhookTestResult {
  success: boolean;
  message: string;
  statusCode: number;
}

export function useWebhookTest() {
  const testMutation = useMutation({
    mutationFn: async () => {
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/asaas-webhook`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'WEBHOOK_TEST',
          payment: {
            id: 'test_' + Date.now(),
            customer: 'test_customer',
            value: 100,
            status: 'PENDING'
          }
        })
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        message: data.message || data.error || 'Webhook respondeu',
        statusCode: response.status
      };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('✅ Webhook está funcionando!', {
          description: `Status: ${data.statusCode} - ${data.message}`
        });
      } else {
        toast.error('❌ Webhook não respondeu corretamente', {
          description: data.message
        });
      }
    },
    onError: (error: Error) => {
      console.error('Erro ao testar webhook:', error);
      toast.error('Erro ao conectar com webhook', {
        description: error.message
      });
    }
  });

  return {
    testWebhook: () => testMutation.mutate(),
    isTesting: testMutation.isPending
  };
}
