import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEventosCliente(clienteId: string | undefined) {
  return useQuery({
    queryKey: ['eventos-cliente', clienteId],
    queryFn: async () => {
      if (!clienteId) throw new Error('ID do cliente não fornecido');
      
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('data_hora', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!clienteId,
  });
}
