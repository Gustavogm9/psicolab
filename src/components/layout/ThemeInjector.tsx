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
