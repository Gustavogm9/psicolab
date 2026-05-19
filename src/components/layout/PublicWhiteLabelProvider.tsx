import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface WhiteLabelConfig {
  nome_empresa: string;
  logo_url: string | null;
  cor_primaria: string;
  cor_secundaria: string;
}

interface PublicWhiteLabelContextType {
  config: WhiteLabelConfig | null;
  isLoading: boolean;
}

const defaultConfig: WhiteLabelConfig = {
  nome_empresa: "Sistema",
  logo_url: null,
  cor_primaria: "#6366f1",
  cor_secundaria: "#8b5cf6",
};

const PublicWhiteLabelContext = createContext<PublicWhiteLabelContextType | undefined>(undefined);

interface PublicWhiteLabelProviderProps {
  children: ReactNode;
  whiteLabelId?: string | null;
  userId?: string | null;
}

export function PublicWhiteLabelProvider({ children, whiteLabelId, userId }: PublicWhiteLabelProviderProps) {
  const [config, setConfig] = useState<WhiteLabelConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [colorsApplied, setColorsApplied] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!whiteLabelId && !userId) {
        setConfig(defaultConfig);
        setIsLoading(false);
        return;
      }

      try {
        let query = supabase
          .from("configuracoes_whitelabel")
          .select("nome_empresa, logo_url, cor_primaria, cor_secundaria");

        if (userId) {
          query = query.eq("user_id", userId);
        } else if (whiteLabelId) {
          query = query.eq("id", whiteLabelId);
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
          console.error("Erro ao buscar configurações white-label:", error);
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

    fetchConfig();
  }, [whiteLabelId, userId]);

  // Aplicar tema quando config carrega
  useEffect(() => {
    if (!config || isLoading) return;

    const root = document.documentElement;
    
    // CRÍTICO: Limpar CSS variables existentes ANTES de aplicar novas
    // Isso previne conflitos com ThemeInjector ou outras fontes
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-foreground");
    root.style.removeProperty("--primary-hover");
    root.style.removeProperty("--secondary");
    root.style.removeProperty("--secondary-foreground");
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-foreground");
    root.style.removeProperty("--gradient-primary");
    root.style.removeProperty("--gradient-secondary");
    root.style.removeProperty("--gradient-hero");
    root.style.removeProperty("--gradient-bright");
    root.style.removeProperty("--ring");

    const hexToHSL = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return null;

      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / d + 4) / 6;
            break;
        }
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const primaryHSL = hexToHSL(config.cor_primaria);
    const secondaryHSL = hexToHSL(config.cor_secundaria);

    
    if (primaryHSL) {
      root.style.setProperty("--primary", primaryHSL);
      const [h, s] = primaryHSL.split(' ');
      root.style.setProperty("--primary-foreground", `${h} ${s} 98%`);
    }
    
    if (secondaryHSL) {
      root.style.setProperty("--secondary", secondaryHSL);
      const [h, s] = secondaryHSL.split(' ');
      root.style.setProperty("--secondary-foreground", `${h} ${s} 98%`);
      root.style.setProperty("--accent", secondaryHSL);
      root.style.setProperty("--accent-foreground", `${h} ${s} 98%`);
    }

    if (primaryHSL && secondaryHSL) {
      root.style.setProperty(
        "--gradient-primary",
        `linear-gradient(135deg, hsl(${primaryHSL}), hsl(${secondaryHSL}))`
      );
      root.style.setProperty(
        "--gradient-hero",
        `linear-gradient(135deg, hsl(${primaryHSL}) 0%, hsl(${secondaryHSL}) 50%, hsl(${primaryHSL}) 100%)`
      );
    }

    // Marcar cores como aplicadas APÓS aplicar no DOM
    setColorsApplied(true);

    return () => {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-foreground");
      root.style.removeProperty("--secondary");
      root.style.removeProperty("--secondary-foreground");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-foreground");
      root.style.removeProperty("--gradient-primary");
      root.style.removeProperty("--gradient-hero");
      setColorsApplied(false);
    };
  }, [config, isLoading]);

  // Bloquear renderização até cores estarem aplicadas
  if (isLoading || !colorsApplied) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
          <p className="text-sm text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <PublicWhiteLabelContext.Provider value={{ config, isLoading }}>
      {children}
    </PublicWhiteLabelContext.Provider>
  );
}

export function usePublicWhiteLabel() {
  const context = useContext(PublicWhiteLabelContext);
  if (context === undefined) {
    throw new Error("usePublicWhiteLabel must be used within a PublicWhiteLabelProvider");
  }
  return context;
}
