import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/error-messages';
import { useAuth } from '@/contexts/AuthContext';

interface Questao {
  texto: string;
  tipo: 'escala' | 'multipla_escolha' | 'sim_nao' | 'texto_livre';
  ordem: number;
  opcoes?: any;
  obrigatoria?: boolean;
  peso?: number;
}

interface CreateQuestionarioData {
  titulo: string;
  descricao?: string;
  slug: string;
  categoria: string;
  clienteId?: string;
  tempoEstimado?: number;
  configuracoes?: any;
  questoes: Questao[];
}

export const useQuestionarioCreate = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateQuestionarioData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      // Inserir questionário
      const { data: questionario, error: questionarioError } = await supabase
        .from('questionarios_diagnostico')
        .insert({
          consultora_id: effectiveUserId,
          titulo: data.titulo,
          descricao: data.descricao,
          slug: data.slug,
          categoria: data.categoria,
          cliente_id: data.clienteId && data.clienteId !== '' && data.clienteId !== 'none' ? data.clienteId : null,
          tempo_estimado: data.tempoEstimado || 5,
          configuracoes: data.configuracoes,
        })
        .select()
        .single();

      if (questionarioError) throw questionarioError;

      // Inserir questões
      if (data.questoes.length > 0) {
        const questoesComQuestionarioId = data.questoes.map(q => ({
          ...q,
          questionario_id: questionario.id,
        }));

        const { error: questoesError } = await supabase
          .from('questoes_diagnostico')
          .insert(questoesComQuestionarioId);

        if (questoesError) throw questoesError;
      }

      return questionario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionarios'] });
      const message = getSuccessMessage({ action: 'criar', entity: 'questionário', gender: 'o' });
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar questionário',
        description: getUserFriendlyError(error, { action: 'criar', entity: 'questionário' }),
        variant: 'destructive',
      });
    },
  });
};
