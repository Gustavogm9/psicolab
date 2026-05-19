import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useQuestionarioDetalhes = (idOrSlug: string) => {
  return useQuery({
    queryKey: ['questionario', idOrSlug],
    queryFn: async () => {
      // Tentar buscar por ID primeiro, depois por slug
      let query = supabase
        .from('questionarios_diagnostico')
        .select(`
          *,
          cliente:clientes(id, nome),
          questoes:questoes_diagnostico(*)
        `);

      // Verificar se é UUID ou slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      
      if (isUUID) {
        query = query.eq('id', idOrSlug);
      } else {
        query = query.eq('slug', idOrSlug);
      }

      const { data, error } = await query.single();

      if (error) throw error;

      // Ordenar questões por ordem
      if (data.questoes) {
        data.questoes.sort((a: any, b: any) => a.ordem - b.ordem);
      }

      return data;
    },
    enabled: !!idOrSlug,
  });
};
