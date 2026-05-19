import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/error-messages';

export const useQuestionarioDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('questionarios_diagnostico')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionarios'] });
      const message = getSuccessMessage({ action: 'deletar', entity: 'questionário', gender: 'o' });
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir questionário',
        description: getUserFriendlyError(error, { action: 'deletar', entity: 'questionário' }),
        variant: 'destructive',
      });
    },
  });
};
