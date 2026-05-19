import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useLeadContatos(leadId: string | undefined) {
  return useQuery({
    queryKey: ['lead-contatos', leadId],
    queryFn: async () => {
      if (!leadId) throw new Error('ID do lead não fornecido');
      
      const { data, error } = await supabase
        .from('leads_contatos')
        .select('*')
        .eq('lead_id', leadId)
        .eq('ativo', true)
        .order('principal', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!leadId,
  });
}
