import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useClientes() {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['clientes', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('consultora_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}
