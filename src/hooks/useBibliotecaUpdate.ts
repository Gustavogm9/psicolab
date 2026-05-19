import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/error-messages";

interface UpdateBibliotecaData {
  id: string;
  titulo?: string;
  descricao?: string;
  categoria?: string;
  impacto?: string;
  esforco?: string;
  duracao_estimada?: number;
  custo_estimado?: number;
  ativo?: boolean;
}

export function useBibliotecaUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateBibliotecaData) => {
      const { data: updated, error } = await supabase
        .from('biblioteca_intervencoes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biblioteca-intervencoes'] });
      toast.success('Ação atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'atualizar', entity: 'intervenção' }));
    },
  });
}
