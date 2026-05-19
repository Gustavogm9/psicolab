import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook para buscar leads associados a respostas
export const useLeadsRespostas = (respostaIds: string[]) => {
  return useQuery({
    queryKey: ['leads-respostas', respostaIds],
    queryFn: async () => {
      if (respostaIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('leads_diagnostico')
        .select('id, resposta_id, nome')
        .in('resposta_id', respostaIds);

      if (error) throw error;
      return data;
    },
    enabled: respostaIds.length > 0,
  });
};
