import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface FaturaCreate {
  cliente_id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  forma_pagamento?: string;
  contrato_id?: string;
}

interface FaturaUpdate {
  id: string;
  descricao?: string;
  valor?: number;
  data_vencimento?: string;
  status?: string;
  data_pagamento?: string;
}

export function useFaturas(filters?: {
  status?: string;
  cliente_id?: string;
  data_inicio?: string;
  data_fim?: string;
}) {
  const { effectiveUserId } = useAuth();

  const { data: faturas, isLoading } = useQuery({
    queryKey: ['faturas', filters, effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('faturas')
        .select(`
          *,
          cliente:clientes(id, nome, email),
          contrato:contratos_financeiros(id, valor_mensal)
        `)
        .eq('consultora_id', effectiveUserId)
        .order('data_vencimento', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.cliente_id) {
        query = query.eq('cliente_id', filters.cliente_id);
      }

      if (filters?.data_inicio) {
        query = query.gte('data_emissao', filters.data_inicio);
      }

      if (filters?.data_fim) {
        query = query.lte('data_emissao', filters.data_fim);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  return { faturas, isLoading };
}

export function useFaturaCreate() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async (fatura: FaturaCreate) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      // Criar fatura local
      const { data: novaFatura, error: faturaError } = await supabase
        .from('faturas')
        .insert({
          consultora_id: effectiveUserId,
          ...fatura
        })
        .select()
        .single();

      if (faturaError) throw faturaError;

      // Chamar edge function para criar no Asaas
      const { data: asaasData, error: asaasError } = await supabase.functions.invoke(
        'asaas-create-payment',
        {
          body: { fatura_id: novaFatura.id }
        }
      );

      if (asaasError) {
        console.error('Erro ao criar no Asaas:', asaasError);
        const errorMsg = asaasError.message || 'Erro desconhecido';
        
        if (errorMsg.includes('CPF') || errorMsg.includes('CNPJ')) {
          toast.error('Cliente sem CPF/CNPJ: O cliente não possui CPF/CNPJ cadastrado. Atualize o cadastro antes de criar cobranças no Asaas.', {
            duration: 8000,
            action: {
              label: 'Ver Clientes',
              onClick: () => window.location.href = '/clientes',
            },
          });
        } else if (errorMsg.includes('Credenciais') || errorMsg.includes('não configuradas')) {
          toast.warning('Fatura criada localmente. Configure o Asaas em Configurações para sincronizar.');
        } else if (errorMsg.includes('API key')) {
          toast.warning('Fatura criada. Verifique suas credenciais Asaas.');
        } else {
          toast.error(`Erro ao sincronizar com Asaas: ${errorMsg}`);
        }
      } else if (asaasData) {
        toast.success('Fatura criada e sincronizada com Asaas!');
      }

      return { ...novaFatura, asaas: asaasData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faturas'] });
      queryClient.invalidateQueries({ queryKey: ['metricas-financeiras'] });
      toast.success('Fatura criada com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao criar fatura:', error);
      toast.error(error.message || 'Erro ao criar fatura. Tente novamente.');
    }
  });
}

export function useFaturaUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: FaturaUpdate) => {
      const { error } = await supabase
        .from('faturas')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faturas'] });
      queryClient.invalidateQueries({ queryKey: ['metricas-financeiras'] });
      toast.success('Fatura atualizada com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar fatura:', error);
      toast.error(error.message || 'Erro ao atualizar fatura. Tente novamente.');
    }
  });
}

export function useFaturaDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('faturas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faturas'] });
      queryClient.invalidateQueries({ queryKey: ['metricas-financeiras'] });
      toast.success('Fatura removida com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao deletar fatura:', error);
      toast.error(error.message || 'Erro ao remover fatura. Tente novamente.');
    }
  });
}
