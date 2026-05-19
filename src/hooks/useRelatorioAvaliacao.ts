import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRelatorioAvaliacao = (avaliacaoId: string | undefined) => {
  return useQuery({
    queryKey: ['relatorio-avaliacao', avaliacaoId],
    queryFn: async () => {
      if (!avaliacaoId) throw new Error('ID da avaliação não fornecido');

      // Buscar respostas públicas
      const { data: respostasPublicas, error: publicasError } = await supabase
        .from('avaliacoes_respostas_publicas')
        .select('*')
        .eq('avaliacao_id', avaliacaoId);

      if (publicasError) throw publicasError;

      // Buscar respostas de participantes
      const { data: participantes, error: participantesError } = await supabase
        .from('avaliacoes_participantes')
        .select('*')
        .eq('avaliacao_id', avaliacaoId)
        .eq('respondido', true);

      if (participantesError) throw participantesError;

      // Combinar todas as respostas
      const todasRespostas = [
        ...(respostasPublicas || []).map((r: any) => ({
          id: r.id,
          nome: r.nome,
          email: r.email,
          setor: r.setor || null,
          cargo: r.cargo || null,
          respostas: r.respostas,
          data_resposta: r.data_resposta,
          tipo: 'publica' as const,
        })),
        ...(participantes || []).map((p: any) => ({
          id: p.id,
          nome: p.nome,
          email: p.email,
          setor: p.setor || null,
          cargo: p.cargo || null,
          respostas: p.respostas,
          data_resposta: p.data_resposta,
          tipo: 'participante' as const,
        })),
      ];

      return {
        respostasPublicas: respostasPublicas || [],
        participantes: participantes || [],
        todasRespostas,
        totalRespostas: todasRespostas.length,
      };
    },
    enabled: !!avaliacaoId,
  });
};
