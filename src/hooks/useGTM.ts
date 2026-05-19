import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export function useGTM(gtmId: string | null | undefined) {
  useEffect(() => {
    if (!gtmId || typeof window === 'undefined') return;

    // Verificar se já foi injetado
    if (window.dataLayer && document.querySelector(`script[src*="${gtmId}"]`)) {
      return;
    }

    // Inicializar dataLayer
    window.dataLayer = window.dataLayer || [];

    // Injetar script GTM no <head>
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    document.head.appendChild(script);

    // Injetar noscript no <body>
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    
    if (document.body.firstChild) {
      document.body.insertBefore(noscript, document.body.firstChild);
    } else {
      document.body.appendChild(noscript);
    }

    console.log(`✅ GTM injetado: ${gtmId}`);

    // Cleanup ao desmontar
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (noscript.parentNode) {
        noscript.parentNode.removeChild(noscript);
      }
    };
  }, [gtmId]);
}

// Helper para rastrear eventos customizados
export function trackGTMEvent(eventName: string, eventData?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventData,
    });
  }
}
