import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface EventoFilters {
  cliente_id?: string | 'todos' | 'sem_cliente';
  tipo?: string;
  status?: string;
  periodo?: 'hoje' | 'semana' | 'mes' | 'customizado';
  data_inicio?: Date;
  data_fim?: Date;
  busca?: string;
}

export function useEventos(filters?: EventoFilters) {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['eventos', filters, effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');
      
      let query = supabase
        .from('eventos')
        .select('*, clientes(nome)')
        .eq('consultora_id', effectiveUserId);
      
      // Filtro por cliente
      if (filters?.cliente_id && filters.cliente_id !== 'todos') {
        if (filters.cliente_id === 'sem_cliente') {
          query = query.is('cliente_id', null);
        } else {
          query = query.eq('cliente_id', filters.cliente_id);
        }
      }
      
      // Filtro por tipo
      if (filters?.tipo && filters.tipo !== 'todos') {
        query = query.eq('tipo', filters.tipo);
      }
      
      // Filtro por status
      if (filters?.status && filters.status !== 'todos') {
        query = query.eq('status', filters.status);
      }
      
      // Filtro por período
      if (filters?.periodo) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        switch (filters.periodo) {
          case 'hoje':
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);
            query = query.gte('data_hora', hoje.toISOString()).lt('data_hora', amanha.toISOString());
            break;
          case 'semana':
            const fimSemana = new Date(hoje);
            fimSemana.setDate(fimSemana.getDate() + 7);
            query = query.gte('data_hora', hoje.toISOString()).lt('data_hora', fimSemana.toISOString());
            break;
          case 'mes':
            const fimMes = new Date(hoje);
            fimMes.setMonth(fimMes.getMonth() + 1);
            query = query.gte('data_hora', hoje.toISOString()).lt('data_hora', fimMes.toISOString());
            break;
          case 'customizado':
            if (filters.data_inicio) {
              query = query.gte('data_hora', filters.data_inicio.toISOString());
            }
            if (filters.data_fim) {
              query = query.lte('data_hora', filters.data_fim.toISOString());
            }
            break;
        }
      }
      
      // Busca por texto
      if (filters?.busca) {
        query = query.or(`titulo.ilike.%${filters.busca}%,local.ilike.%${filters.busca}%`);
      }
      
      query = query.order('data_hora', { ascending: true });
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useEventosHoje() {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['eventos-hoje', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return 0;
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);
      
      const { count, error } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true })
        .eq('consultora_id', effectiveUserId)
        .gte('data_hora', hoje.toISOString())
        .lt('data_hora', amanha.toISOString())
        .eq('status', 'agendado');
      
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 60000, // Atualizar a cada minuto
  });
}
