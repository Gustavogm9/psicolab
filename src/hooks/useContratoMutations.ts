import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ContratoCreateData {
  cliente_id: string;
  valor_mensal: number;
  dia_vencimento: number;
  forma_pagamento: string;
  data_inicio: string;
  data_fim?: string;
  observacoes?: string;
}

interface ContratoUpdateData extends Partial<ContratoCreateData> {
  id: string;
}

export function useContratoMutations() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  const createContrato = useMutation({
    mutationFn: async (data: ContratoCreateData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data: contratoExistente } = await supabase
        .from('contratos_financeiros')
        .select('id')
        .eq('cliente_id', data.cliente_id)
        .eq('status', 'ativo')
        .single();

      if (contratoExistente) {
        throw new Error('Já existe um contrato ativo para este cliente');
      }

      const { data: contrato, error } = await supabase
        .from('contratos_financeiros')
        .insert({
          consultora_id: effectiveUserId,
          ...data,
          status: 'ativo'
        })
        .select()
        .single();

      if (error) throw error;
      return contrato;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast.success('Contrato criado com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao criar contrato:', error);
      toast.error(error.message || 'Erro ao criar contrato');
    }
  });

  const updateContrato = useMutation({
    mutationFn: async ({ id, ...updates }: ContratoUpdateData) => {
      const { error } = await supabase
        .from('contratos_financeiros')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast.success('Contrato atualizado com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar contrato:', error);
      toast.error(error.message || 'Erro ao atualizar contrato');
    }
  });

  const toggleContratoStatus = useMutation({
    mutationFn: async ({ id, novoStatus }: { id: string; novoStatus: 'ativo' | 'inativo' }) => {
      const updates: Record<string, any> = { status: novoStatus };
      
      if (novoStatus === 'inativo') {
        updates.data_fim = new Date().toISOString().split('T')[0];
      } else {
        updates.data_fim = null;
      }

      const { error } = await supabase
        .from('contratos_financeiros')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      const acao = variables.novoStatus === 'ativo' ? 'ativado' : 'desativado';
      toast.success(`Contrato ${acao} com sucesso!`);
    },
    onError: (error: Error) => {
      console.error('Erro ao alterar status do contrato:', error);
      toast.error(error.message || 'Erro ao alterar status do contrato');
    }
  });

  const deleteContrato = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contratos_financeiros')
        .update({ 
          status: 'cancelado',
          data_fim: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast.success('Contrato cancelado com sucesso');
    },
    onError: (error: Error) => {
      console.error('Erro ao cancelar contrato:', error);
      toast.error(error.message || 'Erro ao cancelar contrato');
    }
  });

  return {
    createContrato: createContrato.mutate,
    updateContrato: updateContrato.mutate,
    toggleContratoStatus: toggleContratoStatus.mutate,
    deleteContrato: deleteContrato.mutate,
    isCreating: createContrato.isPending,
    isUpdating: updateContrato.isPending,
    isDeleting: deleteContrato.isPending
  };
}
