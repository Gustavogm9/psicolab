import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAvaliacaoPublica = (slugOrToken: string, isToken: boolean = false) => {
  return useQuery({
    queryKey: ['avaliacao-publica', slugOrToken, isToken],
    queryFn: async () => {
      if (isToken) {
        // Buscar por token de participante
        const { data: participante, error: participanteError } = await supabase
          .from('avaliacoes_participantes')
          .select(`
            *,
            avaliacao:avaliacoes(
              *,
              cliente:clientes(nome)
            )
          `)
          .eq('token_acesso', slugOrToken)
          .single();

        if (participanteError) throw participanteError;
        if (!participante?.avaliacao) throw new Error('Avaliação não encontrada');

        // Buscar questões
        const { data: questoes, error: questoesError } = await supabase
          .from('avaliacoes_questoes')
          .select('*')
          .eq('avaliacao_id', participante.avaliacao.id)
          .order('ordem');

        if (questoesError) throw questoesError;

        return {
          ...participante.avaliacao,
          questoes: questoes || [],
          participante,
          tipo_acesso: 'token'
        };
      } else {
        // Buscar por slug - verificar se é público OU restrito com auto-identificação
        const { data: avaliacao, error: avaliacaoError } = await supabase
          .from('avaliacoes')
          .select(`
            *,
            cliente:clientes(nome)
          `)
          .eq('slug', slugOrToken)
          .eq('status', 'ativa')
          .or('tipo_acesso.eq.publico,permite_auto_identificacao.eq.true')
          .single();

        if (avaliacaoError) throw avaliacaoError;

        // Buscar questões
        const { data: questoes, error: questoesError } = await supabase
          .from('avaliacoes_questoes')
          .select('*')
          .eq('avaliacao_id', avaliacao.id)
          .order('ordem');

        if (questoesError) throw questoesError;

        // Determinar modo de acesso
        let modoAcesso = 'publico';
        if (avaliacao.tipo_acesso === 'restrito' && avaliacao.permite_auto_identificacao) {
          modoAcesso = 'auto_identificacao';
        }

        return {
          ...avaliacao,
          questoes: questoes || [],
          tipo_acesso: modoAcesso
        };
      }
    },
    enabled: !!slugOrToken,
  });
};
