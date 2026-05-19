import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError, getSuccessMessage } from "@/lib/error-messages";

export interface IntervencaoUpdateData {
  titulo?: string;
  descricao?: string;
  categoria?: string;
  status?: string;
  prioridade?: string;
  data_inicio?: string;
  data_fim?: string;
  duracao_estimada?: number;
  responsavel?: string;
  participantes?: string[];
  custo_estimado?: number;
  resultados_esperados?: string;
  resultados_obtidos?: string;
  progresso?: number;
  cliente_id?: string;
}

export function useIntervencaoUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: IntervencaoUpdateData }) => {
      const { data: intervencao, error } = await supabase
        .from('intervencoes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return intervencao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intervencoes'] });
      const message = getSuccessMessage({ action: 'atualizar', entity: 'intervenção', gender: 'a' });
      toast.success(message.description);
    },
    onError: (error: Error) => {
      toast.error(getUserFriendlyError(error, { action: 'atualizar', entity: 'intervenção' }));
    },
  });
}
