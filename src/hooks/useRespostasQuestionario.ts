import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseRespostasFilters {
  status?: 'incompleta' | 'concluida' | 'abandonada';
  dataInicio?: Date;
  dataFim?: Date;
  scoreMin?: number;
  scoreMax?: number;
}

export const useRespostasQuestionario = (questionarioId: string, filters?: UseRespostasFilters) => {
  return useQuery({
    queryKey: ['respostas', questionarioId, filters],
    queryFn: async () => {
      let query = supabase
        .from('respostas_diagnostico')
        .select(`
          *,
          questionario:questionarios_diagnostico(titulo, slug, categoria)
        `)
        .eq('questionario_id', questionarioId)
        .order('data_inicio', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.dataInicio) {
        query = query.gte('data_inicio', filters.dataInicio.toISOString());
      }

      if (filters?.dataFim) {
        query = query.lte('data_inicio', filters.dataFim.toISOString());
      }

      if (filters?.scoreMin !== undefined) {
        query = query.gte('score_total', filters.scoreMin);
      }

      if (filters?.scoreMax !== undefined) {
        query = query.lte('score_total', filters.scoreMax);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!questionarioId,
  });
};
