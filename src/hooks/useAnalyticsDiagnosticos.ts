import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsPeriodo {
  dataInicio?: Date;
  dataFim?: Date;
}

export const useAnalyticsDiagnosticos = (periodo?: AnalyticsPeriodo) => {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['analytics-diagnosticos', periodo, effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const userId = effectiveUserId;

      let queryRespostas = supabase
        .from('respostas_diagnostico')
        .select(`
          *,
          questionario:questionarios_diagnostico!inner(consultora_id)
        `)
        .eq('questionario.consultora_id', userId);

      if (periodo?.dataInicio) {
        queryRespostas = queryRespostas.gte('data_inicio', periodo.dataInicio.toISOString());
      }

      if (periodo?.dataFim) {
        queryRespostas = queryRespostas.lte('data_inicio', periodo.dataFim.toISOString());
      }

      const { data: respostas, error: respostasError } = await queryRespostas;
      if (respostasError) throw respostasError;

      // Buscar questionários ativos
      const { data: questionarios, error: questionariosError } = await supabase
        .from('questionarios_diagnostico')
        .select('*')
        .eq('consultora_id', userId)
        .eq('ativo', true);

      if (questionariosError) throw questionariosError;

      // Buscar leads
      let queryLeads = supabase
        .from('leads_diagnostico')
        .select('*')
        .eq('consultora_id', userId);

      if (periodo?.dataInicio) {
        queryLeads = queryLeads.gte('created_at', periodo.dataInicio.toISOString());
      }

      if (periodo?.dataFim) {
        queryLeads = queryLeads.lte('created_at', periodo.dataFim.toISOString());
      }

      const { data: leads, error: leadsError } = await queryLeads;
      if (leadsError) throw leadsError;

      // Calcular métricas
      const totalRespostas = respostas?.length || 0;
      const respostasCompletas = respostas?.filter(r => r.status === 'concluida').length || 0;
      const taxaConclusao = totalRespostas > 0 ? (respostasCompletas / totalRespostas) * 100 : 0;
      const totalLeads = leads?.length || 0;
      const taxaConversao = respostasCompletas > 0 ? (totalLeads / respostasCompletas) * 100 : 0;

      // Calcular tempo médio
      const temposResposta = respostas
        ?.filter(r => r.tempo_resposta)
        .map(r => r.tempo_resposta) || [];
      const tempoMedio = temposResposta.length > 0
        ? temposResposta.reduce((a, b) => a + b, 0) / temposResposta.length
        : 0;

      // Agrupar respostas por dia
      const respostasPorDia: Record<string, number> = {};
      respostas?.forEach(r => {
        const dia = new Date(r.data_inicio).toISOString().split('T')[0];
        respostasPorDia[dia] = (respostasPorDia[dia] || 0) + 1;
      });

      // Distribuição por origem
      const origemDistribution: Record<string, number> = {};
      respostas?.forEach(r => {
        const origem = r.origem || 'desconhecido';
        origemDistribution[origem] = (origemDistribution[origem] || 0) + 1;
      });

      return {
        questionariosAtivos: questionarios?.length || 0,
        totalRespostas,
        respostasCompletas,
        taxaConclusao: Math.round(taxaConclusao),
        tempoMedio: Math.round(tempoMedio / 60), // converter para minutos
        leadsGerados: totalLeads,
        taxaConversao: Math.round(taxaConversao),
        respostasPorDia,
        origemDistribution,
        questionarios: questionarios || [],
        respostas: respostas || [],
        leads: leads || [],
      };
    },
  });
};
