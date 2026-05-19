import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ContratoCreate {
  cliente_id: string;
  valor_mensal: number;
  dia_vencimento: number;
  forma_pagamento: string;
  data_inicio: string;
  data_fim?: string;
  observacoes?: string;
}

export function useContratos(clienteId?: string) {
  const { effectiveUserId } = useAuth();

  const { data: contratos, isLoading } = useQuery({
    queryKey: ['contratos', clienteId, effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('contratos_financeiros')
        .select(`
          *,
          cliente:clientes(id, nome, email)
        `)
        .eq('consultora_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  return { contratos, isLoading };
}

export function useContratoCreate() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async (contrato: ContratoCreate) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('contratos_financeiros')
        .insert({
          consultora_id: effectiveUserId,
          ...contrato
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast.success('Contrato criado com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao criar contrato:', error);
      toast.error(error.message || 'Erro ao criar contrato. Tente novamente.');
    }
  });
}

export function useContratoUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContratoCreate> & { id: string }) => {
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
      toast.error(error.message || 'Erro ao atualizar contrato. Tente novamente.');
    }
  });
}

export function useContratoCancel() {
  const queryClient = useQueryClient();

  return useMutation({
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
      toast.error(error.message || 'Erro ao cancelar contrato. Tente novamente.');
    }
  });
}
