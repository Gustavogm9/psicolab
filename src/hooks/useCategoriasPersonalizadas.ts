import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Categoria {
  id: string;
  nome: string;
  tipo: 'questionario' | 'avaliacao' | 'intervencao' | 'evento';
  cor: string;
  icone: string;
  ordem: number;
  isSystem: boolean;
}

interface UseCategoriasPersonalizadasOptions {
  tipo?: 'questionario' | 'avaliacao' | 'intervencao' | 'evento';
}

export const useCategoriasPersonalizadas = (options?: UseCategoriasPersonalizadasOptions) => {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ['categorias-personalizadas', options?.tipo, effectiveUserId],
    queryFn: async () => {
      let query = supabase
        .from('categorias_customizadas')
        .select('*')
        .eq('ativo', true);

      if (options?.tipo) {
        query = query.eq('tipo', options.tipo);
      }

      // Buscar categorias do sistema e do usuário
      const { data, error } = await query.or(
        `consultora_id.is.null${effectiveUserId ? `,consultora_id.eq.${effectiveUserId}` : ''}`
      ).order('ordem', { ascending: true });

      if (error) throw error;

      return (data || []).map(cat => ({
        id: cat.id,
        nome: cat.nome,
        tipo: cat.tipo as 'questionario' | 'avaliacao' | 'intervencao' | 'evento',
        cor: cat.cor || '#6366f1',
        icone: cat.icone || 'Tag',
        ordem: cat.ordem || 0,
        isSystem: !cat.consultora_id,
      })) as Categoria[];
    },
  });
};
