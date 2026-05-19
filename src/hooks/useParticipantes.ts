import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useParticipantes = (avaliacaoId: string) => {
  return useQuery({
    queryKey: ['avaliacoes-participantes', avaliacaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('avaliacoes_participantes')
        .select('*')
        .eq('avaliacao_id', avaliacaoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!avaliacaoId,
  });
};

export const useParticipanteCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ avaliacaoId, nome, email }: { avaliacaoId: string; nome: string; email: string }) => {
      const { data, error } = await supabase
        .from('avaliacoes_participantes')
        .insert({
          avaliacao_id: avaliacaoId,
          nome,
          email,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes-participantes', variables.avaliacaoId] });
      toast({
        title: 'Participante adicionado',
        description: 'Participante cadastrado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar participante',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useParticipantesBulkCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ avaliacaoId, participantes }: { avaliacaoId: string; participantes: Array<{ nome: string; email: string }> }) => {
      const { data, error } = await supabase
        .from('avaliacoes_participantes')
        .insert(
          participantes.map(p => ({
            avaliacao_id: avaliacaoId,
            nome: p.nome,
            email: p.email,
          }))
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes-participantes', variables.avaliacaoId] });
      toast({
        title: 'Participantes adicionados',
        description: `${data?.length || 0} participante(s) cadastrado(s) com sucesso`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar participantes',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useParticipanteDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ avaliacaoId, participanteId }: { avaliacaoId: string; participanteId: string }) => {
      const { error } = await supabase
        .from('avaliacoes_participantes')
        .delete()
        .eq('id', participanteId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes-participantes', variables.avaliacaoId] });
      toast({
        title: 'Participante removido',
        description: 'Participante removido com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover participante',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
