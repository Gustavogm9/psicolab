import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserFriendlyError } from '@/lib/error-messages';
import { useAuth } from '@/contexts/AuthContext';

export const useRelatoriosROI = () => {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['relatorios-roi', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('relatorios_roi')
        .select(`
          *,
          questionario:questionarios_diagnostico(titulo, slug)
        `)
        .eq('consultora_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useRelatorioCreate = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      questionario_id: string;
      data_inicio: string;
      data_fim: string;
      total_respostas: number;
      leads_gerados: number;
      taxa_conversao: number;
      investimento: number;
      retorno_estimado: number;
      roi_percentual: number;
      metricas_detalhadas?: any;
    }) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data: relatorio, error } = await supabase
        .from('relatorios_roi')
        .insert({
          ...data,
          consultora_id: effectiveUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return relatorio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relatorios-roi'] });
      toast.success('Relatório ROI criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'criar', entity: 'relatório' }));
    },
  });
};

export const useRelatorioUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('relatorios_roi')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relatorios-roi'] });
      toast.success('Relatório atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'atualizar', entity: 'relatório' }));
    },
  });
};

export const useRelatorioDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('relatorios_roi')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relatorios-roi'] });
      toast.success('Relatório excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'deletar', entity: 'relatório' }));
    },
  });
};
