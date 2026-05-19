import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError } from '@/lib/error-messages';
import { useAuth } from '@/contexts/AuthContext';

export const useLeadAnotacoes = (leadId: string) => {
  return useQuery({
    queryKey: ['lead-anotacoes', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads_anotacoes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!leadId,
  });
};

export const useLeadAnotacaoCreate = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async ({
      leadId,
      texto,
    }: {
      leadId: string;
      texto: string;
    }) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('leads_anotacoes')
        .insert({
          lead_id: leadId,
          texto,
          autor_id: effectiveUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-anotacoes', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads-diagnostico'] });
      toast({
        title: 'Anotação adicionada',
        description: 'A anotação foi salva com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar anotação',
        description: getUserFriendlyError(error, { action: 'criar', entity: 'lead' }),
        variant: 'destructive',
      });
    },
  });
};

export const useLeadAnotacaoDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, leadId }: { id: string; leadId: string }) => {
      const { error } = await supabase
        .from('leads_anotacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, leadId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lead-anotacoes', data.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads-diagnostico'] });
      toast({
        title: 'Anotação removida',
        description: 'A anotação foi deletada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover anotação',
        description: getUserFriendlyError(error, { action: 'deletar', entity: 'lead' }),
        variant: 'destructive',
      });
    },
  });
};
