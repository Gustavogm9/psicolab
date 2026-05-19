import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/error-messages";
import { useAuth } from "@/contexts/AuthContext";

interface CreateBibliotecaData {
  titulo: string;
  descricao?: string;
  categoria: string;
  impacto?: string;
  esforco?: string;
  duracao_estimada?: number;
  custo_estimado?: number;
}

export function useBibliotecaCreate() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateBibliotecaData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data: created, error } = await supabase
        .from('biblioteca_intervencoes')
        .insert({
          ...data,
          consultora_id: effectiveUserId,
          template: true,
        })
        .select()
        .single();

      if (error) throw error;
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biblioteca-intervencoes'] });
      toast.success('Ação customizada criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'criar', entity: 'intervenção' }));
    },
  });
}
