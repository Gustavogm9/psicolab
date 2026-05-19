import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useDashboardData() {
  const { effectiveUserId } = useAuth();

  // Buscar estatísticas
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return null;

      // Clientes ativos
      const { count: clientesAtivos } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('consultora_id', effectiveUserId)
        .eq('status', 'Ativo');

      // Avaliações em andamento (projetos em Coleta ou Análise)
      const { count: avaliacoesAndamento } = await supabase
        .from('projetos')
        .select('*', { count: 'exact', head: true })
        .eq('consultora_id', effectiveUserId)
        .in('status', ['Coleta', 'Análise']);

      // Taxa de resposta média
      const { data: projetos } = await supabase
        .from('projetos')
        .select('participantes_total, participantes_responderam')
        .eq('consultora_id', effectiveUserId)
        .gt('participantes_total', 0);

      let taxaResposta = 0;
      if (projetos && projetos.length > 0) {
        const somaTotal = projetos.reduce((acc, p) => acc + p.participantes_total, 0);
        const somaRespondidos = projetos.reduce((acc, p) => acc + p.participantes_responderam, 0);
        taxaResposta = somaTotal > 0 ? Math.round((somaRespondidos / somaTotal) * 100) : 0;
      }

      // Relatórios pendentes
      const { count: relatoriosPendentes } = await supabase
        .from('projetos')
        .select('*', { count: 'exact', head: true })
        .eq('consultora_id', effectiveUserId)
        .eq('status', 'Relatório');

      return {
        clientesAtivos: clientesAtivos || 0,
        avaliacoesAndamento: avaliacoesAndamento || 0,
        taxaResposta,
        relatoriosPendentes: relatoriosPendentes || 0
      };
    },
    enabled: !!effectiveUserId
  });

  // Buscar projetos recentes
  const { data: projetos, isLoading: projetosLoading } = useQuery({
    queryKey: ['recent-projects', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];

      const { data, error } = await supabase
        .from('projetos')
        .select(`
          *,
          cliente:clientes(nome)
        `)
        .eq('consultora_id', effectiveUserId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!effectiveUserId
  });

  // Buscar próximos eventos
  const { data: eventos, isLoading: eventosLoading } = useQuery({
    queryKey: ['upcoming-events', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];

      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          cliente:clientes(nome)
        `)
        .eq('consultora_id', effectiveUserId)
        .gte('data_hora', new Date().toISOString())
        .eq('status', 'agendado')
        .order('data_hora', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!effectiveUserId
  });

  // Buscar alertas não lidos
  const { data: alertas, isLoading: alertasLoading } = useQuery({
    queryKey: ['alerts', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];

      const { data, error } = await supabase
        .from('alertas')
        .select('*')
        .eq('consultora_id', effectiveUserId)
        .eq('lido', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!effectiveUserId
  });

  return {
    stats,
    projetos,
    eventos,
    alertas,
    isLoading: statsLoading || projetosLoading || eventosLoading || alertasLoading
  };
}
