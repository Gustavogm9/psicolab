import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WebhookLog {
  event: string;
  timestamp: string;
  payment_id: string;
  validation_status?: 'aceito' | 'rejeitado';
  error_message?: string;
  status_anterior?: string;
  status_novo?: string;
}

interface FaturaWithLogs {
  id: string;
  numero_fatura: string;
  webhook_logs: WebhookLog[] | null;
  updated_at: string;
}

export function useWebhookLogs(limit: number = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['webhook-logs', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('faturas')
        .select('id, numero_fatura, webhook_logs, updated_at')
        .eq('consultora_id', user.id)
        .not('webhook_logs', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Processar e consolidar todos os logs
      const allLogs: Array<{
        fatura_id: string;
        numero_fatura: string;
        log: WebhookLog;
      }> = [];

      data?.forEach((fatura: any) => {
        if (fatura.webhook_logs && Array.isArray(fatura.webhook_logs)) {
          fatura.webhook_logs.forEach(log => {
            allLogs.push({
              fatura_id: fatura.id,
              numero_fatura: fatura.numero_fatura,
              log
            });
          });
        }
      });

      // Ordenar por timestamp mais recente e limitar
      return allLogs
        .sort((a, b) => new Date(b.log.timestamp).getTime() - new Date(a.log.timestamp).getTime())
        .slice(0, limit);
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
}
