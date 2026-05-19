import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MetricasFinanceiras } from "@/lib/asaas-types";
import { useAuth } from "@/contexts/AuthContext";

export function useMetricasFinanceiras(filters?: {
  data_inicio?: string;
  data_fim?: string;
}) {
  const { effectiveUserId } = useAuth();

  const { data: metricas, isLoading } = useQuery({
    queryKey: ['metricas-financeiras', filters, effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('calcular_metricas_financeiras', {
        _consultora_id: effectiveUserId,
        _data_inicio: filters?.data_inicio || null,
        _data_fim: filters?.data_fim || null
      });

      if (error) throw error;

      // RPC retorna array com um item
      const metrica = data?.[0] as MetricasFinanceiras;
      
      return {
        receita_total: Number(metrica?.receita_total || 0),
        receita_pendente: Number(metrica?.receita_pendente || 0),
        receita_atrasada: Number(metrica?.receita_atrasada || 0),
        total_faturas: Number(metrica?.total_faturas || 0),
        faturas_pagas: Number(metrica?.faturas_pagas || 0),
        faturas_pendentes: Number(metrica?.faturas_pendentes || 0),
        faturas_atrasadas: Number(metrica?.faturas_atrasadas || 0),
        ticket_medio: Number(metrica?.ticket_medio || 0),
        taxa_inadimplencia: Number(metrica?.taxa_inadimplencia || 0)
      } as MetricasFinanceiras;
    }
  });

  return { metricas, isLoading };
}
