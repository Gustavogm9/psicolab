import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/error-messages';
import { useAuth } from '@/contexts/AuthContext';

interface CriarCategoriaData {
  nome: string;
  tipo: 'questionario' | 'avaliacao' | 'intervencao' | 'evento';
  cor?: string;
  icone?: string;
}

interface AtualizarCategoriaData {
  id: string;
  nome?: string;
  cor?: string;
  icone?: string;
  ordem?: number;
}

export const useCategoriasMutations = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  const criarCategoria = useMutation({
    mutationFn: async (data: CriarCategoriaData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      // Buscar próximo número de ordem
      const { data: existentes } = await supabase
        .from('categorias_customizadas')
        .select('ordem')
        .eq('consultora_id', effectiveUserId)
        .eq('tipo', data.tipo)
        .order('ordem', { ascending: false })
        .limit(1);

      const proximaOrdem = existentes?.[0]?.ordem ? existentes[0].ordem + 1 : 100;

      const { data: novaCategoria, error } = await supabase
        .from('categorias_customizadas')
        .insert({
          consultora_id: effectiveUserId,
          nome: data.nome,
          tipo: data.tipo,
          cor: data.cor || '#6366f1',
          icone: data.icone || 'Tag',
          ordem: proximaOrdem,
        })
        .select()
        .single();

      if (error) throw error;
      return novaCategoria;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias-personalizadas'] });
      const message = getSuccessMessage({ action: 'criar', entity: 'categoria', gender: 'a' });
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar categoria',
        description: getUserFriendlyError(error, { action: 'criar', entity: 'categoria' }),
        variant: 'destructive',
      });
    },
  });

  const atualizarCategoria = useMutation({
    mutationFn: async (data: AtualizarCategoriaData) => {
      const { id, ...updates } = data;
      const { error } = await supabase
        .from('categorias_customizadas')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias-personalizadas'] });
      const message = getSuccessMessage({ action: 'atualizar', entity: 'categoria', gender: 'a' });
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar categoria',
        description: getUserFriendlyError(error, { action: 'atualizar', entity: 'categoria' }),
        variant: 'destructive',
      });
    },
  });

  const deletarCategoria = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete
      const { error } = await supabase
        .from('categorias_customizadas')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias-personalizadas'] });
      const message = getSuccessMessage({ action: 'deletar', entity: 'categoria', gender: 'a' });
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir categoria',
        description: getUserFriendlyError(error, { action: 'deletar', entity: 'categoria' }),
        variant: 'destructive',
      });
    },
  });

  return {
    criarCategoria,
    atualizarCategoria,
    deletarCategoria,
  };
};
