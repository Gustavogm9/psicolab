import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/error-messages';
import { useAuth } from '@/contexts/AuthContext';

interface CreateOportunidadeData {
  lead_id: string;
  titulo: string;
  valor_estimado?: number;
  probabilidade?: number;
  estagio?: string;
  descricao?: string;
  data_fechamento_prevista?: string;
}

export const useOportunidadeCreate = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateOportunidadeData) => {
      if (!effectiveUserId) throw new Error('Não autenticado');

      // Buscar dados do lead
      const { data: lead, error: leadError } = await supabase
        .from('leads_diagnostico')
        .select('id, nome, empresa, valor_potencial')
        .eq('id', data.lead_id)
        .single();

      if (leadError) throw leadError;

      // Criar oportunidade
      const { data: oportunidade, error } = await supabase
        .from('oportunidades')
        .insert({
          consultora_id: effectiveUserId,
          lead_id: data.lead_id,
          titulo: data.titulo,
          descricao: data.descricao,
          valor_estimado: data.valor_estimado || lead.valor_potencial || 0,
          probabilidade: data.probabilidade || 50,
          estagio: data.estagio || 'prospecção',
          data_fechamento_prevista: data.data_fechamento_prevista,
          origem: 'manual',
        })
        .select()
        .single();

      if (error) throw error;

      // Registrar no histórico do lead
      await supabase.from('leads_historico').insert({
        lead_id: data.lead_id,
        tipo: 'oportunidade_criada',
        descricao: `Nova oportunidade criada: ${data.titulo}`,
      });

      return oportunidade;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oportunidades-crm'] });
      queryClient.invalidateQueries({ queryKey: ['leads-diagnostico'] });
      const message = getSuccessMessage({ action: 'criar', entity: 'oportunidade', gender: 'a' });
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar oportunidade',
        description: getUserFriendlyError(error, { action: 'criar', entity: 'oportunidade' }),
        variant: 'destructive',
      });
    },
  });
};
