import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError } from '@/lib/error-messages';

interface EnviarConvitesData {
  avaliacaoId: string;
  participanteIds?: string[];
}

export const useEnviarConvites = () => {
  return useMutation({
    mutationFn: async ({ avaliacaoId, participanteIds }: EnviarConvitesData) => {
      const { data, error } = await supabase.functions.invoke('send-avaliacao-convite', {
        body: { avaliacaoId, participanteIds },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const { sent, failed, total } = data;
      
      if (failed === 0) {
        toast({
          title: 'Convites enviados',
          description: `${sent} convite(s) enviado(s) com sucesso`,
        });
      } else {
        toast({
          title: 'Convites enviados com ressalvas',
          description: `${sent} de ${total} convite(s) enviado(s). ${failed} falharam.`,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao enviar convites',
        description: getUserFriendlyError(error, { action: 'enviar', entity: 'avaliação' }),
        variant: 'destructive',
      });
    },
  });
};
