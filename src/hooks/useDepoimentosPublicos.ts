import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/error-messages";

export interface DepoimentoPublico {
  id: string;
  perfil_publico_id: string;
  nome: string;
  cargo: string | null;
  empresa: string | null;
  texto: string;
  foto: string | null;
  rating: number | null;
  data: string;
  status?: string;
  created_at: string;
}

export function useDepoimentosPublicos(perfilPublicoId?: string) {
  return useQuery({
    queryKey: ["depoimentos-publicos", perfilPublicoId],
    queryFn: async () => {
      if (!perfilPublicoId) return [];

      const { data, error } = await supabase
        .from("depoimentos_publicos")
        .select("*")
        .eq("perfil_publico_id", perfilPublicoId)
        .order("data", { ascending: false });

      if (error) throw error;
      return data as DepoimentoPublico[];
    },
    enabled: !!perfilPublicoId,
  });
}

export function useDepoimentosPublicosMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: Omit<DepoimentoPublico, "id" | "created_at">) => {
      const { data: result, error } = await supabase
        .from("depoimentos_publicos")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["depoimentos-publicos", variables.perfil_publico_id] 
      });
      toast.success("Depoimento adicionado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'criar', entity: 'depoimento' }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, perfil_publico_id, ...data }: Partial<DepoimentoPublico> & { id: string; perfil_publico_id: string }) => {
      const { data: result, error } = await supabase
        .from("depoimentos_publicos")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["depoimentos-publicos", variables.perfil_publico_id] 
      });
      toast.success("Depoimento atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'atualizar', entity: 'depoimento' }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, perfil_publico_id }: { id: string; perfil_publico_id: string }) => {
      const { error } = await supabase
        .from("depoimentos_publicos")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return perfil_publico_id;
    },
    onSuccess: (perfil_publico_id) => {
      queryClient.invalidateQueries({ 
        queryKey: ["depoimentos-publicos", perfil_publico_id] 
      });
      toast.success("Depoimento removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'deletar', entity: 'depoimento' }));
    },
  });

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
