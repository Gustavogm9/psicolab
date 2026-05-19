import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WebhookStatusResult {
  status: 'active' | 'warning' | 'inactive';
  lastEvent: string | null;
  recentEvents: number;
  message: string;
}

export function useWebhookStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['webhook-status', user?.id],
    queryFn: async (): Promise<WebhookStatusResult> => {
      if (!user?.id) {
        return {
          status: 'inactive',
          lastEvent: null,
          recentEvents: 0,
          message: 'Usuário não autenticado'
        };
      }

      // Buscar faturas com webhook_logs nas últimas 24 horas
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);

      const { data, error } = await supabase
        .from('faturas')
        .select('webhook_logs, updated_at')
        .eq('consultora_id', user.id)
        .not('webhook_logs', 'is', null)
        .gte('updated_at', oneDayAgo.toISOString());

      if (error) throw error;

      let recentEvents = 0;
      let lastEventTime: Date | null = null;

      data?.forEach((fatura: any) => {
        if (fatura.webhook_logs && Array.isArray(fatura.webhook_logs)) {
          fatura.webhook_logs.forEach((log: any) => {
            const logTime = new Date(log.timestamp);
            if (logTime >= oneDayAgo) {
              recentEvents++;
              if (!lastEventTime || logTime > lastEventTime) {
                lastEventTime = logTime;
              }
            }
          });
        }
      });

      // Determinar status
      let status: 'active' | 'warning' | 'inactive' = 'inactive';
      let message = 'Nenhum webhook recebido nas últimas 24h';

      if (recentEvents > 0) {
        status = 'active';
        message = `${recentEvents} eventos recebidos nas últimas 24h`;
      } else if (data && data.length > 0) {
        status = 'warning';
        message = 'Sem eventos recentes, mas webhooks já foram recebidos';
      }

      return {
        status,
        lastEvent: lastEventTime?.toISOString() || null,
        recentEvents,
        message
      };
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Atualiza a cada minuto
  });
}
