/**
 * Utilitários para manipulação e validação de cores
 */

/**
 * Converte cor hexadecimal para RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '');
  
  if (cleanHex.length !== 6 && cleanHex.length !== 3) {
    return null;
  }

  let fullHex = cleanHex;
  if (cleanHex.length === 3) {
    fullHex = cleanHex.split('').map(c => c + c).join('');
  }

  const r = parseInt(fullHex.substr(0, 2), 16);
  const g = parseInt(fullHex.substr(2, 2), 16);
  const b = parseInt(fullHex.substr(4, 2), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }

  return { r, g, b };
}

/**
 * Calcula a luminância relativa de uma cor
 * Baseado nas diretrizes WCAG 2.0
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determina se uma cor é clara ou escura
 * @param hexColor - Cor em formato hexadecimal (com ou sem #)
 * @returns true se a cor é clara, false se é escura
 */
export function isLightColor(hexColor: string): boolean {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return false;
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5;
}

/**
 * Retorna a cor de texto ideal (branco ou preto) para uma cor de fundo
 * @param hexColor - Cor de fundo em formato hexadecimal
 * @returns 'white' para fundos escuros, 'black' para fundos claros
 */
export function getContrastColor(hexColor: string): 'white' | 'black' {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return 'white'; // Default para branco em caso de erro
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  // Usando 0.179 como threshold (recomendação WCAG para AAA)
  return luminance > 0.179 ? 'black' : 'white';
}

/**
 * Retorna a classe CSS Tailwind para texto contrastante
 * @param hexColor - Cor de fundo em formato hexadecimal
 * @returns 'text-white' ou 'text-black'
 */
export function getContrastTextClass(hexColor: string): 'text-white' | 'text-black' {
  return getContrastColor(hexColor) === 'white' ? 'text-white' : 'text-black';
}

/**
 * Verifica se o contraste entre duas cores atende ao padrão WCAG AA
 * @param foreground - Cor do texto em hexadecimal
 * @param background - Cor do fundo em hexadecimal
 * @returns true se o contraste é adequado (ratio >= 4.5:1 para texto normal)
 */
export function hasAdequateContrast(foreground: string, background: string): boolean {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) return false;
  
  const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  const contrastRatio = (lighter + 0.05) / (darker + 0.05);
  
  return contrastRatio >= 4.5;
}
