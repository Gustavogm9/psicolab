import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useLeadEventos = (leadId: string) => {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['lead-eventos', leadId, effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];

      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('consultora_id', effectiveUserId)
        .eq('lead_id', leadId)
        .order('data_hora', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!leadId && !!effectiveUserId,
  });
};

export const useEventoDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventoId: string) => {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', eventoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-eventos'] });
      toast({
        title: 'Evento excluído',
        description: 'O evento foi removido com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir evento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useEventoUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      data_hora,
    }: {
      id: string;
      status?: string;
      data_hora?: string;
    }) => {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (data_hora) updateData.data_hora = data_hora;

      const { error } = await supabase
        .from('eventos')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-eventos'] });
      toast({
        title: 'Evento atualizado',
        description: 'As informações do evento foram atualizadas.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar evento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
