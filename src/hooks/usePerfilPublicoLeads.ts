import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateLeadData {
  perfilPublicoId: string;
  nome: string;
  email: string;
  telefone?: string;
  mensagem?: string;
  origem: 'formulario_contato' | 'diagnostico' | 'widget_servico';
  questionarioId?: string;
  respostaId?: string;
  metadata?: any;
}

interface UpdateLeadData {
  leadId: string;
  status: 'novo' | 'contatado' | 'convertido' | 'perdido';
}

export const usePerfilPublicoLeads = (perfilPublicoId?: string) => {
  return useQuery({
    queryKey: ['perfil-publico-leads', perfilPublicoId],
    queryFn: async () => {
      if (!perfilPublicoId) return null;

      const { data, error } = await supabase
        .from('perfil_publico_leads')
        .select('*')
        .eq('perfil_publico_id', perfilPublicoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calcular métricas
      const totalLeads = data?.length || 0;
      const novos = data?.filter(l => l.status === 'novo').length || 0;
      const contatados = data?.filter(l => l.status === 'contatado').length || 0;
      const convertidos = data?.filter(l => l.status === 'convertido').length || 0;
      const perdidos = data?.filter(l => l.status === 'perdido').length || 0;

      const porOrigem = data?.reduce((acc, item) => {
        acc[item.origem] = (acc[item.origem] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        leads: data || [],
        metricas: {
          totalLeads,
          novos,
          contatados,
          convertidos,
          perdidos,
          taxaConversao: totalLeads > 0 ? ((convertidos / totalLeads) * 100).toFixed(1) : '0',
          porOrigem: porOrigem || {},
        },
      };
    },
    enabled: !!perfilPublicoId,
  });
};

export const useCreatePerfilPublicoLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeadData) => {
      const { data: lead, error } = await supabase
        .from('perfil_publico_leads')
        .insert({
          perfil_publico_id: data.perfilPublicoId,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          mensagem: data.mensagem,
          origem: data.origem,
          questionario_id: data.questionarioId,
          resposta_id: data.respostaId,
          metadata: data.metadata,
        })
        .select()
        .single();

      if (error) throw error;
      return lead;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['perfil-publico-leads', variables.perfilPublicoId] });
      toast({
        title: 'Mensagem enviada!',
        description: 'Entraremos em contato em breve.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePerfilPublicoLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateLeadData) => {
      const { error } = await supabase
        .from('perfil_publico_leads')
        .update({ status: data.status })
        .eq('id', data.leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil-publico-leads'] });
      toast({
        title: 'Status atualizado',
        description: 'O status do lead foi atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
