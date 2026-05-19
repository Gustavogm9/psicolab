import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError, getSuccessMessage } from "@/lib/error-messages";
import { useAuth } from "@/contexts/AuthContext";

interface CreateClienteData {
  nome: string;
  responsavel: string;
  email: string;
  telefone: string;
  endereco: string;
  colaboradores: number;
  tipo: string;
  status: string;
  cpf_cnpj?: string;
}

export function useClienteMutation() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  const createClienteMutation = useMutation({
    mutationFn: async (data: CreateClienteData) => {
      if (!effectiveUserId) {
        throw new Error('Usuário não autenticado');
      }

      const { data: cliente, error } = await supabase
        .from('clientes')
        .insert({
          nome: data.nome,
          responsavel: data.responsavel,
          email: data.email,
          telefone: data.telefone,
          endereco: data.endereco,
          colaboradores: data.colaboradores,
          tipo: data.tipo,
          status: data.status,
          cpf_cnpj: data.cpf_cnpj || null,
          consultora_id: effectiveUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return cliente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      const message = getSuccessMessage({ action: 'criar', entity: 'cliente', gender: 'o' });
      toast.success(message.description);
    },
    onError: (error) => {
      console.error('Erro ao criar cliente:', error);
      toast.error(getUserFriendlyError(error, { action: 'criar', entity: 'cliente' }));
    },
  });

  const deleteClienteMutation = useMutation({
    mutationFn: async (clienteId: string) => {
      // 1. Desvincular leads (não deletar, apenas remover referência)
      const { error: leadsError } = await supabase
        .from('leads_diagnostico')
        .update({ cliente_id: null })
        .eq('cliente_id', clienteId);

      if (leadsError) throw leadsError;

      // 2. Deletar oportunidades vinculadas ao cliente
      const { error: oportunidadesError } = await supabase
        .from('oportunidades')
        .delete()
        .eq('cliente_id', clienteId);

      if (oportunidadesError) throw oportunidadesError;

      // 3. Deletar eventos vinculados
      const { error: eventosError } = await supabase
        .from('eventos')
        .delete()
        .eq('cliente_id', clienteId);

      if (eventosError) throw eventosError;

      // 4. Deletar projetos vinculados
      const { error: projetosError } = await supabase
        .from('projetos')
        .delete()
        .eq('cliente_id', clienteId);

      if (projetosError) throw projetosError;

      // 5. Deletar intervenções vinculadas
      const { error: intervencoesError } = await supabase
        .from('intervencoes')
        .delete()
        .eq('cliente_id', clienteId);

      if (intervencoesError) throw intervencoesError;

      // 6. Deletar contatos do cliente
      const { error: contatosError } = await supabase
        .from('clientes_contatos')
        .delete()
        .eq('cliente_id', clienteId);

      if (contatosError) throw contatosError;

      // 7. Deletar interações do cliente
      const { error: interacoesError } = await supabase
        .from('clientes_interacoes')
        .delete()
        .eq('cliente_id', clienteId);

      if (interacoesError) throw interacoesError;

      // 8. Por fim, deletar o cliente
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      queryClient.invalidateQueries({ queryKey: ['intervencoes'] });
      const message = getSuccessMessage({ action: 'deletar', entity: 'cliente', gender: 'o' });
      toast.success(message.description);
    },
    onError: (error) => {
      console.error('Erro ao excluir cliente:', error);
      toast.error(getUserFriendlyError(error, { action: 'deletar', entity: 'cliente' }));
    },
  });

  return {
    createCliente: createClienteMutation.mutateAsync,
    isCreating: createClienteMutation.isPending,
    deleteCliente: deleteClienteMutation.mutateAsync,
    isDeleting: deleteClienteMutation.isPending,
  };
}
