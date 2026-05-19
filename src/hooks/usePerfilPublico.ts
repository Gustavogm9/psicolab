import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/error-messages";
import { useAuth } from "@/contexts/AuthContext";

export interface PerfilPublico {
  id: string;
  user_id: string;
  slug: string;
  ativo: boolean;
  titulo_profissional: string | null;
  biografia: string | null;
  foto_perfil: string | null;
  foto_capa: string | null;
  favicon_url: string | null;
  gtm_id: string | null;
  facebook_pixel_id: string | null;
  google_analytics_id: string | null;
  whatsapp: string | null;
  site: string | null;
  instagram: string | null;
  linkedin: string | null;
  tema_cor_primaria: string;
  tema_cor_secundaria: string;
  tema_fonte: string;
  seo_titulo: string | null;
  seo_descricao: string | null;
  seo_palavras_chave: string[] | null;
  meta_capi_access_token?: string | null;
  facebook_domain_verification?: string | null;
  titulo_hero: string;
  subtitulo_hero: string;
  imagem_hero_url: string | null;
  cta_hero_texto: string;
  cta_hero_link: string;
  cta_flutuante_ativo?: boolean;
  cta_flutuante_texto?: string;
  cta_flutuante_link?: string;
  cta_intermediario_titulo?: string;
  cta_intermediario_subtitulo?: string;
  cta_intermediario_botao_texto?: string;
  cta_intermediario_botao_link?: string;
  cta_rodape_texto?: string;
  cta_rodape_botao_texto?: string;
  cta_rodape_botao_link?: string;
  whitelabel_id?: string | null;
  navbar_menu_items?: Array<{
    id: string;
    nome: string;
    link: string;
  }> | null;
  navbar_cta_texto?: string | null;
  navbar_cta_link?: string | null;
  estatisticas?: Array<{
    id: string;
    icone: string;
    numero: string;
    label: string;
    descricao: string;
  }> | null;
  processo_trabalho?: Array<{
    id: string;
    icone: string;
    titulo: string;
    descricao: string;
  }> | null;
  especialidades?: Array<{
    id: string;
    icone: string;
    titulo: string;
    descricao: string;
    destaque: boolean;
  }> | null;
  mostrar_secao_conteudos?: boolean;
  footer_texto_sobre?: string | null;
  beneficios: Array<{
    id: string;
    icone: string;
    titulo: string;
    descricao: string;
  }> | null;
  faqs: Array<{
    id: string;
    pergunta: string;
    resposta: string;
  }> | null;
  secoes_config: Array<{
    id: string;
    nome: string;
    visivel: boolean;
    ordem: number;
  }> | null;
  created_at: string;
  updated_at: string;
}

export function usePerfilPublico(slug?: string) {
  return useQuery({
    queryKey: ["perfil-publico", slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from("perfis_publicos")
        .select("*")
        .eq("slug", slug)
        .eq("ativo", true)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as PerfilPublico | null;
    },
    enabled: !!slug,
  });
}

export function useMyPerfilPublico() {
  const { effectiveUserId } = useAuth();

  return useQuery({
    queryKey: ["my-perfil-publico", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("perfis_publicos")
        .select("*")
        .eq("user_id", effectiveUserId)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as PerfilPublico | null;
    },
    enabled: !!effectiveUserId,
  });
}

export function usePerfilPublicoMutations() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Partial<PerfilPublico>, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { slug: string }) => {
      if (!effectiveUserId) throw new Error("Não autenticado");

      const { data: result, error } = await supabase
        .from("perfis_publicos")
        .insert({
          ...data,
          user_id: effectiveUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-perfil-publico"] });
      toast.success("Perfil público criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'criar', entity: 'perfil' }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<PerfilPublico> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("perfis_publicos")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-perfil-publico"] });
      queryClient.invalidateQueries({ queryKey: ["perfil-publico"] });
      toast.success("Perfil público atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'atualizar', entity: 'perfil' }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("perfis_publicos")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-perfil-publico"] });
      toast.success("Perfil público excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyError(error, { action: 'deletar', entity: 'perfil' }));
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

export async function generateUniqueSlug(name: string): Promise<string> {
  const { data, error } = await supabase.rpc("generate_perfil_slug", {
    nome: name,
  });

  if (error) throw error;
  return data as string;
}
