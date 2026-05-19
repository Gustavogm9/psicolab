import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface IntervencaoFilters {
  cliente?: string;
  categoria?: string;
  status?: string;
  busca?: string;
}

export function useIntervencoes(filters?: IntervencaoFilters) {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['intervencoes', filters, effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('intervencoes')
        .select(`
          *,
          clientes:cliente_id (
            id,
            nome
          )
        `)
        .eq('consultora_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (filters?.cliente) {
        query = query.eq('cliente_id', filters.cliente);
      }

      if (filters?.categoria) {
        query = query.eq('categoria', filters.categoria);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.busca) {
        query = query.or(`titulo.ilike.%${filters.busca}%,descricao.ilike.%${filters.busca}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
}
