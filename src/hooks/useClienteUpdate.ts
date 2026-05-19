import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError, getSuccessMessage } from "@/lib/error-messages";
import { useAuth } from "@/contexts/AuthContext";

interface UpdateClienteData {
  id: string;
  nome?: string;
  responsavel?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  colaboradores?: number;
  tipo?: string;
  status?: string;
  cpf_cnpj?: string;
}

export function useClienteUpdate() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  const updateClienteMutation = useMutation({
    mutationFn: async ({ id, ...data }: UpdateClienteData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data: cliente, error } = await supabase
        .from('clientes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return cliente;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cliente', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      const message = getSuccessMessage({ action: 'atualizar', entity: 'cliente', gender: 'o' });
      toast.success(message.description);
    },
    onError: (error) => {
      console.error('Erro ao atualizar cliente:', error);
      toast.error(getUserFriendlyError(error, { action: 'atualizar', entity: 'cliente' }));
    },
  });

  return {
    updateCliente: updateClienteMutation.mutateAsync,
    isUpdating: updateClienteMutation.isPending,
  };
}
