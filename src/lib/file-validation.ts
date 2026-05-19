import { toast } from "sonner";

export const MAX_FILE_SIZE_PROFILE = 3 * 1024 * 1024; // 3MB para foto de perfil
export const MAX_FILE_SIZE_PORTFOLIO = 5 * 1024 * 1024; // 5MB para portfolio/hero/capa

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export function validateImageFile(
  file: File, 
  maxSize: number = MAX_FILE_SIZE_PROFILE,
  showToast: boolean = true
): boolean {
  // Validar tipo de arquivo
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    if (showToast) {
      toast.error('Formato de arquivo não suportado. Use JPG, PNG ou WEBP.');
    }
    return false;
  }

  // Validar tamanho
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    if (showToast) {
      toast.error(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
    }
    return false;
  }

  return true;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Criar canvas e desenhar imagem redimensionada
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      // Converter para blob com qualidade otimizada
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback para arquivo original
          }
        },
        'image/jpeg',
        quality // 85% qualidade - praticamente imperceptível
      );
    };
    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
}
