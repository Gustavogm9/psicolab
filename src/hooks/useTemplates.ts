import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useTemplates = () => {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['templates', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('avaliacoes_templates')
        .select('*')
        .eq('consultora_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

interface TemplateCreateData {
  nome: string;
  descricao?: string;
  categoria: string;
  tipo: string;
  questoes: any;
  configuracoes?: any;
  numero_questoes?: number;
  tempo_estimado?: number;
}

export const useTemplateCreate = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  return useMutation({
    mutationFn: async (data: TemplateCreateData) => {
      if (!effectiveUserId) throw new Error('Usuário não autenticado');

      const { data: template, error } = await supabase
        .from('avaliacoes_templates')
        .insert({
          ...data,
          consultora_id: effectiveUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Template criado',
        description: 'Template criado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useTemplateDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('avaliacoes_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      return templateId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Template excluído',
        description: 'Template excluído com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

interface TemplateUpdateData {
  id: string;
  data: {
    nome?: string;
    descricao?: string;
    categoria?: string;
    tipo?: string;
    questoes?: any;
    configuracoes?: any;
    numero_questoes?: number;
    tempo_estimado?: number;
  };
}

export const useTemplateUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: TemplateUpdateData) => {
      const { data: template, error } = await supabase
        .from('avaliacoes_templates')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Template atualizado',
        description: 'Template atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
