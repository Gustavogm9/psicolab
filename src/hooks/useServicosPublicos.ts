import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/error-messages";

export interface ServicoPublico {
  id: string;
  perfil_publico_id: string;
  titulo: string;
  descricao: string | null;
  preco: number | null;
  duracao: number | null;
  modalidade: "presencial" | "online" | "hibrido" | null;
  icone: string;
  ordem: number;
  created_at: string;
}

export function useServicosPublicos(perfilPublicoId?: string) {
  return useQuery({
    queryKey: ["servicos-publicos", perfilPublicoId],
    queryFn: async () => {
      if (!perfilPublicoId) return [];

      const { data, error } = await supabase
        .from("servicos_publicos")
        .select("*")
        .eq("perfil_publico_id", perfilPublicoId)
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as ServicoPublico[];
    },
    enabled: !!perfilPublicoId,
  });
}

export function useServicosPublicosMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: Omit<ServicoPublico, "id" | "created_at">) => {
      const { data: result, error } = await supabase
        .from("servicos_publicos")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["servicos-publicos", variables.perfil_publico_id] 
      });
      toast.success("Serviço adicionado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'criar', entity: 'serviço' }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, perfil_publico_id, ...data }: Partial<ServicoPublico> & { id: string; perfil_publico_id: string }) => {
      const { data: result, error } = await supabase
        .from("servicos_publicos")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["servicos-publicos", variables.perfil_publico_id] 
      });
      toast.success("Serviço atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'atualizar', entity: 'serviço' }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, perfil_publico_id }: { id: string; perfil_publico_id: string }) => {
      const { error } = await supabase
        .from("servicos_publicos")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return perfil_publico_id;
    },
    onSuccess: (perfil_publico_id) => {
      queryClient.invalidateQueries({ 
        queryKey: ["servicos-publicos", perfil_publico_id] 
      });
      toast.success("Serviço removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'deletar', entity: 'serviço' }));
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
