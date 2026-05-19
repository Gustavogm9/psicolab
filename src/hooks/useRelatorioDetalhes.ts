import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRelatorioAvaliacao } from './useRelatorioAvaliacao';
import { useAvaliacaoDetalhes } from './useAvaliacaoDetalhes';
import { useRespostasQuestionario } from './useRespostasQuestionario';
import { useQuestionarioDetalhes } from './useQuestionarioDetalhes';

interface RelatorioDetalhado {
  id: string;
  tipo: 'avaliacao' | 'diagnostico';
  titulo: string;
  categoria: string;
  dataGeracao: string;
  totalParticipantes: number;
  totalRespostas: number;
  taxaParticipacao: number;
  scoreGeral: number;
  tendencia: 'up' | 'down' | 'stable';
  variacao: number;
  scoresPorCategoria: {
    categoria: string;
    score: number;
    total: number;
    porcentagem: number;
  }[];
  distribuicaoRespostas: {
    faixa: string;
    quantidade: number;
    porcentagem: number;
  }[];
  respostas: any[];
  questoes: any[];
  departamentos?: {
    nome: string;
    participantes: number;
    score: number;
    tendencia: 'up' | 'down' | 'stable';
  }[];
  insights: {
    tipo: 'alerta' | 'destaque' | 'observacao';
    titulo: string;
    descricao: string;
  }[];
  recomendacoes: {
    prioridade: 'alta' | 'media' | 'baixa';
    titulo: string;
    descricao: string;
    categoria: string;
  }[];
}

