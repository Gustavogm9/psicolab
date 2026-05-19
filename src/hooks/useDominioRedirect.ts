import { useEffect } from 'react';
import { useActiveDomain } from './useActiveDomain';
import { supabase } from '@/integrations/supabase/client';

interface UseDominioRedirectOptions {
  perfilPublicoId?: string;
  consultoraId?: string;
}

/**
 * Hook que implementa redirecionamento 301 automático da URL padrão
 * para o domínio customizado quando ativo, com proteção contra loops
 * 
 * @param options - Pode receber perfilPublicoId ou consultoraId (user_id)
 */
export const useDominioRedirect = (options?: string | UseDominioRedirectOptions) => {
  const { data: activeDomain } = useActiveDomain();

  // Normalizar parâmetros (backward compatibility)
  const params: UseDominioRedirectOptions = typeof options === 'string' 
    ? { perfilPublicoId: options }
    : options || {};

  useEffect(() => {
    // Se já está em domínio customizado, não faz nada
    if (activeDomain?.isCustomDomain) {
      return;
    }

    // Se não tem nenhum identificador, não faz nada
    if (!params.perfilPublicoId && !params.consultoraId) {
      return;
    }

    // Verificar se tem parâmetro de proteção contra loop
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('no-redirect')) {
      return;
    }

    // Verificar se existe domínio customizado ativo
    const checkCustomDomain = async () => {
      let query = supabase
        .from('dominios_customizados')
        .select('dominio');

      if (params.perfilPublicoId) {
        query = query.eq('perfil_publico_id', params.perfilPublicoId);
      } else if (params.consultoraId) {
        // Buscar perfil público pelo user_id (consultora_id)
        const { data: perfil } = await supabase
          .from('perfis_publicos')
          .select('id')
          .eq('user_id', params.consultoraId)
          .eq('ativo', true)
          .maybeSingle();

        if (!perfil) return;
        query = query.eq('perfil_publico_id', perfil.id);
      }

      const { data, error } = await query
        .eq('status', 'ativo')
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar domínio customizado:', error);
        return;
      }

      // Se existe domínio customizado ativo, fazer redirect 301
      if (data?.dominio) {
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        const currentHash = window.location.hash;
        
        // Construir URL completa no domínio customizado
        const newUrl = `https://${data.dominio}${currentPath}${currentSearch}${currentHash}`;
        
        console.log('[Redirect 301] De:', window.location.href, '→ Para:', newUrl);
        
        // Redirect 301 (permanente)
        window.location.replace(newUrl);
      }
    };

    checkCustomDomain();
  }, [params.perfilPublicoId, params.consultoraId, activeDomain]);
};
