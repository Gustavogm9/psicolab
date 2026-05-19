import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { addDays, isBefore, isToday, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

interface Lead {
  id: string;
  nome: string;
  proximo_followup: string | null;
  consultora_id: string;
}

export const useFollowupAlerts = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  // Buscar leads com follow-up próximo ou vencido
  const { data: leadsComFollowup = [], isLoading } = useQuery({
    queryKey: ['leads-followup-pendentes', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];

      const amanha = addDays(new Date(), 1);
      amanha.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('leads_diagnostico')
        .select('id, nome, proximo_followup, consultora_id')
        .eq('consultora_id', effectiveUserId)
        .not('proximo_followup', 'is', null)
        .lte('proximo_followup', amanha.toISOString());

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!effectiveUserId,
    refetchInterval: 5 * 60 * 1000, // Verificar a cada 5 minutos
  });

  // Criar alertas para follow-ups pendentes
  useEffect(() => {
    const criarAlertasFollowup = async () => {
      if (!leadsComFollowup || leadsComFollowup.length === 0 || !effectiveUserId) return;

      for (const lead of leadsComFollowup) {
        if (!lead.proximo_followup) continue;

        const dataFollowup = new Date(lead.proximo_followup);
        const hoje = new Date();
        
        // Verificar se o alerta já existe para este lead
        const { data: alertaExistente } = await supabase
          .from('alertas')
          .select('id')
          .eq('consultora_id', effectiveUserId)
          .eq('tipo', 'follow_up_pendente')
          .ilike('titulo', `%${lead.nome}%`)
          .eq('lido', false)
          .maybeSingle();

        // Se já existe um alerta não lido, pular
        if (alertaExistente) continue;

        let titulo = '';
        let descricao = '';

        if (isBefore(dataFollowup, hoje)) {
          // Follow-up vencido
          titulo = `⚠️ Follow-up vencido: ${lead.nome}`;
          descricao = `O follow-up com ${lead.nome} estava agendado para ${format(dataFollowup, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} e está atrasado.`;
        } else if (isToday(dataFollowup)) {
          // Follow-up hoje
          titulo = `📅 Follow-up hoje: ${lead.nome}`;
          descricao = `Você tem um follow-up agendado com ${lead.nome} para hoje às ${format(dataFollowup, 'HH:mm')}.`;
        } else {
          // Follow-up amanhã
          titulo = `📅 Follow-up amanhã: ${lead.nome}`;
          descricao = `Você tem um follow-up agendado com ${lead.nome} para amanhã às ${format(dataFollowup, 'HH:mm')}.`;
        }

        // Criar alerta
        const { error } = await supabase
          .from('alertas')
          .insert({
            consultora_id: effectiveUserId,
            tipo: 'follow_up_pendente',
            titulo,
            descricao,
            lido: false,
          });

        if (error) {
          console.error('Erro ao criar alerta de follow-up:', error);
        }
      }

      // Invalidar queries de alertas para atualizar o badge
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
    };

    criarAlertasFollowup();
  }, [leadsComFollowup, queryClient, effectiveUserId]);

  return {
    leadsComFollowup,
    totalPendentes: leadsComFollowup.length,
    isLoading,
  };
};
