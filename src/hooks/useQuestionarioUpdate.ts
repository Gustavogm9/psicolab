import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/error-messages';

interface UpdateQuestionarioData {
  id: string;
  titulo?: string;
  descricao?: string;
  categoria?: string;
  clienteId?: string;
  ativo?: boolean;
  tempoEstimado?: number;
  configuracoes?: any;
  questoes?: Array<{
    texto: string;
    tipo: 'escala' | 'multipla_escolha' | 'sim_nao' | 'texto_livre';
    opcoes?: string[];
    obrigatoria: boolean;
    peso: number;
  }>;
}

export const useQuestionarioUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateQuestionarioData) => {
      const { id, ...updateData } = data;

      const { data: questionario, error } = await supabase
        .from('questionarios_diagnostico')
        .update({
          ...(updateData.titulo && { titulo: updateData.titulo }),
          ...(updateData.descricao !== undefined && { descricao: updateData.descricao }),
          ...(updateData.categoria && { categoria: updateData.categoria }),
          ...(updateData.clienteId !== undefined && { cliente_id: updateData.clienteId }),
          ...(updateData.ativo !== undefined && { ativo: updateData.ativo }),
          ...(updateData.tempoEstimado && { tempo_estimado: updateData.tempoEstimado }),
          ...(updateData.configuracoes && { configuracoes: updateData.configuracoes }),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar questões se fornecidas
      if (updateData.questoes !== undefined) {
        // 1. Deletar questões antigas
        const { error: deleteError } = await supabase
          .from('questoes_diagnostico')
          .delete()
          .eq('questionario_id', id);

        if (deleteError) throw deleteError;

        // 2. Inserir novas questões com ordem
        if (updateData.questoes.length > 0) {
          const questoesFormatadas = updateData.questoes.map((q, index) => ({
            questionario_id: id,
            texto: q.texto,
            tipo: q.tipo,
            opcoes: q.opcoes || null,
            obrigatoria: q.obrigatoria,
            peso: q.peso,
            ordem: index
          }));

          const { error: questoesError } = await supabase
            .from('questoes_diagnostico')
            .insert(questoesFormatadas);

          if (questoesError) throw questoesError;
        }
      }

      return questionario;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questionarios'] });
      queryClient.invalidateQueries({ queryKey: ['questionario', data.id] });
      const message = getSuccessMessage({ action: 'atualizar', entity: 'questionário', gender: 'o' });
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar questionário',
        description: getUserFriendlyError(error, { action: 'atualizar', entity: 'questionário' }),
        variant: 'destructive',
      });
    },
  });
};
