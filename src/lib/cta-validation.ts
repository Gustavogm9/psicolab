import { z } from "zod";

// Regex para validar URLs (http/https) ou âncoras (#section)
const urlOrAnchorPattern = /^(https?:\/\/[^\s]+|\/[^\s]*|#[^\s]+)$/;

export const ctaLinkSchema = z
  .string()
  .trim()
  .min(1, "Link não pode estar vazio")
  .max(500, "Link muito longo")
  .refine(
    (value) => urlOrAnchorPattern.test(value),
    "Link inválido. Use âncoras (#contato, #servicos), URLs completas (https://...) ou links de WhatsApp"
  );

export function validateCtaLink(link: string): { valid: boolean; error?: string; warning?: string } {
  try {
    ctaLinkSchema.parse(link);

    // Warning para caminhos relativos — podem não funcionar na página pública
    if (link.startsWith('/') && !link.startsWith('//')) {
      return {
        valid: true,
        warning: `O caminho "${link}" pode não funcionar na página pública. Use uma âncora como #contato para rolar até seções, ou uma URL completa como https://wa.me/...`
      };
    }

    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0].message };
    }
    return { valid: false, error: "Link inválido" };
  }
}

export function normalizeCtaLink(link: string): string {
  const trimmed = link.trim();

  // Se começar com #, é âncora
  if (trimmed.startsWith('#')) {
    return trimmed;
  }

  // Se começar com /, é caminho relativo
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // Se começar com http:// ou https://, já está correto
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Se contém ponto (ex: wa.me/..., site.com), adicionar https://
  if (trimmed.includes('.')) {
    return `https://${trimmed}`;
  }

  // Caso contrário, assumir que é seção interna e adicionar #
  return `#${trimmed}`;
}

// Links sugeridos comuns para CTAs
export const SUGGESTED_CTA_LINKS = [
  { label: 'Formulário de Contato', value: '#contato' },
  { label: 'Seção de Serviços', value: '#servicos' },
  { label: 'Diagnósticos', value: '#diagnosticos' },
  { label: 'Sobre Mim', value: '#sobre' },
  { label: 'Depoimentos', value: '#depoimentos' },
  { label: 'FAQ', value: '#faq' },
  { label: 'WhatsApp (precisa configurar)', value: 'https://wa.me/' },
];
