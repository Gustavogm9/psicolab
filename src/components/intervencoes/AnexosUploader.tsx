import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Download, File } from 'lucide-react';
import { Anexo, MAX_ANEXOS } from '@/types/anexo';
import { formatFileSize, getFileIcon } from '@/lib/anexo-utils';
import { useAnexosIntervencao } from '@/hooks/useAnexosIntervencao';
import { toast } from 'sonner';

interface AnexosUploaderProps {
  anexos: Anexo[];
  onChange: (anexos: Anexo[]) => void;
  intervencaoId?: string;
  readOnly?: boolean;
}

export function AnexosUploader({ anexos, onChange, intervencaoId, readOnly = false }: AnexosUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAnexo, deleteAnexo, uploading, progress } = useAnexosIntervencao();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (readOnly) return;
    if (anexos.length >= MAX_ANEXOS) {
      toast.error(`Máximo de ${MAX_ANEXOS} arquivos permitidos`);
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    if (anexos.length >= MAX_ANEXOS) {
      toast.error(`Máximo de ${MAX_ANEXOS} arquivos permitidos`);
      return;
    }

    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const remainingSlots = MAX_ANEXOS - anexos.length;
    if (files.length > remainingSlots) {
      toast.error(`Você pode adicionar apenas mais ${remainingSlots} arquivo(s)`);
      files = files.slice(0, remainingSlots);
    }

    for (const file of files) {
      const anexo = await uploadAnexo(file, intervencaoId);
      if (anexo) {
        onChange([...anexos, anexo]);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (anexo: Anexo) => {
    if (readOnly) return;
    
    const success = await deleteAnexo(anexo, intervencaoId);
    if (success) {
      onChange(anexos.filter(a => a.id !== anexo.id));
    }
  };

  const handleDownload = (anexo: Anexo) => {
    window.open(anexo.url, '_blank');
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.webp,.txt"
          />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            PDF, DOCX, XLSX, Imagens (máx. 10MB) - {anexos.length}/{MAX_ANEXOS} arquivos
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || anexos.length >= MAX_ANEXOS}
          >
            Selecionar Arquivos
          </Button>
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
          <Progress value={progress} />
        </div>
      )}

      {anexos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Arquivos anexados ({anexos.length})</h4>
          <div className="space-y-2">
            {anexos.map((anexo) => {
              const Icon = getFileIcon(anexo.tipo);
              return (
                <Card key={anexo.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{anexo.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(anexo.tamanho)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(anexo)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {!readOnly && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(anexo)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