export const useRelatorioDetalhes = (id: string | undefined, tipo: 'avaliacao' | 'diagnostico') => {
  const avaliacaoDetalhes = useAvaliacaoDetalhes(tipo === 'avaliacao' ? id : undefined);
  const avaliacaoRespostas = useRelatorioAvaliacao(tipo === 'avaliacao' ? id : undefined);
  const diagnosticoDetalhes = useQuestionarioDetalhes(tipo === 'diagnostico' ? id : undefined);
  const diagnosticoRespostas = useRespostasQuestionario(
    tipo === 'diagnostico' ? (id || '') : '',
    tipo === 'diagnostico' ? { status: 'concluida' as const } : undefined
  );

  return useQuery({
    queryKey: ['relatorio-detalhado', id, tipo],
    queryFn: async (): Promise<RelatorioDetalhado> => {
      if (!id) throw new Error('ID não fornecido');

      if (tipo === 'avaliacao') {
        const avaliacao = avaliacaoDetalhes.data;
        const respostas = avaliacaoRespostas.data;

        if (!avaliacao || !respostas) throw new Error('Dados não carregados');

        const todasRespostas = respostas.todasRespostas || [];
        const questoes = avaliacao.questoes || [];

        // Calcular scores por categoria
        const scoresPorCategoria = questoes.reduce((acc: any[], questao: any) => {
          const categoria = questao.categoria || 'Geral';
          const respostasQuestao = todasRespostas.flatMap((r: any) => 
            (r.respostas || []).filter((resp: any) => resp.questao_id === questao.id)
          );

          const scoreTotal = respostasQuestao.reduce((sum: number, resp: any) => {
            const valor = typeof resp.resposta === 'number' ? resp.resposta : 0;
            return sum + valor;
          }, 0);

          const categoriaExistente = acc.find(c => c.categoria === categoria);
          if (categoriaExistente) {
            categoriaExistente.score += scoreTotal;
            categoriaExistente.total += respostasQuestao.length;
          } else {
            acc.push({
              categoria,
              score: scoreTotal,
              total: respostasQuestao.length,
              porcentagem: 0,
            });
          }
          return acc;
        }, []);

        scoresPorCategoria.forEach(cat => {
          cat.score = cat.total > 0 ? (cat.score / cat.total) : 0;
          cat.porcentagem = (cat.score / 10) * 100;
        });

        // Calcular score geral
        const scoreGeral = scoresPorCategoria.length > 0
          ? scoresPorCategoria.reduce((sum, cat) => sum + cat.score, 0) / scoresPorCategoria.length
          : 0;

        // Distribuição de respostas por faixa
        const distribuicao = todasRespostas.reduce((acc: any, resposta: any) => {
          const respostasNumericas = (resposta.respostas || [])
            .filter((r: any) => typeof r.resposta === 'number')
            .map((r: any) => r.resposta);

          respostasNumericas.forEach((valor: number) => {
            if (valor >= 9) acc.excelente++;
            else if (valor >= 7) acc.bom++;
            else if (valor >= 5) acc.regular++;
            else acc.critico++;
          });

          return acc;
        }, { excelente: 0, bom: 0, regular: 0, critico: 0 });

        const totalDist = distribuicao.excelente + distribuicao.bom + distribuicao.regular + distribuicao.critico;
        const distribuicaoRespostas = [
          { faixa: 'Excelente (9-10)', quantidade: distribuicao.excelente, porcentagem: (distribuicao.excelente / totalDist) * 100 },
          { faixa: 'Bom (7-8)', quantidade: distribuicao.bom, porcentagem: (distribuicao.bom / totalDist) * 100 },
          { faixa: 'Regular (5-6)', quantidade: distribuicao.regular, porcentagem: (distribuicao.regular / totalDist) * 100 },
          { faixa: 'Crítico (0-4)', quantidade: distribuicao.critico, porcentagem: (distribuicao.critico / totalDist) * 100 },
        ];

        // Gerar insights automáticos
        const insights = [];
        const recomendacoes = [];

        if (respostas.totalRespostas === 0) {
          insights.push({
            tipo: 'alerta' as const,
            titulo: 'Sem Respostas',
            descricao: 'Nenhuma resposta foi registrada para esta avaliação ainda.',
          });
        } else {
          const taxaParticipacao = (respostas.totalRespostas / (avaliacao.participantes_total || 1)) * 100;
          
          if (taxaParticipacao < 50) {
            insights.push({
              tipo: 'alerta' as const,
              titulo: 'Taxa de Participação Baixa',
              descricao: `Apenas ${taxaParticipacao.toFixed(0)}% dos convidados responderam. Considere enviar lembretes.`,
            });
            recomendacoes.push({
              prioridade: 'alta' as const,
              titulo: 'Aumentar Engajamento',
              descricao: 'Enviar lembretes aos participantes que ainda não responderam',
              categoria: 'Comunicação',
            });
          }

          if (scoreGeral < 6) {
            insights.push({
              tipo: 'alerta' as const,
              titulo: 'Score Geral Crítico',
              descricao: `Score médio de ${scoreGeral.toFixed(1)} indica necessidade de atenção urgente.`,
            });
            recomendacoes.push({
              prioridade: 'alta' as const,
              titulo: 'Plano de Ação Imediato',
              descricao: 'Desenvolver estratégias de intervenção para melhorar os indicadores críticos',
              categoria: 'Gestão',
            });
          } else if (scoreGeral >= 8) {
            insights.push({
              tipo: 'destaque' as const,
              titulo: 'Resultado Positivo',
              descricao: `Score médio de ${scoreGeral.toFixed(1)} indica bom desempenho geral.`,
            });
          }

          // Insights por categoria
          scoresPorCategoria.forEach(cat => {
            if (cat.score < 6) {
              insights.push({
                tipo: 'alerta' as const,
                titulo: `${cat.categoria} Necessita Atenção`,
                descricao: `Score de ${cat.score.toFixed(1)} está abaixo do esperado.`,
              });
              recomendacoes.push({
                prioridade: 'media' as const,
                titulo: `Melhorar ${cat.categoria}`,
                descricao: `Implementar ações focadas em ${cat.categoria}`,
                categoria: cat.categoria,
              });
            }
          });

          if (distribuicao.critico > totalDist * 0.2) {
            insights.push({
              tipo: 'alerta' as const,
              titulo: 'Alto Índice de Respostas Críticas',
              descricao: `${((distribuicao.critico / totalDist) * 100).toFixed(0)}% das respostas estão na faixa crítica (0-4).`,
            });
          }
        }

        return {
          id: avaliacao.id,
          tipo: 'avaliacao',
          titulo: avaliacao.nome,
          categoria: avaliacao.tipo,
          dataGeracao: avaliacao.created_at,
          totalParticipantes: avaliacao.participantes_total || 0,
          totalRespostas: respostas.totalRespostas,
          taxaParticipacao: (respostas.totalRespostas / (avaliacao.participantes_total || 1)) * 100,
          scoreGeral,
          tendencia: 'stable',
          variacao: 0,
          scoresPorCategoria,
          distribuicaoRespostas,
          respostas: todasRespostas,
          questoes,
          insights,
          recomendacoes,
        };
      } else {
        // Diagnóstico
        const diagnostico = diagnosticoDetalhes.data;
        const respostas = diagnosticoRespostas.data;

        if (!diagnostico || !respostas) throw new Error('Dados não carregados');

        const questoes = diagnostico.questoes || [];
        const respostasConcluidas = respostas.filter((r: any) => r.status === 'concluida');

        // Calcular score médio
        const scoreGeral = respostasConcluidas.length > 0
          ? respostasConcluidas.reduce((sum: number, r: any) => sum + (r.score_total || 0), 0) / respostasConcluidas.length / 10
          : 0;

        // Scores por categoria (baseado nas questões)
        const categorias = [...new Set(questoes.map((q: any) => q.categoria || 'Geral'))];
        const scoresPorCategoria = categorias.map(categoria => {
          const questoesCategoria = questoes.filter((q: any) => (q.categoria || 'Geral') === categoria);
          const totalQuestoes = questoesCategoria.length;
          
          return {
            categoria: categoria as string,
            score: scoreGeral * (totalQuestoes / questoes.length),
            total: totalQuestoes,
            porcentagem: scoreGeral * 10 * (totalQuestoes / questoes.length),
          };
        });

        // Distribuição por faixa de score
        const distribuicao = respostasConcluidas.reduce((acc: any, r: any) => {
          const score = (r.score_total || 0) / 10;
          if (score >= 9) acc.excelente++;
          else if (score >= 7) acc.bom++;
          else if (score >= 5) acc.regular++;
          else acc.critico++;
          return acc;
        }, { excelente: 0, bom: 0, regular: 0, critico: 0 });

        const totalDist = distribuicao.excelente + distribuicao.bom + distribuicao.regular + distribuicao.critico;
        const distribuicaoRespostas = [
          { faixa: 'Excelente (9-10)', quantidade: distribuicao.excelente, porcentagem: totalDist > 0 ? (distribuicao.excelente / totalDist) * 100 : 0 },
          { faixa: 'Bom (7-8)', quantidade: distribuicao.bom, porcentagem: totalDist > 0 ? (distribuicao.bom / totalDist) * 100 : 0 },
          { faixa: 'Regular (5-6)', quantidade: distribuicao.regular, porcentagem: totalDist > 0 ? (distribuicao.regular / totalDist) * 100 : 0 },
          { faixa: 'Crítico (0-4)', quantidade: distribuicao.critico, porcentagem: totalDist > 0 ? (distribuicao.critico / totalDist) * 100 : 0 },
        ];

        // Gerar insights
        const insights = [];
        const recomendacoes = [];

        if (respostasConcluidas.length === 0) {
          insights.push({
            tipo: 'alerta' as const,
            titulo: 'Sem Respostas Concluídas',
            descricao: 'Nenhuma resposta foi concluída para este diagnóstico ainda.',
          });
        } else {
          if (scoreGeral < 6) {
            insights.push({
              tipo: 'alerta' as const,
              titulo: 'Score Geral Crítico',
              descricao: `Score médio de ${scoreGeral.toFixed(1)} indica necessidade de atenção urgente.`,
            });
            recomendacoes.push({
              prioridade: 'alta' as const,
              titulo: 'Estratégia de Captação',
              descricao: 'Desenvolver abordagem personalizada para leads com score crítico',
              categoria: 'Vendas',
            });
          } else if (scoreGeral >= 8) {
            insights.push({
              tipo: 'destaque' as const,
              titulo: 'Oportunidades Qualificadas',
              descricao: `Score médio de ${scoreGeral.toFixed(1)} indica leads com alto potencial.`,
            });
            recomendacoes.push({
              prioridade: 'alta' as const,
              titulo: 'Priorizar Contato',
              descricao: 'Entrar em contato prioritário com leads de alto score',
              categoria: 'Vendas',
            });
          }

          if (distribuicao.critico > totalDist * 0.3) {
            insights.push({
              tipo: 'observacao' as const,
              titulo: 'Perfil de Público Diversificado',
              descricao: `${((distribuicao.critico / totalDist) * 100).toFixed(0)}% dos respondentes têm score crítico. Ajuste a estratégia de abordagem.`,
            });
          }
        }

        return {
          id: diagnostico.id,
          tipo: 'diagnostico',
          titulo: diagnostico.titulo,
          categoria: diagnostico.categoria,
          dataGeracao: diagnostico.created_at,
          totalParticipantes: diagnostico.total_respostas || 0,
          totalRespostas: respostasConcluidas.length,
          taxaParticipacao: 100,
          scoreGeral,
          tendencia: 'stable',
          variacao: 0,
          scoresPorCategoria,
          distribuicaoRespostas,
          respostas: respostasConcluidas,
          questoes,
          insights,
          recomendacoes,
        };
      }
    },
    enabled: !!id && (
      (tipo === 'avaliacao' && !!avaliacaoDetalhes.data && !!avaliacaoRespostas.data) ||
      (tipo === 'diagnostico' && !!diagnosticoDetalhes.data && !!diagnosticoRespostas.data)
    ),
  });
};
