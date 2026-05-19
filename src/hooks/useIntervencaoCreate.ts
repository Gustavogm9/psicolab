import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError, getSuccessMessage } from "@/lib/error-messages";
import { useAuth } from "@/contexts/AuthContext";

export interface IntervencaoData {
  titulo: string;
  descricao?: string;
  categoria: string;
  status?: string;
  prioridade?: string;
  data_inicio?: string;
  data_fim?: string;
  duracao_estimada?: number;
  responsavel?: string;
  participantes?: string[];
  custo_estimado?: number;
  resultados_esperados?: string;
  cliente_id?: string;
}

export function useIntervencaoCreate() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async (data: IntervencaoData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data: intervencao, error } = await supabase
        .from('intervencoes')
        .insert({
          ...data,
          consultora_id: effectiveUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return intervencao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intervencoes'] });
      const message = getSuccessMessage({ action: 'criar', entity: 'intervenção', gender: 'a' });
      toast.success(message.description);
    },
    onError: (error: Error) => {
      toast.error(getUserFriendlyError(error, { action: 'criar', entity: 'intervenção' }));
    },
  });
}
