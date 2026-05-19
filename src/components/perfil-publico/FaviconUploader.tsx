import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Info, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getUserFriendlyError } from "@/lib/error-messages";
import { useAuth } from "@/contexts/AuthContext";

const MAX_FAVICON_SIZE = 500 * 1024; // 500KB
const ALLOWED_FORMATS = ['.ico', '.png', '.svg'];

interface FaviconUploaderProps {
  perfilId: string;
  faviconUrl?: string | null;
  onUploadComplete: (url: string) => void;
}

export function FaviconUploader({ perfilId, faviconUrl, onUploadComplete }: FaviconUploaderProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(faviconUrl || null);

  const validateFile = (file: File): boolean => {
    // Validar formato
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ALLOWED_FORMATS.includes(extension)) {
      toast.error(`Formato inválido. Use: ${ALLOWED_FORMATS.join(', ')}`);
      return false;
    }

    // Validar tamanho
    if (file.size > MAX_FAVICON_SIZE) {
      toast.error(`Arquivo muito grande. Máximo: ${MAX_FAVICON_SIZE / 1024}KB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!validateFile(file)) return;

    setIsUploading(true);
    const loadingToast = toast.loading('Fazendo upload do favicon...');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${perfilId}-favicon-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('perfil-imagens')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('perfil-imagens')
        .getPublicUrl(filePath);

      // Adicionar timestamp para evitar cache
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      
      setPreviewUrl(urlWithTimestamp);
      onUploadComplete(urlWithTimestamp);
      
      toast.dismiss(loadingToast);
      toast.success('Favicon atualizado com sucesso!');
    } catch (error: any) {
      console.error('[Favicon Upload] Erro:', error);
      toast.dismiss(loadingToast);
      toast.error('Erro ao fazer upload do favicon. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setPreviewUrl(null);
    onUploadComplete('');
    toast.success('Favicon removido. Será usado o padrão do sistema.');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <CardTitle>Favicon Personalizado</CardTitle>
        </div>
        <CardDescription>
          Ícone que aparece na aba do navegador ao visitar sua página
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Recomendações:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Dimensões ideais: 32x32px ou 64x64px</li>
              <li>Formatos aceitos: ICO, PNG ou SVG</li>
              <li>Tamanho máximo: 500KB</li>
              <li>Prefira imagens simples e reconhecíveis em tamanho pequeno</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Label>Preview do Favicon</Label>
          <div className="flex items-center gap-4">
            <div className="p-4 border-2 border-dashed rounded-lg bg-muted/20 flex items-center justify-center min-w-[80px] min-h-[80px]">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Favicon preview" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    console.error('Erro ao carregar preview do favicon');
                    e.currentTarget.src = '/favicon.png';
                  }}
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => document.getElementById('favicon-upload')?.click()}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {previewUrl ? 'Alterar' : 'Upload'}
                    </>
                  )}
                </Button>
                
                {previewUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                {previewUrl 
                  ? 'Favicon personalizado ativo'
                  : 'Sem favicon personalizado (usando padrão do sistema)'}
              </p>
            </div>
          </div>
          
          <input
            id="favicon-upload"
            type="file"
            accept=".ico,.png,.svg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}
