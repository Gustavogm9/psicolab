import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BibliotecaFilters {
  categoria?: string;
  busca?: string;
}

export function useBibliotecaIntervencoes(filters?: BibliotecaFilters) {
  return useQuery({
    queryKey: ['biblioteca-intervencoes', filters],
    queryFn: async () => {
      let query = supabase
        .from('biblioteca_intervencoes')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (filters?.categoria) {
        query = query.eq('categoria', filters.categoria);
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
