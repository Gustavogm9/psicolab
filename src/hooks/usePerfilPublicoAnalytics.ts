import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveDomain } from './useActiveDomain';

interface TrackEventData {
  perfilPublicoId: string;
  tipoEvento: 'visita' | 'clique_whatsapp' | 'clique_servico' | 'clique_linkedin' | 'clique_instagram' | 'envio_formulario' | 'clique_cta_hero' | 'clique_cta_intermediario' | 'clique_cta_rodape' | 'clique_cta_flutuante' | 'clique_portfolio' | 'clique_estatistica' | 'visualizacao_passo_processo' | 'clique_especialidade';
  origem?: string;
  metadata?: any;
}

export const useTrackEvent = () => {
  const { data: activeDomain } = useActiveDomain();
  
  return useMutation({
    mutationFn: async (data: TrackEventData) => {
      // Incluir informação sobre qual URL foi usada no metadata
      const enhancedMetadata = {
        ...data.metadata,
        url: activeDomain?.isCustomDomain 
          ? `https://${activeDomain.domain}`
          : window.location.href,
        isDomainCustomizado: activeDomain?.isCustomDomain || false,
      };
      
      const { error } = await supabase
        .from('perfil_publico_analytics')
        .insert({
          perfil_publico_id: data.perfilPublicoId,
          tipo_evento: data.tipoEvento,
          origem: data.origem,
          metadata: enhancedMetadata,
        });

      if (error) throw error;
    },
  });
};

export const usePerfilPublicoAnalytics = (perfilPublicoId?: string, periodoDias?: number) => {
  return useQuery({
    queryKey: ['perfil-publico-analytics', perfilPublicoId, periodoDias],
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

      // Calcular métricas
      const totalVisitas = filteredData.filter(a => a.tipo_evento === 'visita').length;
      const totalCliquesWhatsApp = filteredData.filter(a => a.tipo_evento === 'clique_whatsapp').length;
      const totalEnviosFormulario = filteredData.filter(a => a.tipo_evento === 'envio_formulario').length;
      const totalCliquesServicos = filteredData.filter(a => a.tipo_evento === 'clique_servico').length;
      const totalCliquesCTAHero = filteredData.filter(a => a.tipo_evento === 'clique_cta_hero').length;

      // Visitas por dia
      const visitasPorDia = filteredData
        .filter(a => a.tipo_evento === 'visita')
        .reduce((acc, item) => {
          const dia = new Date(item.created_at).toLocaleDateString('pt-BR');
          acc[dia] = (acc[dia] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      return {
        eventos: filteredData,
        metricas: {
          totalVisitas,
          totalCliquesWhatsApp,
          totalEnviosFormulario,
          totalCliquesServicos,
          totalCliquesCTAHero,
          visitasPorDia,
        },
      };
    },
    enabled: !!perfilPublicoId,
  });
};
