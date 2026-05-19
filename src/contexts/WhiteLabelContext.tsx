import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface WhiteLabelConfig {
  id?: string;
  user_id?: string;
  nome_empresa: string;
  logo_url: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  dominio_customizado: string | null;
  template_padrao: string;
  politica_privacidade: string | null;
  termos_uso: string | null;
  analytics_id: string | null;
  pixel_facebook: string | null;
  titulo_sistema: string;
  favicon_url: string | null;
  ativo: boolean;
}

interface WhiteLabelContextType {
  config: WhiteLabelConfig | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const defaultConfig: WhiteLabelConfig = {
  nome_empresa: "Sistema",
  logo_url: null,
  cor_primaria: "#6366f1",
  cor_secundaria: "#8b5cf6",
  dominio_customizado: null,
  template_padrao: "moderno",
  politica_privacidade: null,
  termos_uso: null,
  analytics_id: null,
  pixel_facebook: null,
  titulo_sistema: "PsiColab",
  favicon_url: null,
  ativo: true,
};

const WhiteLabelContext = createContext<WhiteLabelContextType | undefined>(undefined);

export function WhiteLabelProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<WhiteLabelConfig | null>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const { user, effectiveUserId } = useAuth();

  const fetchConfig = async () => {
    if (!effectiveUserId) {
      setConfig(defaultConfig);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("configuracoes_whitelabel")
        .select("*")
        .eq("user_id", effectiveUserId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao buscar configurações:", error);
        setConfig(defaultConfig);
      } else {
        setConfig(data || defaultConfig);
      }
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [effectiveUserId]);

  // Refetch quando effectiveUserId muda (para impersonificação)
  useEffect(() => {
    if (effectiveUserId) {
      console.log('[WhiteLabelContext] effectiveUserId mudou, refazendo busca:', effectiveUserId);
      fetchConfig();
    }
  }, [effectiveUserId]);

  return (
    <WhiteLabelContext.Provider value={{ config, isLoading, refetch: fetchConfig }}>
      {children}
    </WhiteLabelContext.Provider>
  );
}

// Fallback seguro para quando usado fora do provider (evita crash durante transições)
const defaultContextValue: WhiteLabelContextType = {
  config: defaultConfig,
  isLoading: false,
  refetch: async () => {},
};

export function useWhiteLabelContext() {
  const context = useContext(WhiteLabelContext);
  if (context === undefined) {
    console.warn("[WhiteLabelContext] Hook usado fora do provider, retornando config padrão");
    return defaultContextValue;
  }
  return context;
}
