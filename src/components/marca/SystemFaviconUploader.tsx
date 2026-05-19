import { useState } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface SystemFaviconUploaderProps {
  faviconUrl: string | null;
  onUploadComplete: (url: string | null) => void;
}

export function SystemFaviconUploader({ faviconUrl, onUploadComplete }: SystemFaviconUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(faviconUrl);
  const { effectiveUserId } = useAuth();

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/x-icon', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato inválido. Use .ico, .png ou .svg");
      return false;
    }

    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Máximo: 500KB");
      return false;
    }

    return true;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !effectiveUserId) return;

    if (!validateFile(file)) {
      e.target.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${effectiveUserId}/favicon-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('marca-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('marca-logos')
        .getPublicUrl(data.path);

      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);
      toast.success("Favicon carregado com sucesso!");
    } catch (error) {
      console.error('Erro ao fazer upload do favicon:', error);
      toast.error("Erro ao fazer upload do favicon");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete(null);
    toast.success("Favicon removido");
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Favicon do Sistema</label>
        <p className="text-xs text-muted-foreground mt-1">
          Ícone que aparece na aba do navegador
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Recomendações:</strong>
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            <li>Formatos: .ico, .png ou .svg</li>
            <li>Tamanho: 32x32px ou 64x64px</li>
            <li>Arquivo: Máximo 500KB</li>
          </ul>
        </AlertDescription>
      </Alert>

      {previewUrl && (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
          <img 
            src={previewUrl} 
            alt="Favicon atual" 
            className="w-8 h-8 object-contain"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">Favicon atual</p>
            <p className="text-xs text-muted-foreground">
              Este ícone aparecerá na aba do navegador
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => document.getElementById('system-favicon-input')?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Carregando..." : previewUrl ? "Trocar Favicon" : "Fazer Upload"}
        </Button>
        <input
          id="system-favicon-input"
          type="file"
          accept=".ico,.png,.svg"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
}
