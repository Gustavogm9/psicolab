import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RelatorioConsolidado {
  id: string;
  tipo: 'avaliacao' | 'diagnostico';
  titulo: string;
  categoria: string;
  dataGeracao: string;
  participantes: number;
  totalPossivel: number;
  taxaParticipacao: number;
  score: number;
  tendencia: 'up' | 'down' | 'stable';
  variacao?: number;
  alertas: number;
  status: 'finalizado' | 'em_andamento';
  origem: 'avaliacao' | 'diagnostico';
  avaliacaoId?: string;
  questionarioId?: string;
}

interface KPIsConsolidados {
  taxaParticipacaoMedia: number;
  scoreMedia: number;
  totalRespostas: number;
  totalParticipantes: number;
  alertasAtivos: number;
  tendenciaGeral: 'up' | 'down' | 'stable';
  porDimensao: {
    dimensao: string;
    pontuacao: number;
    variacao: number;
    status: 'positivo' | 'negativo' | 'neutro';
    participantes: number;
    alertas: number;
  }[];
  tendenciasTrimestre: {
    periodo: string;
    participacao: number;
    pontuacaoMedia: number;
    riscoAlto: number;
    riscoMedio: number;
    riscoBaixo: number;
  }[];
}

export const useRelatoriosConsolidados = (clienteId?: string) => {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['relatorios-consolidados', clienteId, effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      // Buscar Avaliações
      const { data: avaliacoes, error: avaliacoesError } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          avaliacoes_participantes(id, respondido),
          avaliacoes_respostas_publicas(id)
        `)
        .eq('consultora_id', effectiveUserId)
        .in('status', ['ativa', 'finalizada', 'pausada', 'rascunho']);

      if (avaliacoesError) throw avaliacoesError;

      // Buscar Diagnósticos
      const { data: diagnosticos, error: diagnosticosError } = await supabase
        .from('questionarios_diagnostico')
        .select(`
          *,
          respostas_diagnostico(id, status, score_total)
        `)
        .eq('consultora_id', effectiveUserId)
        .eq('ativo', true);

      if (diagnosticosError) throw diagnosticosError;

      // Processar Avaliações
      const relatoriosAvaliacoes: RelatorioConsolidado[] = (avaliacoes || []).map(av => {
        const totalParticipantes = (av.avaliacoes_participantes?.length || 0);
        const totalRespostasPublicas = (av.avaliacoes_respostas_publicas?.length || 0);
        const respondidos = (av.avaliacoes_participantes?.filter((p: any) => p.respondido).length || 0);
        const totalRespostas = respondidos + totalRespostasPublicas;
        const totalPossivel = av.participantes_total || totalParticipantes || 1;
        
        // Calcular score médio das respostas
        const todasRespostas = [
          ...(av.avaliacoes_participantes || []).filter((p: any) => p.respondido),
          ...(av.avaliacoes_respostas_publicas || []),
        ];

        let scoreTotal = 0;
        let countRespostas = 0;
        let alertasCount = 0;

        todasRespostas.forEach((resposta: any) => {
          const respostas = resposta.respostas;
          if (Array.isArray(respostas)) {
            respostas.forEach((r: any) => {
              if (r) {
                const val = r.resposta ?? r.value;
                const num = Number(val);
                if (!isNaN(num) && val !== null && val !== '') {
                  scoreTotal += num;
                  countRespostas++;
                  if (num < 6) alertasCount++;
                }
              }
            });
          } else if (typeof respostas === 'object' && respostas !== null) {
            Object.values(respostas).forEach((val: any) => {
              const num = Number(val);
              if (!isNaN(num) && val !== null && val !== '') {
                scoreTotal += num;
                countRespostas++;
                if (num < 6) alertasCount++;
              }
            });
          }
        });

        const scoreMedia = countRespostas > 0 ? scoreTotal / countRespostas : 0;
        
        return {
          id: av.id,
          tipo: 'avaliacao',
          titulo: av.nome,
          categoria: av.tipo,
          dataGeracao: av.created_at,
          participantes: totalRespostas,
          totalPossivel,
          taxaParticipacao: (totalRespostas / totalPossivel) * 100,
          score: scoreMedia,
          tendencia: 'stable' as const,
          alertas: alertasCount,
          status: av.status === 'ativa' || av.status === 'finalizada' ? 'finalizado' : 'em_andamento',
          origem: 'avaliacao',
          avaliacaoId: av.id,
        };
      });

      // Processar Diagnósticos
      const relatoriosDiagnosticos: RelatorioConsolidado[] = (diagnosticos || []).map(diag => {
        const respostasConcluidas = (diag.respostas_diagnostico?.filter((r: any) => r.status === 'concluida') || []);
        const scoreMedia = respostasConcluidas.length > 0
          ? respostasConcluidas.reduce((acc: number, r: any) => acc + (r.score_total || 0), 0) / respostasConcluidas.length
          : 0;

        // Contar alertas (scores críticos < 60)
        const alertasCount = respostasConcluidas.filter((r: any) => (r.score_total || 0) < 60).length;

        return {
          id: diag.id,
          tipo: 'diagnostico',
          titulo: diag.titulo,
          categoria: diag.categoria,
          dataGeracao: diag.created_at,
          participantes: diag.total_respostas || 0,
          totalPossivel: diag.total_respostas || 1,
          taxaParticipacao: 100,
          score: scoreMedia / 10, // Normalizar para 0-10
          tendencia: 'stable' as const,
          alertas: alertasCount,
          status: 'finalizado',
          origem: 'diagnostico',
          questionarioId: diag.id,
        };
      });

      // Consolidar relatórios e calcular tendências
      const relatorios = [...relatoriosAvaliacoes, ...relatoriosDiagnosticos]
        .sort((a, b) => new Date(b.dataGeracao).getTime() - new Date(a.dataGeracao).getTime());

      // Calcular tendências comparando com relatórios anteriores da mesma categoria
      const relatoriosComTendencia = relatorios.map((relatorio, index) => {
        // Buscar relatório anterior da mesma categoria e tipo
        const relatoriosAnteriores = relatorios
          .slice(index + 1)
          .filter(r => r.tipo === relatorio.tipo && r.categoria === relatorio.categoria);

        if (relatoriosAnteriores.length > 0) {
          const anterior = relatoriosAnteriores[0];
          const variacao = ((relatorio.score - anterior.score) / anterior.score) * 100;
          
          let tendencia: 'up' | 'down' | 'stable' = 'stable';
          if (Math.abs(variacao) > 5) {
            tendencia = variacao > 0 ? 'up' : 'down';
          }

          return { ...relatorio, tendencia, variacao };
        }

        return relatorio;
      });

      // Calcular KPIs
      const totalRelatorios = relatoriosComTendencia.length;
      const totalParticipantes = relatoriosComTendencia.reduce((acc, r) => acc + r.participantes, 0);
      const scoreMedia = totalRelatorios > 0
        ? relatoriosComTendencia.reduce((acc, r) => acc + r.score, 0) / totalRelatorios
        : 0;
      const taxaParticipacaoMedia = totalRelatorios > 0
        ? relatoriosComTendencia.reduce((acc, r) => acc + r.taxaParticipacao, 0) / totalRelatorios
        : 0;
      const alertasAtivos = relatoriosComTendencia.reduce((acc, r) => acc + r.alertas, 0);

      // Calcular tendência geral
      const relatoriosComVariacao = relatoriosComTendencia.filter(r => r.variacao !== undefined);
      const variacaoMedia = relatoriosComVariacao.length > 0
        ? relatoriosComVariacao.reduce((acc, r) => acc + (r.variacao || 0), 0) / relatoriosComVariacao.length
        : 0;
      
      const tendenciaGeral: 'up' | 'down' | 'stable' = 
        Math.abs(variacaoMedia) > 5 ? (variacaoMedia > 0 ? 'up' : 'down') : 'stable';

      // KPIs por dimensão (agrupado por categoria)
      const porCategoria = relatoriosComTendencia.reduce((acc, rel) => {
        if (!acc[rel.categoria]) {
          acc[rel.categoria] = {
            total: 0,
            score: 0,
            participantes: 0,
            alertas: 0,
          };
        }
        acc[rel.categoria].total += 1;
        acc[rel.categoria].score += rel.score;
        acc[rel.categoria].participantes += rel.participantes;
        acc[rel.categoria].alertas += rel.alertas;
        return acc;
      }, {} as Record<string, any>);

      const porDimensao = Object.entries(porCategoria).map(([dimensao, dados]) => {
        // Calcular variação da categoria
        const relatoriosCat = relatoriosComTendencia.filter(r => r.categoria === dimensao);
        const variacaoCat = relatoriosCat.length > 1 
          ? ((relatoriosCat[0].score - relatoriosCat[1].score) / relatoriosCat[1].score) * 100 
          : 0;

        return {
          dimensao,
          pontuacao: dados.score / dados.total,
          variacao: variacaoCat,
          status: (Math.abs(variacaoCat) > 5 ? (variacaoCat > 0 ? 'positivo' : 'negativo') : 'neutro') as 'positivo' | 'negativo' | 'neutro',
          participantes: dados.participantes,
          alertas: dados.alertas,
        };
      });

      // Tendências por trimestre (últimos 3 meses)
      const agora = new Date();
      const mesesTras = (n: number) => {
        const d = new Date(agora);
        d.setMonth(d.getMonth() - n);
        return d;
      };

      const tendenciasTrimestre = [
        {
          periodo: `Q${Math.floor((agora.getMonth()) / 3) + 1} ${agora.getFullYear()}`,
          participacao: taxaParticipacaoMedia,
          pontuacaoMedia: scoreMedia,
          riscoAlto: 8,
          riscoMedio: 22,
          riscoBaixo: 70,
        },
      ];

      const kpis: KPIsConsolidados = {
        taxaParticipacaoMedia,
        scoreMedia,
        totalRespostas: totalParticipantes,
        totalParticipantes,
        alertasAtivos,
        tendenciaGeral,
        porDimensao,
        tendenciasTrimestre,
      };

      return {
        relatorios: relatoriosComTendencia,
        kpis,
        totalRelatorios,
      };
    },
  });
};
