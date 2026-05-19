import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useClienteContatos(clienteId: string | undefined) {
  return useQuery({
    queryKey: ['cliente-contatos', clienteId],
    queryFn: async () => {
      if (!clienteId) throw new Error('ID do cliente não fornecido');
      
      const { data, error } = await supabase
        .from('clientes_contatos')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('ativo', true)
        .order('principal', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!clienteId,
  });
}
