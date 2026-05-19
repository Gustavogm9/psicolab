import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/error-messages";
import { useAuth } from "@/contexts/AuthContext";

export function useIntervencaoProgresso(intervencaoId: string | undefined) {
  return useQuery({
    queryKey: ['intervencao-progresso', intervencaoId],
    queryFn: async () => {
      if (!intervencaoId) throw new Error('ID da intervenção não fornecido');

      const { data, error } = await supabase
        .from('intervencoes_progresso')
        .select('*')
        .eq('intervencao_id', intervencaoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!intervencaoId,
  });
}

export interface ProgressoData {
  intervencao_id: string;
  tipo: string;
  descricao: string;
  progresso_anterior?: number;
  progresso_novo?: number;
}

export function useIntervencaoProgressoCreate() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async (data: ProgressoData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data: progresso, error } = await supabase
        .from('intervencoes_progresso')
        .insert({
          ...data,
          autor_id: effectiveUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return progresso;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['intervencao-progresso', variables.intervencao_id] });
      toast.success('Progresso registrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'criar', entity: 'intervenção' }));
    },
  });
}
