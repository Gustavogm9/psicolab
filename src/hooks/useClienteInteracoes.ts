import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/error-messages';
import { useAuth } from '@/contexts/AuthContext';

interface CreateInteracaoData {
  clienteId: string;
  tipo: 'ligacao' | 'reuniao' | 'email' | 'whatsapp' | 'visita' | 'outro';
  titulo: string;
  descricao?: string;
  dataInteracao?: string;
  duracao?: number;
  participantes?: string[];
  resultado?: string;
  proximosPassos?: string;
}

export const useClienteInteracoes = (clienteId: string) => {
  return useQuery({
    queryKey: ['cliente-interacoes', clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes_interacoes')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('data_interacao', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clienteId,
  });
};

export const useClienteInteracaoCreate = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateInteracaoData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data: interacao, error } = await supabase
        .from('clientes_interacoes')
        .insert({
          cliente_id: data.clienteId,
          tipo: data.tipo,
          titulo: data.titulo,
          descricao: data.descricao,
          data_interacao: data.dataInteracao || new Date().toISOString(),
          duracao: data.duracao,
          participantes: data.participantes,
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
      queryClient.invalidateQueries({ queryKey: ['cliente-interacoes', variables.clienteId] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
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

export const useClienteInteracaoUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      clienteId,
      ...updates 
    }: { 
      id: string;
      clienteId: string;
      titulo?: string;
      descricao?: string;
      dataInteracao?: string;
      duracao?: number;
      participantes?: string[];
      resultado?: string;
      proximosPassos?: string;
    }) => {
      const updateData: any = {};
      
      if (updates.titulo !== undefined) updateData.titulo = updates.titulo;
      if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
      if (updates.dataInteracao !== undefined) updateData.data_interacao = updates.dataInteracao;
      if (updates.duracao !== undefined) updateData.duracao = updates.duracao;
      if (updates.participantes !== undefined) updateData.participantes = updates.participantes;
      if (updates.resultado !== undefined) updateData.resultado = updates.resultado;
      if (updates.proximosPassos !== undefined) updateData.proximos_passos = updates.proximosPassos;

      const { data, error } = await supabase
        .from('clientes_interacoes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, clienteId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['cliente-interacoes', result.clienteId] });
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

export const useClienteInteracaoDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, clienteId }: { id: string; clienteId: string }) => {
      const { error } = await supabase
        .from('clientes_interacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return clienteId;
    },
    onSuccess: (clienteId) => {
      queryClient.invalidateQueries({ queryKey: ['cliente-interacoes', clienteId] });
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
