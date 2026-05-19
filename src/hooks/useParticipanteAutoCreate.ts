import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AutoCreateData {
  avaliacaoId: string;
  nome: string;
  email: string;
}

export const useParticipanteAutoCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ avaliacaoId, nome, email }: AutoCreateData) => {
      console.log('[useParticipanteAutoCreate] Iniciando auto-cadastro:', { avaliacaoId, nome, email });
      
      // Verificar se já existe participante com este email nesta avaliação
      console.log('[useParticipanteAutoCreate] Verificando participante existente...');
      const { data: existente, error: searchError } = await supabase
        .from('avaliacoes_participantes')
        .select('*')
        .eq('avaliacao_id', avaliacaoId)
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (searchError) {
        console.error('[useParticipanteAutoCreate] Erro ao buscar participante:', searchError);
        throw searchError;
      }

      console.log('[useParticipanteAutoCreate] Resultado da busca:', existente);

      if (existente) {
        // Se já respondeu, retornar com flag
        if (existente.respondido) {
          console.log('[useParticipanteAutoCreate] Participante já respondeu');
          return { ...existente, jaRespondeu: true };
        }
        // Retornar participante existente
        console.log('[useParticipanteAutoCreate] Participante existente encontrado');
        return { ...existente, jaRespondeu: false };
      }

      // Criar novo participante
      console.log('[useParticipanteAutoCreate] Criando novo participante...');
      const { data: novoParticipante, error: insertError } = await supabase
        .from('avaliacoes_participantes')
        .insert({
          avaliacao_id: avaliacaoId,
          nome: nome.trim(),
          email: email.toLowerCase().trim(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('[useParticipanteAutoCreate] Erro ao criar participante:', insertError);
        throw insertError;
      }

      console.log('[useParticipanteAutoCreate] Participante criado com sucesso:', novoParticipante);
      return { ...novoParticipante, jaRespondeu: false };
    },
    onSuccess: (data) => {
      if (!data.jaRespondeu) {
        queryClient.invalidateQueries({ queryKey: ['participantes'] });
      }
    },
    onError: (error: any) => {
      console.error('Erro ao auto-cadastrar participante:', error);
      toast({
        title: 'Erro ao iniciar avaliação',
        description: 'Não foi possível registrar sua participação. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};
