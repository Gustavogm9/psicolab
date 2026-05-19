import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useAlertas() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  const query = useQuery({
    queryKey: ['alertas', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('alertas')
        .select('*')
        .eq('consultora_id', effectiveUserId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60 * 1000, // Atualizar a cada 1 minuto
    enabled: !!effectiveUserId,
  });

  // Realtime updates
  useEffect(() => {
    if (!effectiveUserId) return;

    const channel = supabase
      .channel('alertas-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alertas',
          filter: `consultora_id=eq.${effectiveUserId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['alertas'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, effectiveUserId]);

  return query;
}

export function useMarcarAlertaLido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertaId: string) => {
      const { error } = await supabase
        .from('alertas')
        .update({ lido: true })
        .eq('id', alertaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] }); // Dashboard
    },
  });
}

export function useMarcarTodosAlertasLidos() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('alertas')
        .update({ lido: true })
        .eq('consultora_id', effectiveUserId)
        .eq('lido', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
