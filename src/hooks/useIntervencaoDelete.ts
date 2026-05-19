import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError, getSuccessMessage } from "@/lib/error-messages";

export function useIntervencaoDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('intervencoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intervencoes'] });
      const message = getSuccessMessage({ action: 'deletar', entity: 'intervenção', gender: 'a' });
      toast.success(message.description);
    },
    onError: (error: Error) => {
      toast.error(getUserFriendlyError(error, { action: 'deletar', entity: 'intervenção' }));
    },
  });
}
