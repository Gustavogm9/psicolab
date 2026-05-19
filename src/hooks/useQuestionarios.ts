import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseQuestionariosFilters {
  categoria?: string;
  ativo?: boolean;
  clienteId?: string;
}

export const useQuestionarios = (filters?: UseQuestionariosFilters) => {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['questionarios', filters, effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) {
        throw new Error('Usuário não autenticado');
      }

      let query = supabase
        .from('questionarios_diagnostico')
        .select(`
          *,
          cliente:clientes(id, nome)
        `)
        .eq('consultora_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (filters?.categoria) {
        query = query.eq('categoria', filters.categoria);
      }

      if (filters?.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo);
      }

      if (filters?.clienteId) {
        query = query.eq('cliente_id', filters.clienteId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};
