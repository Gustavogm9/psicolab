import { FileText, File, Image, Sheet, Paperclip } from 'lucide-react';
import { TIPOS_ARQUIVO_PERMITIDOS, EXTENSOES_PERMITIDAS, TAMANHO_MAXIMO_BYTES } from '@/types/anexo';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function getFileIcon(tipo: string) {
  if (tipo.startsWith('image/')) return Image;
  if (tipo === 'application/pdf') return FileText;
  if (tipo.includes('spreadsheet') || tipo.includes('excel')) return Sheet;
  if (tipo.includes('word') || tipo.includes('document')) return FileText;
  return Paperclip;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Nenhum arquivo selecionado' };
  }

  if (file.size > TAMANHO_MAXIMO_BYTES) {
    return { valid: false, error: `Arquivo muito grande. Máximo: ${formatFileSize(TAMANHO_MAXIMO_BYTES)}` };
  }

  const extensao = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!EXTENSOES_PERMITIDAS.includes(extensao)) {
    return { valid: false, error: `Tipo de arquivo não permitido. Permitidos: ${EXTENSOES_PERMITIDAS.join(', ')}` };
  }

  if (!TIPOS_ARQUIVO_PERMITIDOS.includes(file.type)) {
    return { valid: false, error: `Tipo de arquivo não permitido` };
  }

  return { valid: true };
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}
