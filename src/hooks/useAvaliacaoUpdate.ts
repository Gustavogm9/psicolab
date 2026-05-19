import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { generateSlug } from '@/lib/utils';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/error-messages';

interface AvaliacaoUpdateData {
  id: string;
  nome?: string;
  descricao?: string;
  tipo?: string;
  status?: 'rascunho' | 'ativa' | 'pausada' | 'finalizada';
  tipo_acesso?: 'publico' | 'restrito';
  permite_auto_identificacao?: boolean;
  data_inicio?: string;
  data_fim?: string;
  cliente_id?: string;
  configuracoes?: any;
  slug?: string;
  questoes?: Array<{
    id?: string;
    pergunta: string;
    tipo: 'multipla_escolha' | 'escala' | 'texto_livre' | 'sim_nao';
    opcoes?: any;
    obrigatoria: boolean;
    categoria?: string;
    ordem: number;
  }>;
}

export const useAvaliacaoUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AvaliacaoUpdateData) => {
      const { id, questoes, ...avaliacaoData } = data;

      // Gerar slug se tipo_acesso é público OU restrito com auto-identificação
      let updateData = { ...avaliacaoData };
      
      const precisaSlug = data.tipo_acesso === 'publico' || 
        (data.tipo_acesso === 'restrito' && data.permite_auto_identificacao);
      
      if (precisaSlug && data.nome) {
        // Verificar se já tem slug
        const { data: current } = await supabase
          .from('avaliacoes')
          .select('slug')
          .eq('id', id)
          .single();
        
        if (!current?.slug) {
          let baseSlug = generateSlug(data.nome);
          let slug = baseSlug;
          let counter = 1;
          
          // Verificar se slug já existe
          while (true) {
            const { data: existing } = await supabase
              .from('avaliacoes')
              .select('id')
              .eq('slug', slug)
              .neq('id', id)
              .maybeSingle();
            
            if (!existing) break;
            
            slug = `${baseSlug}-${counter}`;
            counter++;
          }
          
          updateData = { ...updateData, slug };
        }
      }

      const { error: avaliacaoError } = await supabase
        .from('avaliacoes')
        .update(updateData)
        .eq('id', id);

      if (avaliacaoError) throw avaliacaoError;

      if (questoes) {
        // Obter os IDs das questões que vieram do form (que já existem no banco)
        const idsParaManter = questoes
            .map(q => q.id)
            .filter(id => id && !id.startsWith('temp-') && !id.startsWith('copsoq-'));

        // Remover apenas as questões que não estão na nova lista
        if (idsParaManter.length > 0) {
          const { error: deleteError } = await supabase
            .from('avaliacoes_questoes')
            .delete()
            .eq('avaliacao_id', id)
            .not('id', 'in', `(${idsParaManter.join(',')})`);

          if (deleteError) throw deleteError;
        } else {
          // Se não há nenhum ID para manter, removemos todas
          const { error: deleteError } = await supabase
            .from('avaliacoes_questoes')
            .delete()
            .eq('avaliacao_id', id);

          if (deleteError) throw deleteError;
        }

        // Insere ou atualiza as questões
        if (questoes.length > 0) {
          const questoesComAvaliacao = questoes.map(q => {
            const payload: any = {
              pergunta: q.pergunta,
              tipo: q.tipo,
              opcoes: q.opcoes,
              obrigatoria: q.obrigatoria,
              categoria: q.categoria,
              ordem: q.ordem,
              avaliacao_id: id,
            };

            // Se tiver um ID real do banco, passamos para upsert
            if (q.id && !q.id.startsWith('temp-') && !q.id.startsWith('copsoq-')) {
              payload.id = q.id;
            }

            return payload;
          });

          const { error: questoesError } = await supabase
            .from('avaliacoes_questoes')
            .upsert(questoesComAvaliacao);

          if (questoesError) throw questoesError;
        }
      }

      return { id };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
      queryClient.invalidateQueries({ queryKey: ['avaliacao', variables.id] });
      const message = getSuccessMessage({ action: 'atualizar', entity: 'avaliação', gender: 'a' });
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar avaliação',
        description: getUserFriendlyError(error, { action: 'atualizar', entity: 'avaliação' }),
        variant: 'destructive',
      });
    },
  });
};
