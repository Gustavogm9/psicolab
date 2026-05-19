import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export function useFacebookPixel(pixelId: string | null | undefined) {
  useEffect(() => {
    if (!pixelId || typeof window === 'undefined') return;

    // Verificar se já foi injetado
    if (window.fbq) {
      return;
    }

    // Injetar Facebook Pixel
    (function (f: any, b: any, e: string, v: string) {
      let n: any, t: any, s: any;
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js'
    );

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');

    console.log(`✅ Facebook Pixel injetado: ${pixelId}`);

    // Cleanup ao desmontar
    return () => {
      delete window.fbq;
      delete window._fbq;
    };
  }, [pixelId]);
}

// Helper para rastrear eventos customizados (client-side)
export function trackPixelEvent(eventName: string, eventData?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, eventData);
  }
}

// Helper para obter cookies do Facebook
function getFacebookCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {};

  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return {
    fbp: cookies['_fbp'],
    fbc: cookies['_fbc'],
  };
}

// Interface para dados do usuário na CAPI
interface CapiUserData {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
}

// Interface para dados do evento na CAPI
interface CapiEventData {
  content_name?: string;
  content_category?: string;
  content_type?: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
  source_url?: string;
  [key: string]: any;
}

/**
 * Envia evento para a Meta Conversions API (server-side)
 * Deve ser chamado em conjunto com trackPixelEvent para deduplication
 */
export async function trackCapiEvent(
  perfilPublicoId: string,
  pixelId: string,
  eventName: string,
  eventData?: CapiEventData,
  userData?: CapiUserData
): Promise<void> {
  if (!perfilPublicoId || !pixelId) {
    console.warn('[CAPI] Faltando perfilPublicoId ou pixelId');
    return;
  }

  try {
    // Gerar event_id único para deduplication
    const eventId = crypto.randomUUID();

    // Obter cookies do Facebook para melhor matching
    const { fbp, fbc } = getFacebookCookies();

    // Enviar evento também via Pixel com o mesmo event_id
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, eventData, { eventID: eventId });
    }

    // Chamar Edge Function
    const { data, error } = await supabase.functions.invoke('meta-capi-event', {
      body: {
        perfil_publico_id: perfilPublicoId,
        pixel_id: pixelId,
        event_name: eventName,
        event_id: eventId,
        event_data: {
          ...eventData,
          source_url: window?.location?.href,
        },
        user_data: {
          ...userData,
          client_user_agent: navigator?.userAgent,
          fbp,
          fbc,
        },
      },
    });

    if (error) {
      console.error('[CAPI] Erro ao enviar evento:', error);
      return;
    }

    if (data?.success) {
      console.log(`✅ [CAPI] Evento ${eventName} enviado com sucesso`);
    } else if (data?.skipped) {
      console.log(`⏭️ [CAPI] Evento ${eventName} ignorado: ${data.message}`);
    } else {
      console.warn(`⚠️ [CAPI] Evento ${eventName}: ${data?.message || data?.error}`);
    }
  } catch (err) {
    console.error('[CAPI] Erro inesperado:', err);
  }
}
