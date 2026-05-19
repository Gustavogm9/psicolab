import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface TendenciaMetrica {
  valor: number;
  variacao: number;
  textoVariacao: string;
  tipo: 'positivo' | 'negativo' | 'neutro';
}

interface TendenciasDados {
  questionarios: TendenciaMetrica;
  respostas: TendenciaMetrica;
  leads: TendenciaMetrica;
  conversao: TendenciaMetrica;
}

const calcularVariacao = (atual: number, anterior: number): { variacao: number; texto: string; tipo: 'positivo' | 'negativo' | 'neutro' } => {
  if (anterior === 0 && atual === 0) {
    return { variacao: 0, texto: 'Aguardando dados', tipo: 'neutro' };
  }
  if (anterior === 0 && atual > 0) {
    return { variacao: 100, texto: 'Novo', tipo: 'positivo' };
  }
  
  const variacaoPercentual = ((atual - anterior) / anterior) * 100;
  const sinal = variacaoPercentual > 0 ? '+' : '';
  const tipo = variacaoPercentual >= 0 ? 'positivo' : 'negativo';
  
  return {
    variacao: variacaoPercentual,
    texto: `${sinal}${Math.abs(Math.round(variacaoPercentual))}% vs período anterior`,
    tipo
  };
};

export const useTendenciasDiagnosticos = () => {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['tendencias-diagnosticos', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const userId = effectiveUserId;
      const hoje = new Date();
      const inicioAtual = subDays(hoje, 30);
      const inicioAnterior = subDays(hoje, 60);
      const fimAnterior = subDays(hoje, 31);

      // Buscar questionários
      const { data: questionariosAtuais } = await supabase
        .from('questionarios_diagnostico')
        .select('id')
        .eq('consultora_id', userId)
        .gte('created_at', inicioAtual.toISOString());

      const { data: questionariosAnteriores } = await supabase
        .from('questionarios_diagnostico')
        .select('id')
        .eq('consultora_id', userId)
        .gte('created_at', inicioAnterior.toISOString())
        .lte('created_at', fimAnterior.toISOString());

      // Buscar respostas
      const { data: respostasAtuais } = await supabase
        .from('respostas_diagnostico')
        .select(`
          id,
          questionario:questionarios_diagnostico!inner(consultora_id)
        `)
        .eq('questionario.consultora_id', userId)
        .gte('data_inicio', inicioAtual.toISOString());

      const { data: respostasAnteriores } = await supabase
        .from('respostas_diagnostico')
        .select(`
          id,
          questionario:questionarios_diagnostico!inner(consultora_id)
        `)
        .eq('questionario.consultora_id', userId)
        .gte('data_inicio', inicioAnterior.toISOString())
        .lte('data_inicio', fimAnterior.toISOString());

      // Buscar leads
      const { data: leadsAtuais } = await supabase
        .from('leads_diagnostico')
        .select('id')
        .eq('consultora_id', userId)
        .gte('created_at', inicioAtual.toISOString());

      const { data: leadsAnteriores } = await supabase
        .from('leads_diagnostico')
        .select('id')
        .eq('consultora_id', userId)
        .gte('created_at', inicioAnterior.toISOString())
        .lte('created_at', fimAnterior.toISOString());

      // Calcular métricas
      const qtdQuestionariosAtual = questionariosAtuais?.length || 0;
      const qtdQuestionariosAnterior = questionariosAnteriores?.length || 0;

      const qtdRespostasAtual = respostasAtuais?.length || 0;
      const qtdRespostasAnterior = respostasAnteriores?.length || 0;

      const qtdLeadsAtual = leadsAtuais?.length || 0;
      const qtdLeadsAnterior = leadsAnteriores?.length || 0;

      const conversaoAtual = qtdRespostasAtual > 0 ? (qtdLeadsAtual / qtdRespostasAtual) * 100 : 0;
      const conversaoAnterior = qtdRespostasAnterior > 0 ? (qtdLeadsAnterior / qtdRespostasAnterior) * 100 : 0;

      // Calcular variações
      const variacaoQuestionarios = calcularVariacao(qtdQuestionariosAtual, qtdQuestionariosAnterior);
      const variacaoRespostas = calcularVariacao(qtdRespostasAtual, qtdRespostasAnterior);
      const variacaoLeads = calcularVariacao(qtdLeadsAtual, qtdLeadsAnterior);
      const variacaoConversao = calcularVariacao(conversaoAtual, conversaoAnterior);

      const resultado: TendenciasDados = {
        questionarios: {
          valor: qtdQuestionariosAtual,
          variacao: variacaoQuestionarios.variacao,
          textoVariacao: variacaoQuestionarios.texto,
          tipo: variacaoQuestionarios.tipo
        },
        respostas: {
          valor: qtdRespostasAtual,
          variacao: variacaoRespostas.variacao,
          textoVariacao: variacaoRespostas.texto,
          tipo: variacaoRespostas.tipo
        },
        leads: {
          valor: qtdLeadsAtual,
          variacao: variacaoLeads.variacao,
          textoVariacao: variacaoLeads.texto,
          tipo: variacaoLeads.tipo
        },
        conversao: {
          valor: conversaoAtual,
          variacao: variacaoConversao.variacao,
          textoVariacao: variacaoConversao.texto,
          tipo: variacaoConversao.tipo
        }
      };

      return resultado;
    },
  });
};
