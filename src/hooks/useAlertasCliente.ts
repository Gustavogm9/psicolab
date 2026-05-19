import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAlertasCliente(clienteId: string | undefined) {
  return useQuery({
    queryKey: ['alertas-cliente', clienteId],
    queryFn: async () => {
      if (!clienteId) throw new Error('ID do cliente não fornecido');
      
      // Buscar projetos do cliente primeiro
      const { data: projetos, error: projetosError } = await supabase
        .from('projetos')
        .select('id')
        .eq('cliente_id', clienteId);

      if (projetosError) throw projetosError;
      
      const projetoIds = projetos?.map(p => p.id) || [];
      
      if (projetoIds.length === 0) return [];

      // Buscar alertas relacionados aos projetos do cliente
      const { data, error } = await supabase
        .from('alertas')
        .select('*')
        .in('projeto_id', projetoIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!clienteId,
  });
}
