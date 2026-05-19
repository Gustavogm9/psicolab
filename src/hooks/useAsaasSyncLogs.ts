import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SyncLog {
  id: string;
  consultora_id: string;
  timestamp: string;
  tipo: 'manual' | 'automatica';
  total_faturas: number;
  atualizadas: number;
  erros: number;
  detalhes: any;
  duracao_ms: number;
}

interface SyncStats {
  ultimaSync: SyncLog | null;
  proximaSync: string | null;
  totalSyncsHoje: number;
  successRate: number;
}

const HORARIOS_SYNC_BRT = [8, 10, 12, 14, 16, 18, 20];

function calcularProximaSync(): string {
  const agora = new Date();
  const horaAtualBRT = agora.getUTCHours() - 3; // Converter UTC para BRT
  const minutoAtual = agora.getUTCMinutes();

  // Encontrar próximo horário
  let proximaHoraBRT = HORARIOS_SYNC_BRT.find(h => {
    if (h > horaAtualBRT) return true;
    if (h === horaAtualBRT && minutoAtual < 0) return true;
    return false;
  });

  // Se não houver mais hoje, próxima é amanhã às 8h
  if (!proximaHoraBRT) {
    const amanha = new Date(agora);
    amanha.setUTCDate(amanha.getUTCDate() + 1);
    amanha.setUTCHours(11, 0, 0, 0); // 8h BRT = 11h UTC
    return amanha.toISOString();
  }

  // Calcular data/hora da próxima sync
  const proximaSync = new Date(agora);
  proximaSync.setUTCHours(proximaHoraBRT + 3, 0, 0, 0); // BRT para UTC
  return proximaSync.toISOString();
}

export function useAsaasSyncLogs(limit: number = 50) {
  const { effectiveUserId } = useAuth();

  const logsQuery = useQuery({
    queryKey: ['asaas-sync-logs', effectiveUserId, limit],
    queryFn: async () => {
      if (!effectiveUserId) return [];

      const { data, error } = await supabase
        .from('asaas_sync_logs' as any)
        .select('*')
        .eq('consultora_id', effectiveUserId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as SyncLog[];
    },
    enabled: !!effectiveUserId,
    refetchInterval: 60000, // Atualiza a cada minuto
  });

  const statsQuery = useQuery({
    queryKey: ['asaas-sync-stats', effectiveUserId],
    queryFn: async (): Promise<SyncStats> => {
      const logs = logsQuery.data || [];
      
      const ultimaSync = logs.length > 0 ? logs[0] : null;
      const proximaSync = calcularProximaSync();
      
      // Contar syncs de hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const totalSyncsHoje = logs.filter(log => 
        new Date(log.timestamp) >= hoje
      ).length;

      // Calcular taxa de sucesso (últimas 10 syncs)
      const ultimas10 = logs.slice(0, 10);
      const successRate = ultimas10.length > 0
        ? (ultimas10.filter(log => log.erros === 0).length / ultimas10.length) * 100
        : 100;

      return {
        ultimaSync,
        proximaSync,
        totalSyncsHoje,
        successRate
      };
    },
    enabled: !!effectiveUserId && !!logsQuery.data,
  });

  return {
    logs: logsQuery.data || [],
    stats: statsQuery.data,
    isLoading: logsQuery.isLoading || statsQuery.isLoading,
    error: logsQuery.error || statsQuery.error,
  };
}
