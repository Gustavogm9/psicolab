import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getUserFriendlyError, getSuccessMessage } from "@/lib/error-messages";
import { useAuth } from "@/contexts/AuthContext";

interface EventoData {
  titulo: string;
  tipo: string;
  data_hora: string | Date;
  cliente_id?: string;
  lead_id?: string;
  local?: string;
  status?: string;
  observacoes?: string;
}

export function useEventoCreate() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();
  
  return useMutation({
    mutationFn: async (data: EventoData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');
      
      const dataFormatted = {
        titulo: data.titulo,
        tipo: data.tipo,
        data_hora: typeof data.data_hora === 'string' ? data.data_hora : data.data_hora.toISOString(),
        cliente_id: data.cliente_id || null,
        lead_id: data.lead_id || null,
        local: data.local || null,
        status: data.status || 'agendado',
        observacoes: data.observacoes || null,
        consultora_id: effectiveUserId,
      };
      
      const { data: evento, error } = await supabase
        .from('eventos')
        .insert(dataFormatted)
        .select()
        .single();
      
      if (error) throw error;
      return evento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['eventos-hoje'] });
      queryClient.invalidateQueries({ queryKey: ['eventos-cliente'] });
      queryClient.invalidateQueries({ queryKey: ['lead-eventos'] });
      const message = getSuccessMessage({ action: 'criar', entity: 'evento', gender: 'o' });
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar evento",
        description: getUserFriendlyError(error, { action: 'criar', entity: 'evento' }),
        variant: "destructive",
      });
    },
  });
}

export function useEventoUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventoData> }) => {
      const dataFormatted: any = { ...data };
      if (data.data_hora) {
        dataFormatted.data_hora = typeof data.data_hora === 'string' ? data.data_hora : data.data_hora.toISOString();
      }
      
      const { data: evento, error } = await supabase
        .from('eventos')
        .update(dataFormatted)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return evento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['eventos-hoje'] });
      queryClient.invalidateQueries({ queryKey: ['eventos-cliente'] });
      queryClient.invalidateQueries({ queryKey: ['lead-eventos'] });
      const message = getSuccessMessage({ action: 'atualizar', entity: 'evento', gender: 'o' });
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar evento",
        description: getUserFriendlyError(error, { action: 'atualizar', entity: 'evento' }),
        variant: "destructive",
      });
    },
  });
}

export function useEventoDelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['eventos-hoje'] });
      queryClient.invalidateQueries({ queryKey: ['eventos-cliente'] });
      queryClient.invalidateQueries({ queryKey: ['lead-eventos'] });
      const message = getSuccessMessage({ action: 'deletar', entity: 'evento', gender: 'o' });
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir evento",
        description: getUserFriendlyError(error, { action: 'deletar', entity: 'evento' }),
        variant: "destructive",
      });
    },
  });
}

export function useEventoDuplicate() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');
      
      // Buscar evento original
      const { data: original, error: fetchError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Criar cópia
      const { data: duplicado, error: insertError } = await supabase
        .from('eventos')
        .insert({
          titulo: `${original.titulo} (cópia)`,
          tipo: original.tipo,
          data_hora: original.data_hora,
          cliente_id: original.cliente_id,
          local: original.local,
          observacoes: original.observacoes,
          consultora_id: effectiveUserId,
          status: 'agendado',
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      return duplicado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: "Evento duplicado",
        description: "Uma cópia do evento foi criada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao duplicar evento",
        description: getUserFriendlyError(error, { action: 'criar', entity: 'evento' }),
        variant: "destructive",
      });
    },
  });
}
