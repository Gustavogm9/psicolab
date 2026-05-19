import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SyncOptions {
  fatura_id?: string;
  cliente_id?: string;
}

interface SyncResult {
  success: boolean;
  timestamp: string;
  consultoras_processadas: number;
  total_faturas: number;
  atualizadas: number;
  importadas: number;
  erros: number;
  detalhes: Array<{
    fatura_id: string;
    numero_fatura: string;
    status_anterior: string;
    status_novo: string;
    sincronizado: boolean;
    erro?: string;
  }>;
}

export function useFaturaSync() {
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async (options?: SyncOptions) => {
      const { data, error } = await supabase.functions.invoke<SyncResult>('asaas-sync', {
        body: options || {}
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['faturas'] });
      queryClient.invalidateQueries({ queryKey: ['metricas-financeiras'] });
      
      const imported = data.importadas || 0;
      const updated = data.atualizadas || 0;
      
      if (imported > 0 && updated > 0) {
        toast.success(
          `Sincronização concluída! ${updated} atualizadas, ${imported} importadas.`,
          {
            description: `Total processado: ${data.total_faturas}${data.erros > 0 ? ` | Erros: ${data.erros}` : ''}`
          }
        );
      } else if (imported > 0) {
        toast.success(
          `${imported} cobrança(s) importada(s) do Asaas!`,
          {
            description: `As cobranças criadas no Asaas foram importadas para o sistema`
          }
        );
      } else if (updated > 0) {
        toast.success(
          `Sincronização concluída! ${updated} faturas atualizadas.`,
          {
            description: `Total processado: ${data.total_faturas}${data.erros > 0 ? ` | Erros: ${data.erros}` : ''}`
          }
        );
      } else if (data.erros > 0) {
        toast.error('Sincronização concluída com erros', {
          description: `${data.erros} faturas não puderam ser sincronizadas`
        });
      } else {
        toast.info('Todas as faturas já estão atualizadas', {
          description: `${data.total_faturas} faturas verificadas`
        });
      }
    },
    onError: (error: Error) => {
      console.error('Erro ao sincronizar:', error);
      toast.error('Erro ao sincronizar com Asaas', {
        description: error.message
      });
    }
  });

  return {
    syncAll: (options?: SyncOptions) => syncMutation.mutate(options),
    isSyncing: syncMutation.isPending,
    syncResult: syncMutation.data
  };
}
