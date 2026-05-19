import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDominioMutations = () => {
  const queryClient = useQueryClient();

  const adicionarDominio = useMutation({
    mutationFn: async ({ perfilPublicoId, dominio }: { perfilPublicoId: string; dominio: string }) => {
      // Validar formato do domínio
      const dominioLimpo = dominio.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      if (!dominioLimpo.includes('.')) {
        throw new Error('Domínio inválido');
      }

      const { data, error } = await supabase
        .from('dominios_customizados')
        .insert({
          perfil_publico_id: perfilPublicoId,
          dominio: dominioLimpo,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dominios-customizados'] });
      toast.success('Domínio adicionado! Configure o DNS conforme as instruções.');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Este domínio já está em uso.');
      } else {
        toast.error('Erro ao adicionar domínio: ' + error.message);
      }
    },
  });

  const verificarDNS = useMutation({
    mutationFn: async (dominioId: string) => {
      const { data, error } = await supabase.functions.invoke('verificar-dns-dominio', {
        body: { dominioId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dominios-customizados'] });
      queryClient.invalidateQueries({ queryKey: ['dominio-verificacoes'] });
      
      if (data.success) {
        toast.success('DNS verificado com sucesso!');
      } else {
        toast.error('DNS ainda não configurado corretamente.');
      }
    },
    onError: (error: any) => {
      toast.error('Erro ao verificar DNS: ' + error.message);
    },
  });

  const removerDominio = useMutation({
    mutationFn: async (dominioId: string) => {
      const { error } = await supabase
        .from('dominios_customizados')
        .delete()
        .eq('id', dominioId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dominios-customizados'] });
      toast.success('Domínio removido com sucesso.');
    },
    onError: (error: any) => {
      toast.error('Erro ao remover domínio: ' + error.message);
    },
  });

  const aprovarDominio = useMutation({
    mutationFn: async ({ dominioId, notasAdmin }: { dominioId: string; notasAdmin?: string }) => {
      const { error } = await supabase
        .from('dominios_customizados')
        .update({
          status: 'ativo',
          ativado_em: new Date().toISOString(),
          notas_admin: notasAdmin,
        })
        .eq('id', dominioId);

      if (error) throw error;

      // Criar alerta para o psicólogo
      const { data: dominio } = await supabase
        .from('dominios_customizados')
        .select('perfil_publico_id, dominio, perfis_publicos(user_id)')
        .eq('id', dominioId)
        .single();

      if (dominio) {
        await supabase.from('alertas').insert({
          consultora_id: (dominio as any).perfis_publicos.user_id,
          tipo: 'dominio_ativo',
          titulo: '🌐 Domínio Ativo!',
          descricao: `Seu domínio customizado ${(dominio as any).dominio} está ativo e funcionando!`,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-dominios-customizados'] });
      toast.success('Domínio aprovado e ativado!');
    },
    onError: (error: any) => {
      toast.error('Erro ao aprovar domínio: ' + error.message);
    },
  });

  const rejeitarDominio = useMutation({
    mutationFn: async ({ dominioId, motivo }: { dominioId: string; motivo: string }) => {
      const { error } = await supabase
        .from('dominios_customizados')
        .update({
          status: 'rejeitado',
          erro_mensagem: motivo,
          notas_admin: motivo,
        })
        .eq('id', dominioId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-dominios-customizados'] });
      toast.success('Domínio rejeitado.');
    },
    onError: (error: any) => {
      toast.error('Erro ao rejeitar domínio: ' + error.message);
    },
  });

  return {
    adicionarDominio,
    verificarDNS,
    removerDominio,
    aprovarDominio,
    rejeitarDominio,
    isAdding: adicionarDominio.isPending,
    isVerifying: verificarDNS.isPending,
    isRemoving: removerDominio.isPending,
    isApproving: aprovarDominio.isPending,
    isRejecting: rejeitarDominio.isPending,
  };
};
