import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DominioCustomizado {
  id: string;
  perfil_publico_id: string;
  dominio: string;
  token_verificacao: string;
  status: 'pendente' | 'dns_configurado' | 'aguardando_aprovacao' | 'ativo' | 'erro' | 'rejeitado';
  dns_verificado_em: string | null;
  ativado_em: string | null;
  erro_mensagem: string | null;
  notas_admin: string | null;
  created_at: string;
  updated_at: string;
}

export interface DominioVerificacao {
  id: string;
  dominio_id: string;
  tipo_verificacao: string;
  sucesso: boolean;
  detalhes: any;
  verificado_em: string;
}

export const useDominiosCustomizados = (perfilPublicoId?: string) => {
  return useQuery({
    queryKey: ['dominios-customizados', perfilPublicoId],
    queryFn: async () => {
      if (!perfilPublicoId) return [];
      
      const { data, error } = await supabase
        .from('dominios_customizados')
        .select('*')
        .eq('perfil_publico_id', perfilPublicoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DominioCustomizado[];
    },
    enabled: !!perfilPublicoId,
  });
};

export const useDominioVerificacoes = (dominioId?: string) => {
  return useQuery({
    queryKey: ['dominio-verificacoes', dominioId],
    queryFn: async () => {
      if (!dominioId) return [];
      
      const { data, error } = await supabase
        .from('dominios_verificacoes')
        .select('*')
        .eq('dominio_id', dominioId)
        .order('verificado_em', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as DominioVerificacao[];
    },
    enabled: !!dominioId,
  });
};

export const useAllDominios = () => {
  return useQuery({
    queryKey: ['all-dominios-customizados'],
    queryFn: async () => {
      // Forçar refresh da sessão antes de buscar dados
      await supabase.auth.refreshSession();
      
      // Verificar sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Admin - Sessão ativa:', !!session, 'User ID:', session?.user?.id);
      
      const { data, error } = await supabase
        .from('dominios_customizados')
        .select(`
          *,
          perfis_publicos (
            slug,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar domínios:', error);
        throw error;
      }
      
      console.log('✅ Domínios carregados para admin:', data?.length || 0);
      console.log('📋 Dados dos domínios:', data);
      return data;
    },
    retry: 3,
    retryDelay: 1000,
  });
};
