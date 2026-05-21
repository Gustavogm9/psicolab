import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface WhiteLabelConfig {
  nome_empresa: string;
  logo_url: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  pixel_facebook: string | null;
  analytics_id: string | null;
  favicon_url: string | null;
  titulo_sistema: string | null;
}

interface PublicWhiteLabelContextType {
  config: WhiteLabelConfig | null;
  isLoading: boolean;
}

const defaultConfig: WhiteLabelConfig = {
  nome_empresa: "MenteMetrics",
  logo_url: null,
  cor_primaria: "#6366f1",
  cor_secundaria: "#8b5cf6",
  pixel_facebook: null,
  analytics_id: null,
  favicon_url: null,
  titulo_sistema: null,
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
          .select("nome_empresa, logo_url, cor_primaria, cor_secundaria, pixel_facebook, analytics_id, favicon_url, titulo_sistema");

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

    // Aplicar Título e Favicon
    let originalTitle = document.title;
    if (config.titulo_sistema) {
      document.title = config.titulo_sistema;
    } else if (config.nome_empresa) {
      document.title = `${config.nome_empresa} | MenteMetrics`;
    }

    let originalFaviconHref = "";
    let favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (config.favicon_url) {
      if (favicon) {
        originalFaviconHref = favicon.href;
        favicon.href = config.favicon_url;
      } else {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.href = config.favicon_url;
        document.head.appendChild(favicon);
      }
    }

    // CRÍTICO PARA IOS (IPHONE): Injetar apple-touch-icon dinâmico do Whitelabel
    // Sem isso, o Safari no iOS ignora o manifesto PWA para o ícone e mostra o padrão
    let appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    let originalAppleTouchIconHref = "";
    const targetIcon = config.logo_url || config.favicon_url || "/favicon.png";
    if (appleTouchIcon) {
      originalAppleTouchIconHref = appleTouchIcon.href;
      appleTouchIcon.href = targetIcon;
    } else {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = targetIcon;
      document.head.appendChild(appleTouchIcon);
    }

    // CRÍTICO PARA IOS (IPHONE): Injetar título do PWA na tela inicial
    let appleAppTitle = document.querySelector("meta[name='apple-mobile-web-app-title']") as HTMLMetaElement;
    let originalAppleAppTitle = "";
    const targetTitle = config.titulo_sistema || config.nome_empresa || "MenteMetrics";
    if (appleAppTitle) {
      originalAppleAppTitle = appleAppTitle.content;
      appleAppTitle.content = targetTitle;
    } else {
      appleAppTitle = document.createElement('meta');
      appleAppTitle.name = 'apple-mobile-web-app-title';
      appleAppTitle.content = targetTitle;
      document.head.appendChild(appleAppTitle);
    }

    // CRÍTICO PARA IOS (IPHONE): Garantir modo standalone no Safari
    let appleCapable = document.querySelector("meta[name='apple-mobile-web-app-capable']") as HTMLMetaElement;
    let originalAppleCapable = "";
    if (appleCapable) {
      originalAppleCapable = appleCapable.content;
      appleCapable.content = "yes";
    } else {
      appleCapable = document.createElement('meta');
      appleCapable.name = 'apple-mobile-web-app-capable';
      appleCapable.content = "yes";
      document.head.appendChild(appleCapable);
    }

    // CRÍTICO PARA ANDROID E IOS: Injetar cor de status bar do Whitelabel
    let themeColorMeta = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
    let originalThemeColor = "";
    if (config.cor_primaria) {
      if (themeColorMeta) {
        originalThemeColor = themeColorMeta.content;
        themeColorMeta.content = config.cor_primaria;
      } else {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        themeColorMeta.content = config.cor_primaria;
        document.head.appendChild(themeColorMeta);
      }
    }

    // Aplicar Manifesto PWA Dinâmico Whitelabel
    let manifestLink = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
    let originalManifestHref = "";
    try {
      const manifestObj = {
        name: config.titulo_sistema || config.nome_empresa || "MenteMetrics",
        short_name: config.nome_empresa || "MenteMetrics",
        description: "Plataforma integrada de avaliação de riscos e bem-estar organizacional.",
        theme_color: config.cor_primaria || "#6366f1",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: window.location.origin + window.location.pathname,
        scope: "/",
        icons: [
          {
            src: config.favicon_url || config.logo_url || "/favicon.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: config.favicon_url || config.logo_url || "/favicon.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      };
      
      const manifestString = JSON.stringify(manifestObj);
      const manifestBase64 = btoa(unescape(encodeURIComponent(manifestString)));
      const manifestDataUri = `data:application/manifest+json;base64,${manifestBase64}`;
      
      if (manifestLink) {
        originalManifestHref = manifestLink.href;
        manifestLink.href = manifestDataUri;
      } else {
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = manifestDataUri;
        document.head.appendChild(manifestLink);
      }
    } catch (e) {
      console.error("[PWA Manifest] Erro ao criar manifesto dinâmico:", e);
    }

    // Aplicar Scripts de Rastreamento (Facebook Pixel & Google Analytics)
    const trackedScripts: HTMLScriptElement[] = [];

    if (config.pixel_facebook) {
      const pixelScript = document.createElement('script');
      pixelScript.id = 'whitelabel-fb-pixel';
      pixelScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${config.pixel_facebook}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(pixelScript);
      trackedScripts.push(pixelScript);
    }

    if (config.analytics_id) {
      const gtmScript = document.createElement('script');
      gtmScript.id = 'whitelabel-gtm-base';
      gtmScript.src = `https://www.googletagmanager.com/gtag/js?id=${config.analytics_id}`;
      gtmScript.async = true;
      document.head.appendChild(gtmScript);
      trackedScripts.push(gtmScript);

      const gtmInlineScript = document.createElement('script');
      gtmInlineScript.id = 'whitelabel-gtm-inline';
      gtmInlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.analytics_id}');
      `;
      document.head.appendChild(gtmInlineScript);
      trackedScripts.push(gtmInlineScript);
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
      
      // Restaurar Título e Favicon originais
      document.title = originalTitle;
      if (favicon && originalFaviconHref) {
        favicon.href = originalFaviconHref;
      }

      // Restaurar apple-touch-icon original do iOS
      if (appleTouchIcon) {
        if (originalAppleTouchIconHref) {
          appleTouchIcon.href = originalAppleTouchIconHref;
        } else {
          appleTouchIcon.parentNode?.removeChild(appleTouchIcon);
        }
      }

      // Restaurar appleAppTitle original do iOS
      if (appleAppTitle) {
        if (originalAppleAppTitle) {
          appleAppTitle.content = originalAppleAppTitle;
        } else {
          appleAppTitle.parentNode?.removeChild(appleAppTitle);
        }
      }

      // Restaurar appleCapable original do iOS
      if (appleCapable) {
        if (originalAppleCapable) {
          appleCapable.content = originalAppleCapable;
        } else {
          appleCapable.parentNode?.removeChild(appleCapable);
        }
      }

      // Restaurar theme-color original
      if (themeColorMeta) {
        if (originalThemeColor) {
          themeColorMeta.content = originalThemeColor;
        } else {
          themeColorMeta.parentNode?.removeChild(themeColorMeta);
        }
      }

      // Restaurar Manifesto PWA original
      if (manifestLink) {
        if (originalManifestHref) {
          manifestLink.href = originalManifestHref;
        } else {
          manifestLink.parentNode?.removeChild(manifestLink);
        }
      }

      // Remover scripts de rastreamento adicionados dinamicamente
      trackedScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });

      setColorsApplied(false);
    };
  }, [config, isLoading]);

  // Bloquear renderização até cores estarem aplicadas
  if (isLoading || !colorsApplied) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center transition-all duration-300">
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-8 rounded-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping duration-1000" />
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 relative z-10" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-slate-200">Carregando ambiente personalizado</p>
            <p className="text-xs text-slate-400">Preparando sua experiência segura</p>
          </div>
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
