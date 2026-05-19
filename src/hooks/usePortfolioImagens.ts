import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateImageFile, MAX_FILE_SIZE_PORTFOLIO } from "@/lib/file-validation";
import { getUserFriendlyError } from "@/lib/error-messages";
import { useAuth } from "@/contexts/AuthContext";

export interface PortfolioImagem {
  id: string;
  perfil_publico_id: string;
  titulo: string;
  descricao: string | null;
  imagem_url: string;
  categoria: string | null;
  ordem: number;
  destaque: boolean;
  created_at: string;
  updated_at: string;
}

export function usePortfolioImagens(perfilPublicoId?: string) {
  return useQuery({
    queryKey: ["portfolio-imagens", perfilPublicoId],
    queryFn: async () => {
      if (!perfilPublicoId) return [];
      
      const { data, error } = await supabase
        .from("portfolio_imagens")
        .select("*")
        .eq("perfil_publico_id", perfilPublicoId)
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as PortfolioImagem[];
    },
    enabled: !!perfilPublicoId,
  });
}

export function usePortfolioImagensMutations() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  const uploadImage = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    // Validar arquivo (5MB máximo para portfolio)
    if (!validateImageFile(file, MAX_FILE_SIZE_PORTFOLIO)) {
      throw new Error('Arquivo inválido');
    }
    
    const { error: uploadError, data } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async ({ 
      file, 
      titulo, 
      descricao, 
      categoria, 
      ordem,
      destaque,
      perfilPublicoId 
    }: {
      file: File;
      titulo: string;
      descricao?: string;
      categoria?: string;
      ordem?: number;
      destaque?: boolean;
      perfilPublicoId: string;
    }) => {
      if (!effectiveUserId) throw new Error("Não autenticado");

      const imageUrl = await uploadImage(file, effectiveUserId);

      const { data, error } = await supabase
        .from("portfolio_imagens")
        .insert({
          perfil_publico_id: perfilPublicoId,
          titulo,
          descricao,
          imagem_url: imageUrl,
          categoria,
          ordem: ordem ?? 0,
          destaque: destaque ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-imagens", variables.perfilPublicoId] });
      toast.success("Imagem adicionada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'criar', entity: 'imagem' }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ 
      id, 
      titulo, 
      descricao, 
      categoria, 
      ordem,
      destaque,
      perfilPublicoId 
    }: {
      id: string;
      titulo?: string;
      descricao?: string;
      categoria?: string;
      ordem?: number;
      destaque?: boolean;
      perfilPublicoId: string;
    }) => {
      const { data, error } = await supabase
        .from("portfolio_imagens")
        .update({
          titulo,
          descricao,
          categoria,
          ordem,
          destaque,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-imagens", variables.perfilPublicoId] });
      toast.success("Imagem atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'atualizar', entity: 'imagem' }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, imagemUrl, perfilPublicoId }: { id: string; imagemUrl: string; perfilPublicoId: string }) => {
      // Extrair o caminho do arquivo da URL
      const urlParts = imagemUrl.split('/portfolio-images/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage
          .from('portfolio-images')
          .remove([filePath]);
      }

      const { error } = await supabase
        .from("portfolio_imagens")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { perfilPublicoId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-imagens", data.perfilPublicoId] });
      toast.success("Imagem removida com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'deletar', entity: 'imagem' }));
    },
  });

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
