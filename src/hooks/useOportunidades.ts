import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CreateOportunidadeData {
  leadId?: string;
  clienteId?: string;
  titulo: string;
  descricao?: string;
  valorEstimado?: number;
  probabilidade?: number;
  estagio?: 'prospecção' | 'qualificação' | 'proposta' | 'negociação' | 'fechamento' | 'ganho' | 'perdido';
  dataFechamentoPrevista?: string;
  origem?: string;
  tags?: string[];
}

export const useOportunidades = (filters?: { leadId?: string; clienteId?: string }) => {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['oportunidades', filters, effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('oportunidades')
        .select('*, lead:leads_diagnostico(nome, email), cliente:clientes(nome)')
        .eq('consultora_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (filters?.leadId) {
        // Apenas oportunidades que ainda não foram migradas para um cliente
        query = query.eq('lead_id', filters.leadId).is('cliente_id', null);
      }
      
      if (filters?.clienteId) {
        query = query.eq('cliente_id', filters.clienteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useOportunidadesEncerradas = () => {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['oportunidades-encerradas', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('oportunidades')
        .select('*, lead:leads_diagnostico(nome, email), cliente:clientes(nome)')
        .eq('consultora_id', effectiveUserId)
        .in('estagio', ['ganho', 'perdido'])
        .order('data_fechamento_real', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useOportunidadeDetalhes = (id: string) => {
  return useQuery({
    queryKey: ['oportunidade', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('oportunidades')
        .select('*, lead:leads_diagnostico(*), cliente:clientes(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useOportunidadeCreate = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateOportunidadeData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      if (!data.leadId && !data.clienteId) {
        throw new Error('É necessário vincular a oportunidade a um lead ou cliente');
      }

      const { data: oportunidade, error } = await supabase
        .from('oportunidades')
        .insert({
          consultora_id: effectiveUserId,
          lead_id: data.leadId || null,
          cliente_id: data.clienteId || null,
          titulo: data.titulo,
          descricao: data.descricao,
          valor_estimado: data.valorEstimado,
          probabilidade: data.probabilidade || 50,
          estagio: data.estagio || 'prospecção',
          data_fechamento_prevista: data.dataFechamentoPrevista,
          origem: data.origem,
          tags: data.tags || [],
        })
        .select()
        .single();

      if (error) throw error;
      return oportunidade;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
      queryClient.invalidateQueries({ queryKey: ['leads-diagnostico'] });
      toast({
        title: 'Oportunidade criada',
        description: 'A oportunidade foi criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar oportunidade',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useOportunidadeUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      ...updates 
    }: { 
      id: string;
      titulo?: string;
      descricao?: string;
      valorEstimado?: number;
      probabilidade?: number;
      estagio?: 'prospecção' | 'qualificação' | 'proposta' | 'negociação' | 'fechamento' | 'ganho' | 'perdido';
      motivoPerda?: string;
      dataFechamentoPrevista?: string;
      dataFechamentoReal?: string;
      tags?: string[];
    }) => {
      const updateData: any = {};
      
      if (updates.titulo !== undefined) updateData.titulo = updates.titulo;
      if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
      if (updates.valorEstimado !== undefined) updateData.valor_estimado = updates.valorEstimado;
      if (updates.probabilidade !== undefined) updateData.probabilidade = updates.probabilidade;
      if (updates.estagio !== undefined) updateData.estagio = updates.estagio;
      if (updates.motivoPerda !== undefined) updateData.motivo_perda = updates.motivoPerda;
      if (updates.dataFechamentoPrevista !== undefined) updateData.data_fechamento_prevista = updates.dataFechamentoPrevista;
      if (updates.dataFechamentoReal !== undefined) updateData.data_fechamento_real = updates.dataFechamentoReal;
      if (updates.tags !== undefined) updateData.tags = updates.tags;

      const { data, error } = await supabase
        .from('oportunidades')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
      queryClient.invalidateQueries({ queryKey: ['oportunidade'] });
      toast({
        title: 'Oportunidade atualizada',
        description: 'A oportunidade foi atualizada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar oportunidade',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useOportunidadeDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('oportunidades')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
      toast({
        title: 'Oportunidade excluída',
        description: 'A oportunidade foi excluída com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir oportunidade',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
