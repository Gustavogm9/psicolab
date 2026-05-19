import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AsaasCredentials, AsaasEnvironment } from "@/lib/asaas-types";
import { validateAsaasApiKey } from "@/lib/asaas-validator";
import { useAuth } from "@/contexts/AuthContext";

export function useAsaasCredentials() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  const { data: credentials, isLoading } = useQuery({
    queryKey: ['asaas-credentials', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('asaas_credentials')
        .select('*')
        .eq('consultora_id', effectiveUserId)
        .maybeSingle();
      
      if (error) throw error;
      return data as AsaasCredentials | null;
    },
    enabled: !!effectiveUserId,
  });

  const saveMutation = useMutation({
    mutationFn: async (input: { 
      api_key: string; 
      environment: AsaasEnvironment;
      webhook_token?: string;
    }) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      // Validar API Key antes de salvar
      const validation = await validateAsaasApiKey(input.api_key, input.environment);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Preparar dados: atualizar apenas a chave do ambiente específico
      const updateData: any = {
        consultora_id: effectiveUserId,
        environment: input.environment,
        ativo: true,
        connection_status: 'validated',
        last_validation_at: new Date().toISOString(),
        account_name: validation.accountInfo?.name,
        updated_at: new Date().toISOString()
      };

      // Definir a chave do ambiente correto e preservar a outra
      if (input.environment === 'sandbox') {
        updateData.sandbox_api_key = input.api_key;
        // Preservar production_api_key se existir
        if (credentials?.production_api_key) {
          updateData.production_api_key = credentials.production_api_key;
        }
        // Salvar ou preservar webhook tokens
        if (input.webhook_token !== undefined) {
          updateData.sandbox_webhook_token = input.webhook_token || null;
        } else if (credentials?.sandbox_webhook_token) {
          updateData.sandbox_webhook_token = credentials.sandbox_webhook_token;
        }
        if (credentials?.production_webhook_token) {
          updateData.production_webhook_token = credentials.production_webhook_token;
        }
      } else {
        updateData.production_api_key = input.api_key;
        // Preservar sandbox_api_key se existir
        if (credentials?.sandbox_api_key) {
          updateData.sandbox_api_key = credentials.sandbox_api_key;
        }
        // Salvar ou preservar webhook tokens
        if (input.webhook_token !== undefined) {
          updateData.production_webhook_token = input.webhook_token || null;
        } else if (credentials?.production_webhook_token) {
          updateData.production_webhook_token = credentials.production_webhook_token;
        }
        if (credentials?.sandbox_webhook_token) {
          updateData.sandbox_webhook_token = credentials.sandbox_webhook_token;
        }
      }

      const { error } = await supabase
        .from('asaas_credentials')
        .upsert(updateData, { onConflict: 'consultora_id' });
      
      if (error) throw error;
      return validation.accountInfo;
    },
    onSuccess: (accountInfo) => {
      queryClient.invalidateQueries({ queryKey: ['asaas-credentials'] });
      toast.success(`Credenciais salvas com sucesso! Conta: ${accountInfo?.name}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao salvar credenciais');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('asaas_credentials')
        .delete()
        .eq('consultora_id', effectiveUserId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asaas-credentials'] });
      toast.success('Credenciais removidas com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover credenciais');
    }
  });

  return { 
    credentials, 
    isLoading, 
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  };
}
