import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAvaliacoes = () => {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['avaliacoes', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          cliente:clientes(nome),
          avaliacoes_participantes(id, respondido),
          avaliacoes_respostas_publicas(id)
        `)
        .eq('consultora_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((a: any) => {
        const participantes = a.avaliacoes_participantes || [];
        const respostasPublicas = a.avaliacoes_respostas_publicas || [];
        const totalParticipantes = participantes.length;
        const respondidosParticipantes = participantes.filter((p: any) => p.respondido).length;
        const totalRespostas = respondidosParticipantes + respostasPublicas.length;
        const totalEsperado = totalParticipantes > 0 ? totalParticipantes : totalRespostas;
        const progresso = totalEsperado > 0
          ? Math.round((totalRespostas / totalEsperado) * 100)
          : 0;
        return {
          ...a,
          participantes_total: totalEsperado,
          participantes_responderam: totalRespostas,
          progresso,
        };
      });
    },
  });
};
