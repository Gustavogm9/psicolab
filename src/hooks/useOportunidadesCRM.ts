import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAutoConvertLead } from './useLeadConversion';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/error-messages';
import { useAuth } from '@/contexts/AuthContext';

export const useOportunidadesCRM = () => {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['oportunidades-crm', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('oportunidades')
        .select(`
          *,
          lead:leads_diagnostico!oportunidades_lead_id_fkey (
            id,
            nome,
            email,
            empresa,
            score
          )
        `)
        .eq('consultora_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useOportunidadeUpdate = () => {
  const queryClient = useQueryClient();
  const autoConvertLead = useAutoConvertLead();

  return useMutation({
    mutationFn: async ({ id, estagio }: { id: string; estagio: string }) => {
      // OTIMIZAÇÃO: Só buscar dados do lead se for converter (estágio "ganho")
      let leadData = null;
      if (estagio === 'ganho') {
        const { data: oportunidade, error: opError } = await supabase
          .from('oportunidades')
          .select(`
            *,
            lead:leads_diagnostico!oportunidades_lead_id_fkey (
              id,
              nome,
              email,
              telefone,
              endereco,
              colaboradores,
              tipo,
              cliente_id
            )
          `)
          .eq('id', id)
          .single();

        if (opError) throw opError;
        leadData = oportunidade?.lead;
      }

      // Atualizar oportunidade
      const updateData: any = { estagio };
      if (estagio === 'ganho') {
        updateData.data_fechamento_real = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('oportunidades')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Se ganhou e tem lead, converter automaticamente
      if (estagio === 'ganho' && leadData) {
        await autoConvertLead.mutateAsync({
          lead: leadData,
          oportunidadeId: id,
        });
      }

      return data;
    },
    
    // OPTIMISTIC UPDATE: Atualiza UI instantaneamente
    onMutate: async ({ id, estagio }) => {
      await queryClient.cancelQueries({ queryKey: ['oportunidades-crm'] });
      
      const previousData = queryClient.getQueryData(['oportunidades-crm']);
      
      // Atualizar cache local instantaneamente
      queryClient.setQueryData(['oportunidades-crm'], (old: any) => 
        old?.map((op: any) => op.id === id ? { ...op, estagio } : op)
      );
      
      return { previousData };
    },
    
    // Rollback se der erro
    onError: (error: any, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['oportunidades-crm'], context.previousData);
      }
      toast({
        title: 'Erro ao atualizar oportunidade',
        description: getUserFriendlyError(error, { action: 'atualizar', entity: 'oportunidade' }),
        variant: 'destructive',
      });
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['oportunidades-crm'] });
      queryClient.invalidateQueries({ queryKey: ['leads-diagnostico'] });
    },
    
    onSuccess: () => {
      const message = getSuccessMessage({ action: 'atualizar', entity: 'oportunidade', gender: 'a' });
      toast({
        title: message.title,
        description: message.description,
      });
    },
  });
};
