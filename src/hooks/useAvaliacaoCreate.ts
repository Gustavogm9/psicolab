import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { generateSlug } from '@/lib/utils';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/error-messages';
import { useAuth } from '@/contexts/AuthContext';

interface AvaliacaoCreateData {
  nome: string;
  descricao?: string;
  tipo: string;
  status?: 'rascunho' | 'ativa' | 'pausada' | 'finalizada';
  tipo_acesso?: 'publico' | 'restrito';
  permite_auto_identificacao?: boolean;
  data_inicio?: string;
  data_fim?: string;
  cliente_id?: string;
  configuracoes?: any;
  instrumento?: string | null;
  questoes?: Array<{
    id?: string;
    pergunta: string;
    tipo: 'multipla_escolha' | 'escala' | 'texto_livre' | 'sim_nao';
    opcoes?: any;
    obrigatoria: boolean;
    categoria?: string;
    ordem: number;
    peso?: number;
  }>;
}

export const useAvaliacaoCreate = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async (data: AvaliacaoCreateData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { questoes, ...avaliacaoData } = data;

      // Gerar slug automaticamente se for acesso público OU restrito com auto-identificação
      let slug = null;
      const precisaSlug = data.tipo_acesso === 'publico' ||
        (data.tipo_acesso === 'restrito' && data.permite_auto_identificacao);

      if (precisaSlug && data.nome) {
        let baseSlug = generateSlug(data.nome);
        slug = baseSlug;
        let counter = 1;

        // Verificar se slug já existe e adicionar sufixo se necessário
        while (true) {
          const { data: existing } = await supabase
            .from('avaliacoes')
            .select('id')
            .eq('slug', slug)
            .maybeSingle();

          if (!existing) break;

          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      const { data: avaliacao, error: avaliacaoError } = await supabase
        .from('avaliacoes')
        .insert({
          nome: avaliacaoData.nome,
          descricao: avaliacaoData.descricao,
          tipo: avaliacaoData.tipo,
          status: avaliacaoData.status || 'rascunho',
          tipo_acesso: avaliacaoData.tipo_acesso || 'restrito',
          permite_auto_identificacao: avaliacaoData.permite_auto_identificacao || false,
          data_inicio: avaliacaoData.data_inicio || undefined,
          data_fim: avaliacaoData.data_fim || undefined,
          cliente_id: avaliacaoData.cliente_id,
          configuracoes: avaliacaoData.configuracoes,
          instrumento: avaliacaoData.instrumento ?? null,
          slug,
          consultora_id: effectiveUserId,
        })
        .select()
        .single();

      if (avaliacaoError) throw avaliacaoError;

      if (questoes && questoes.length > 0) {
        const questoesComAvaliacao = questoes.map(q => {
          const { id, ...questaoSemId } = q;
          return {
            ...questaoSemId,
            avaliacao_id: avaliacao.id,
          };
        });

        const { error: questoesError } = await supabase
          .from('avaliacoes_questoes')
          .insert(questoesComAvaliacao);

        if (questoesError) throw questoesError;
      }

      return avaliacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
      const message = getSuccessMessage({ action: 'criar', entity: 'avaliação', gender: 'a' });
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar avaliação',
        description: getUserFriendlyError(error, { action: 'criar', entity: 'avaliação' }),
        variant: 'destructive',
      });
    },
  });
};
