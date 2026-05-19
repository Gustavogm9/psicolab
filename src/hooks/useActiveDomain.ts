import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ActiveDomainResult {
  isCustomDomain: boolean;
  domain: string | null;
  perfilPublicoId: string | null;
  slug: string | null;
}

/**
 * Hook que detecta se o usuário está acessando via domínio customizado
 * Compara window.location.hostname com domínios ativos no banco
 */
export const useActiveDomain = () => {
  return useQuery<ActiveDomainResult>({
    queryKey: ['active-domain', typeof window !== 'undefined' ? window.location.hostname : null],
    queryFn: async () => {
      // Verificar se estamos no browser
      if (typeof window === 'undefined') {
        return {
          isCustomDomain: false,
          domain: null,
          perfilPublicoId: null,
          slug: null,
        };
      }

      const currentHostname = window.location.hostname;

      // Ignorar localhost, domínios do Lovable e domínio padrão do sistema
      if (
        currentHostname === 'localhost' ||
        currentHostname.includes('lovable.app') ||
        currentHostname.includes('127.0.0.1') ||
        currentHostname === 'psicosystem.guilds.com.br'
      ) {
        return {
          isCustomDomain: false,
          domain: null,
          perfilPublicoId: null,
          slug: null,
        };
      }

      // Buscar domínio customizado ativo que corresponda ao hostname atual
      const { data, error } = await supabase
        .from('dominios_customizados')
        .select(`
          id,
          dominio,
          perfil_publico_id,
          perfis_publicos (
            slug
          )
        `)
        .eq('status', 'ativo')
        .eq('dominio', currentHostname)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar domínio customizado:', error);
        return {
          isCustomDomain: false,
          domain: null,
          perfilPublicoId: null,
          slug: null,
        };
      }

      if (data) {
        return {
          isCustomDomain: true,
          domain: data.dominio,
          perfilPublicoId: data.perfil_publico_id,
          slug: (data.perfis_publicos as any)?.slug || null,
        };
      }

      return {
        isCustomDomain: false,
        domain: null,
        perfilPublicoId: null,
        slug: null,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};
