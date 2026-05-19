import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/error-messages';

export const useAvaliacaoDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avaliacaoId: string) => {
      const { error } = await supabase
        .from('avaliacoes')
        .delete()
        .eq('id', avaliacaoId);

      if (error) throw error;
      return avaliacaoId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
      const message = getSuccessMessage({ action: 'deletar', entity: 'avaliação', gender: 'a' });
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir avaliação',
        description: getUserFriendlyError(error, { action: 'deletar', entity: 'avaliação' }),
        variant: 'destructive',
      });
    },
  });
};
