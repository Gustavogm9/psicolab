import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProjetosCliente(clienteId: string | undefined) {
  return useQuery({
    queryKey: ['projetos-cliente', clienteId],
    queryFn: async () => {
      if (!clienteId) throw new Error('ID do cliente não fornecido');
      
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!clienteId,
  });
}
