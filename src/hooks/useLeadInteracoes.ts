import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError } from '@/lib/error-messages';
import { useAuth } from '@/contexts/AuthContext';

interface CreateInteracaoData {
  leadId: string;
  tipo: 'ligacao' | 'reuniao' | 'email' | 'whatsapp' | 'proposta' | 'outro';
  titulo: string;
  descricao?: string;
  dataInteracao?: string;
  duracao?: number;
  resultado?: 'positivo' | 'neutro' | 'negativo' | 'sem_resposta';
  proximosPassos?: string;
}

export const useLeadInteracoes = (leadId: string) => {
  return useQuery({
    queryKey: ['lead-interacoes', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads_interacoes')
        .select('*')
        .eq('lead_id', leadId)
        .order('data_interacao', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!leadId,
  });
};

export const useLeadInteracaoCreate = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateInteracaoData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data: interacao, error } = await supabase
        .from('leads_interacoes')
        .insert({
          lead_id: data.leadId,
          tipo: data.tipo,
          titulo: data.titulo,
          descricao: data.descricao,
          data_interacao: data.dataInteracao || new Date().toISOString(),
          duracao: data.duracao,
          resultado: data.resultado,
          proximos_passos: data.proximosPassos,
          criado_por: effectiveUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return interacao;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-interacoes', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads-diagnostico'] });
      toast({
        title: 'Interação registrada',
        description: 'A interação foi registrada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao registrar interação',
        description: getUserFriendlyError(error, { action: 'criar', entity: 'interação' }),
        variant: 'destructive',
      });
    },
  });
};

export const useLeadInteracaoUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      leadId,
      ...updates 
    }: { 
      id: string;
      leadId: string;
      titulo?: string;
      descricao?: string;
      dataInteracao?: string;
      duracao?: number;
      resultado?: 'positivo' | 'neutro' | 'negativo' | 'sem_resposta';
      proximosPassos?: string;
    }) => {
      const updateData: any = {};
      
      if (updates.titulo !== undefined) updateData.titulo = updates.titulo;
      if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
      if (updates.dataInteracao !== undefined) updateData.data_interacao = updates.dataInteracao;
      if (updates.duracao !== undefined) updateData.duracao = updates.duracao;
      if (updates.resultado !== undefined) updateData.resultado = updates.resultado;
      if (updates.proximosPassos !== undefined) updateData.proximos_passos = updates.proximosPassos;

      const { data, error } = await supabase
        .from('leads_interacoes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, leadId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['lead-interacoes', result.leadId] });
      toast({
        title: 'Interação atualizada',
        description: 'A interação foi atualizada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar interação',
        description: getUserFriendlyError(error, { action: 'atualizar', entity: 'interação' }),
        variant: 'destructive',
      });
    },
  });
};

export const useLeadInteracaoDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, leadId }: { id: string; leadId: string }) => {
      const { error } = await supabase
        .from('leads_interacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return leadId;
    },
    onSuccess: (leadId) => {
      queryClient.invalidateQueries({ queryKey: ['lead-interacoes', leadId] });
      toast({
        title: 'Interação excluída',
        description: 'A interação foi excluída com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir interação',
        description: getUserFriendlyError(error, { action: 'deletar', entity: 'interação' }),
        variant: 'destructive',
      });
    },
  });
};
