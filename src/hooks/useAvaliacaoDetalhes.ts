import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAvaliacaoDetalhes = (avaliacaoId: string | undefined) => {
  return useQuery({
    queryKey: ['avaliacao', avaliacaoId],
    queryFn: async () => {
      if (!avaliacaoId) throw new Error('ID da avaliação não fornecido');

      const { data: avaliacao, error: avaliacaoError } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          cliente:clientes(nome)
        `)
        .eq('id', avaliacaoId)
        .single();

      if (avaliacaoError) throw avaliacaoError;

      const { data: questoes, error: questoesError } = await supabase
        .from('avaliacoes_questoes')
        .select('*')
        .eq('avaliacao_id', avaliacaoId)
        .order('ordem');

      if (questoesError) throw questoesError;

      const { data: participantes, error: participantesError } = await supabase
        .from('avaliacoes_participantes')
        .select('*')
        .eq('avaliacao_id', avaliacaoId);

      if (participantesError) throw participantesError;

      return {
        ...avaliacao,
        questoes: questoes || [],
        participantes: participantes || [],
      };
    },
    enabled: !!avaliacaoId,
  });
};
