import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface WhiteLabelConfigData {
  nome_empresa: string;
  logo_url: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  dominio_customizado?: string | null;
  template_padrao?: string;
  politica_privacidade?: string | null;
  termos_uso?: string | null;
  analytics_id?: string | null;
  pixel_facebook?: string | null;
  titulo_sistema?: string;
  favicon_url?: string | null;
  ativo?: boolean;
}

export function useWhiteLabelConfig() {
  const queryClient = useQueryClient();
  const { effectiveUserId } = useAuth();

  const saveConfig = useMutation({
    mutationFn: async (data: WhiteLabelConfigData) => {
      if (!effectiveUserId) throw new Error("Usuário não autenticado");

      // Verificar se já existe configuração
      const { data: existing, error: fetchError } = await supabase
        .from("configuracoes_whitelabel")
        .select("id")
        .eq("user_id", effectiveUserId)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      const configData = {
        ...data,
        user_id: effectiveUserId,
      };

      if (existing?.id) {
        // Atualizar
        const { error } = await supabase
          .from("configuracoes_whitelabel")
          .update(configData)
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Criar
        const { error } = await supabase
          .from("configuracoes_whitelabel")
          .insert([configData]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whitelabel-config"] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    },
  });

  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      if (!effectiveUserId) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split(".").pop();
      const fileName = `${effectiveUserId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("marca-logos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("marca-logos")
        .getPublicUrl(fileName);

      return publicUrl;
    },
    onError: (error) => {
      console.error("Erro ao fazer upload do logo:", error);
      toast.error("Erro ao fazer upload do logo");
    },
  });

  return {
    saveConfig: saveConfig.mutate,
    isSaving: saveConfig.isPending,
    uploadLogo: uploadLogo.mutateAsync,
    isUploading: uploadLogo.isPending,
  };
}
