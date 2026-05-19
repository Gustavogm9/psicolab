import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError, getSuccessMessage } from "@/lib/error-messages";

interface ContatoData {
  lead_id: string;
  nome: string;
  cargo?: string;
  email?: string;
  telefone?: string;
  principal?: boolean;
}

export function useLeadContatoMutations() {
  const queryClient = useQueryClient();

  const createContato = useMutation({
    mutationFn: async (data: ContatoData) => {
      // Se estiver marcando como principal, desmarcar outros
      if (data.principal) {
        await supabase
          .from('leads_contatos')
          .update({ principal: false })
          .eq('lead_id', data.lead_id);
      }

      const { data: contato, error } = await supabase
        .from('leads_contatos')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return contato;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-contatos', variables.lead_id] });
      const message = getSuccessMessage({ action: 'criar', entity: 'contato', gender: 'o' });
      toast.success(message.description);
    },
    onError: (error) => {
      console.error('Erro ao criar contato:', error);
      toast.error(getUserFriendlyError(error, { action: 'criar', entity: 'contato' }));
    },
  });

  const updateContato = useMutation({
    mutationFn: async ({ id, ...data }: ContatoData & { id: string }) => {
      // Se estiver marcando como principal, desmarcar outros
      if (data.principal) {
        await supabase
          .from('leads_contatos')
          .update({ principal: false })
          .eq('lead_id', data.lead_id);
      }

      const { data: contato, error } = await supabase
        .from('leads_contatos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return contato;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-contatos', variables.lead_id] });
      const message = getSuccessMessage({ action: 'atualizar', entity: 'contato', gender: 'o' });
      toast.success(message.description);
    },
    onError: (error) => {
      console.error('Erro ao atualizar contato:', error);
      toast.error(getUserFriendlyError(error, { action: 'atualizar', entity: 'contato' }));
    },
  });

  const deleteContato = useMutation({
    mutationFn: async ({ id, lead_id }: { id: string; lead_id: string }) => {
      const { error } = await supabase
        .from('leads_contatos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-contatos', variables.lead_id] });
      const message = getSuccessMessage({ action: 'deletar', entity: 'contato', gender: 'o' });
      toast.success(message.description);
    },
    onError: (error) => {
      console.error('Erro ao deletar contato:', error);
      toast.error(getUserFriendlyError(error, { action: 'deletar', entity: 'contato' }));
    },
  });

  return {
    createContato: createContato.mutateAsync,
    updateContato: updateContato.mutateAsync,
    deleteContato: deleteContato.mutateAsync,
    isCreating: createContato.isPending,
    isUpdating: updateContato.isPending,
    isDeleting: deleteContato.isPending,
  };
}
