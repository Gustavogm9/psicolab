import { useEffect } from "react";
import { useWhiteLabel } from "@/hooks/useWhiteLabel";

export function ThemeInjector() {
  const { config } = useWhiteLabel();

  useEffect(() => {
    if (!config) return;
    
    // Aplicar título do sistema
    if (config.titulo_sistema) {
      document.title = config.titulo_sistema;
    }

    // Aplicar favicon customizado
    if (config.favicon_url) {
      let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = config.favicon_url;
      
      // Detectar tipo do arquivo
      const ext = config.favicon_url.split('.').pop()?.toLowerCase();
      if (ext === 'svg') {
        faviconLink.type = 'image/svg+xml';
      } else if (ext === 'png') {
        faviconLink.type = 'image/png';
      } else if (ext === 'ico') {
        faviconLink.type = 'image/x-icon';
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
    
    // Debug: verificar se as cores estão chegando corretamente
    console.log('[ThemeInjector] Aplicando configurações:', {
      cor_primaria: config.cor_primaria,
      cor_secundaria: config.cor_secundaria,
      titulo_sistema: config.titulo_sistema,
      favicon_url: config.favicon_url
    });

    // Gerar cor de hover mais escura (reduz luminosidade em 8%)
    const generateHoverColor = (hsl: string) => {
      const [h, s, l] = hsl.split(' ');
      const luminosity = parseInt(l);
      const hoverLuminosity = Math.max(luminosity - 8, 10);
      return `${h} ${s} ${hoverLuminosity}%`;
    };

    // Converter hex para HSL
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

    const root = document.documentElement;
    
    if (primaryHSL) {
      root.style.setProperty("--primary", primaryHSL);
      // Variações da cor primária
      const [h, s, l] = primaryHSL.split(' ');
      root.style.setProperty("--primary-foreground", `${h} ${s} 98%`);
      root.style.setProperty("--primary-hover", generateHoverColor(primaryHSL));
      root.style.setProperty("--ring", primaryHSL);
    }
    
    if (secondaryHSL) {
      root.style.setProperty("--secondary", secondaryHSL);
      // Variações da cor secundária
      const [h, s, l] = secondaryHSL.split(' ');
      root.style.setProperty("--secondary-foreground", `${h} ${s} 98%`);
      root.style.setProperty("--accent", secondaryHSL);
      root.style.setProperty("--accent-foreground", `${h} ${s} 98%`);
      root.style.setProperty("--secondary-hover", generateHoverColor(secondaryHSL));
    }

    // Configurar gradientes baseados nas cores do Manual da Marca
    if (primaryHSL && secondaryHSL) {
      root.style.setProperty(
        "--gradient-primary", 
        `linear-gradient(135deg, hsl(${primaryHSL}), hsl(${secondaryHSL}))`
      );
      
      root.style.setProperty(
        "--gradient-secondary", 
        `linear-gradient(135deg, hsl(${secondaryHSL}), hsl(${primaryHSL}))`
      );
      
      root.style.setProperty(
        "--gradient-hero",
        `linear-gradient(135deg, hsl(${primaryHSL}) 0%, hsl(${secondaryHSL}) 50%, hsl(${primaryHSL}) 100%)`
      );
      
      root.style.setProperty(
        "--gradient-bright",
        `linear-gradient(135deg, hsl(${primaryHSL}), hsl(${secondaryHSL}))`
      );
    }

    return () => {
      // Cleanup ao desmontar
      document.title = "MenteMetrics - Inteligência e Saúde Mental Organizacional";
      
      const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (faviconLink) {
        faviconLink.href = '/favicon.svg';
        faviconLink.type = 'image/svg+xml';
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
      
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-foreground");
      root.style.removeProperty("--primary-hover");
      root.style.removeProperty("--secondary");
      root.style.removeProperty("--secondary-foreground");
      root.style.removeProperty("--secondary-hover");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-foreground");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--gradient-primary");
      root.style.removeProperty("--gradient-secondary");
      root.style.removeProperty("--gradient-hero");
      root.style.removeProperty("--gradient-bright");
    };
  }, [config]);

  return null;
}
