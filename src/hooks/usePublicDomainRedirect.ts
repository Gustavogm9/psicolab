import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveDomain } from './useActiveDomain';

interface UsePublicDomainRedirectOptions {
  consultoraId: string | null | undefined;
  enabled?: boolean;
}

/**
 * Hook que verifica e executa redirect para domínio customizado ANTES da renderização.
 * Retorna se a verificação foi concluída para controlar o loading state.
 */
export const usePublicDomainRedirect = ({ consultoraId, enabled = true }: UsePublicDomainRedirectOptions) => {
  const [isChecking, setIsChecking] = useState(true);
  const { data: activeDomain, isLoading: isDomainLoading } = useActiveDomain();

  useEffect(() => {
    // Se não tem consultoraId ou está desabilitado, não precisa verificar
    if (!consultoraId || !enabled) {
      setIsChecking(false);
      return;
    }

    // Ainda carregando informações do domínio ativo
    if (isDomainLoading) {
      return;
    }

    // Se já está em domínio customizado, não precisa redirecionar
    if (activeDomain?.isCustomDomain) {
      setIsChecking(false);
      return;
    }

    // Verificar se existe domínio customizado para este psicólogo
    const checkAndRedirect = async () => {
      try {
        // Primeiro buscar o perfil público do psicólogo
        const { data: perfil } = await supabase
          .from('perfis_publicos')
          .select('id')
          .eq('user_id', consultoraId)
          .eq('ativo', true)
          .maybeSingle();

        if (!perfil) {
          setIsChecking(false);
          return;
        }

        // Buscar domínio customizado ativo
        const { data: dominio } = await supabase
          .from('dominios_customizados')
          .select('dominio')
          .eq('perfil_publico_id', perfil.id)
          .eq('status', 'ativo')
          .maybeSingle();

        if (dominio?.dominio) {
          // Construir nova URL preservando path, query e hash
          const currentUrl = window.location;
          const newUrl = `https://${dominio.dominio}${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
          
          // Redirecionar imediatamente - não setar isChecking para manter loading
          window.location.replace(newUrl);
          return;
        }

        // Não há domínio customizado, pode prosseguir
        setIsChecking(false);
      } catch (error) {
        console.error('Erro ao verificar domínio customizado:', error);
        setIsChecking(false);
      }
    };

    checkAndRedirect();
  }, [consultoraId, activeDomain?.isCustomDomain, isDomainLoading, enabled]);

  return { isChecking };
};
