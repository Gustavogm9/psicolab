import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAnalyticsPorDominio = (perfilPublicoId?: string, periodoDias?: number) => {
  return useQuery({
    queryKey: ['analytics-por-dominio', perfilPublicoId, periodoDias],
    queryFn: async () => {
      if (!perfilPublicoId) return null;

      const { data, error } = await supabase
        .from('perfil_publico_analytics')
        .select('*')
        .eq('perfil_publico_id', perfilPublicoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filtrar por período se especificado
      let filteredData = data || [];
      if (periodoDias) {
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - periodoDias);
        filteredData = filteredData.filter(a => new Date(a.created_at) >= dataLimite);
      }

      // Separar eventos por tipo de domínio
      const eventosDominioCustomizado = filteredData.filter(
        e => (e.metadata as any)?.isDomainCustomizado === true
      );
      const eventosUrlPadrao = filteredData.filter(
        e => (e.metadata as any)?.isDomainCustomizado === false || !(e.metadata as any)?.isDomainCustomizado
      );

      // Calcular métricas para domínio customizado
      const metricasCustomizado = {
        totalVisitas: eventosDominioCustomizado.filter(e => e.tipo_evento === 'visita').length,
        totalCliquesWhatsApp: eventosDominioCustomizado.filter(e => e.tipo_evento === 'clique_whatsapp').length,
        totalEnviosFormulario: eventosDominioCustomizado.filter(e => e.tipo_evento === 'envio_formulario').length,
        totalCliquesCTA: eventosDominioCustomizado.filter(e => 
          e.tipo_evento?.includes('clique_cta')
        ).length,
        totalCliquesServicos: eventosDominioCustomizado.filter(e => e.tipo_evento === 'clique_servico').length,
      };

      // Calcular métricas para URL padrão
      const metricasPadrao = {
        totalVisitas: eventosUrlPadrao.filter(e => e.tipo_evento === 'visita').length,
        totalCliquesWhatsApp: eventosUrlPadrao.filter(e => e.tipo_evento === 'clique_whatsapp').length,
        totalEnviosFormulario: eventosUrlPadrao.filter(e => e.tipo_evento === 'envio_formulario').length,
        totalCliquesCTA: eventosUrlPadrao.filter(e => 
          e.tipo_evento?.includes('clique_cta')
        ).length,
        totalCliquesServicos: eventosUrlPadrao.filter(e => e.tipo_evento === 'clique_servico').length,
      };

      // Calcular taxas de conversão
      const taxaConversaoCustomizado = metricasCustomizado.totalVisitas > 0
        ? ((metricasCustomizado.totalEnviosFormulario / metricasCustomizado.totalVisitas) * 100).toFixed(1)
        : '0';
      
      const taxaConversaoPadrao = metricasPadrao.totalVisitas > 0
        ? ((metricasPadrao.totalEnviosFormulario / metricasPadrao.totalVisitas) * 100).toFixed(1)
        : '0';

      // Calcular engajamento (cliques / visitas)
      const engajamentoCustomizado = metricasCustomizado.totalVisitas > 0
        ? (((metricasCustomizado.totalCliquesCTA + metricasCustomizado.totalCliquesWhatsApp + metricasCustomizado.totalCliquesServicos) / metricasCustomizado.totalVisitas) * 100).toFixed(1)
        : '0';
      
      const engajamentoPadrao = metricasPadrao.totalVisitas > 0
        ? (((metricasPadrao.totalCliquesCTA + metricasPadrao.totalCliquesWhatsApp + metricasPadrao.totalCliquesServicos) / metricasPadrao.totalVisitas) * 100).toFixed(1)
        : '0';

      // Evolução temporal (últimos 7 dias)
      const ultimosSete = [];
      for (let i = 6; i >= 0; i--) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        const diaStr = data.toLocaleDateString('pt-BR');
        
        const visitasCustomizado = eventosDominioCustomizado.filter(
          e => e.tipo_evento === 'visita' && 
          new Date(e.created_at).toLocaleDateString('pt-BR') === diaStr
        ).length;
        
        const visitasPadrao = eventosUrlPadrao.filter(
          e => e.tipo_evento === 'visita' && 
          new Date(e.created_at).toLocaleDateString('pt-BR') === diaStr
        ).length;
        
        ultimosSete.push({
          data: diaStr,
          dominioCustomizado: visitasCustomizado,
          urlPadrao: visitasPadrao,
        });
      }

      return {
        dominioCustomizado: {
          metricas: metricasCustomizado,
          taxaConversao: taxaConversaoCustomizado,
          engajamento: engajamentoCustomizado,
        },
        urlPadrao: {
          metricas: metricasPadrao,
          taxaConversao: taxaConversaoPadrao,
          engajamento: engajamentoPadrao,
        },
        evolucaoTemporal: ultimosSete,
        totalGeral: {
          visitas: metricasCustomizado.totalVisitas + metricasPadrao.totalVisitas,
          leads: metricasCustomizado.totalEnviosFormulario + metricasPadrao.totalEnviosFormulario,
        },
      };
    },
    enabled: !!perfilPublicoId,
  });
};
