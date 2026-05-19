import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useLeadHistorico = (leadId: string) => {
  return useQuery({
    queryKey: ['lead-historico', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads_historico')
        .select('*')
        .eq('lead_id', leadId)
        .order('data', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!leadId,
  });
};

export const useLeadHistoricoCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leadId,
      tipo,
      descricao,
    }: {
      leadId: string;
      tipo: string;
      descricao: string;
    }) => {
      const { data, error } = await supabase
        .from('leads_historico')
        .insert({
          lead_id: leadId,
          tipo,
          descricao,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-historico', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads-diagnostico'] });
    },
  });
};
