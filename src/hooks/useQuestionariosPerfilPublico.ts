import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useQuestionariosPerfilPublico = (perfilPublicoId?: string) => {
  return useQuery({
    queryKey: ['questionarios-perfil-publico', perfilPublicoId],
    queryFn: async () => {
      if (!perfilPublicoId) return [];

      const { data, error } = await supabase
        .from('questionarios_diagnostico')
        .select('*')
        .eq('perfil_publico_id', perfilPublicoId)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!perfilPublicoId,
  });
};
