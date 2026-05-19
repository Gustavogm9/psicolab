import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useDashboardConsolidado = () => {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['dashboard-consolidado', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      // Buscar respostas de diagnósticos
      const { data: diagnosticosData } = await supabase
        .from('respostas_diagnostico')
        .select(`
          id,
          status,
          score_total,
          data_inicio,
          data_fim,
          questionario:questionarios_diagnostico!inner(consultora_id)
        `)
        .eq('questionario.consultora_id', effectiveUserId);

      // Buscar respostas de avaliações
      const { data: avaliacoesPublicas } = await supabase
        .from('avaliacoes_respostas_publicas')
        .select(`
          id,
          data_resposta,
          avaliacao:avaliacoes!inner(consultora_id)
        `)
        .eq('avaliacao.consultora_id', effectiveUserId);

      const { data: avaliacoesParticipantes } = await supabase
        .from('avaliacoes_participantes')
        .select(`
          id,
          data_resposta,
          respondido,
          avaliacao:avaliacoes!inner(consultora_id)
        `)
        .eq('avaliacao.consultora_id', effectiveUserId)
        .eq('respondido', true);

      // Buscar leads do CRM
      const { data: leads } = await supabase
        .from('leads_diagnostico')
        .select('id, created_at, origem')
        .eq('consultora_id', effectiveUserId);

      // Buscar oportunidades ganhas
      const { data: oportunidadesGanhas } = await supabase
        .from('oportunidades')
        .select('id')
        .eq('consultora_id', effectiveUserId)
        .eq('estagio', 'ganho');

      // Calcular estatísticas
      const totalRespostasDiagnosticos = diagnosticosData?.length || 0;
      const totalRespostasAvaliacoes = 
        (avaliacoesPublicas?.length || 0) + (avaliacoesParticipantes?.length || 0);
      const totalRespostas = totalRespostasDiagnosticos + totalRespostasAvaliacoes;

      const leadsGerados = leads?.length || 0;
      const leadsConvertidos = oportunidadesGanhas?.length || 0;
      const taxaConversao = leadsGerados > 0 ? (leadsConvertidos / leadsGerados) * 100 : 0;

      return {
        totalRespostas,
        totalRespostasDiagnosticos,
        totalRespostasAvaliacoes,
        leadsGerados,
        leadsConvertidos,
        taxaConversao,
        diagnosticos: diagnosticosData || [],
        avaliacoes: [...(avaliacoesPublicas || []), ...(avaliacoesParticipantes || [])],
        leads: leads || [],
      };
    },
    enabled: !!effectiveUserId,
  });
};
