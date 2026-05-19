import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical, ListOrdered, Upload, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ProcessoEtapa {
  id: string;
  icone: string;
  titulo: string;
  descricao: string;
  imagem_url?: string;
}

interface ProcessoTrabalhoManagerProps {
  processo: ProcessoEtapa[];
  onChange: (processo: ProcessoEtapa[]) => void;
}

export function ProcessoTrabalhoManager({ processo, onChange }: ProcessoTrabalhoManagerProps) {
  const { effectiveUserId } = useAuth();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const adicionarEtapa = () => {
    const novaEtapa: ProcessoEtapa = {
      id: crypto.randomUUID(),
      icone: "CheckCircle",
      titulo: "",
      descricao: "",
      imagem_url: undefined
    };
    onChange([...processo, novaEtapa]);
  };

  const removerEtapa = (id: string) => {
    onChange(processo.filter(e => e.id !== id));
  };

  const atualizarEtapa = (id: string, campo: keyof ProcessoEtapa, valor: string | undefined) => {
    onChange(processo.map(e => 
      e.id === id ? { ...e, [campo]: valor } : e
    ));
  };

  const handleImageUpload = async (etapaId: string, file: File) => {
    if (!effectiveUserId) {
      toast.error("Você precisa estar autenticado");
      return;
    }

    setUploadingId(etapaId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${effectiveUserId}/processo/${etapaId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      atualizarEtapa(etapaId, 'imagem_url', publicUrl);
      toast.success("Imagem carregada com sucesso!");
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error("Erro ao carregar imagem");
    } finally {
      setUploadingId(null);
    }
  };

  const removerImagem = (etapaId: string) => {
    atualizarEtapa(etapaId, 'imagem_url', undefined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListOrdered className="h-5 w-5" />
          Como Funciona / Processo de Trabalho
        </CardTitle>
        <CardDescription>
          Explique seu processo passo a passo para gerar confiança e transparência. Adicione imagens para tornar mais visual!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {processo.map((etapa, index) => (
          <Card key={etapa.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Ícone (nome do Lucide Icon)</Label>
                    <Input
                      value={etapa.icone}
                      onChange={(e) => atualizarEtapa(etapa.id, 'icone', e.target.value)}
                      placeholder="CheckCircle, Search, MessageSquare, FileText, etc"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Veja ícones em: lucide.dev/icons
                    </p>
                  </div>
                  <div>
                    <Label>Título da Etapa</Label>
                    <Input
                      value={etapa.titulo}
                      onChange={(e) => atualizarEtapa(etapa.id, 'titulo', e.target.value)}
                      placeholder="Ex: Diagnóstico Inicial, Análise de Resultados"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={etapa.descricao}
                    onChange={(e) => atualizarEtapa(etapa.id, 'descricao', e.target.value)}
                    placeholder="Descreva o que acontece nesta etapa..."
                    rows={3}
                  />
                </div>

                {/* Upload de Imagem */}
                <div>
                  <Label className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Imagem da Etapa (opcional)
                  </Label>
                  <div className="mt-2">
                    {etapa.imagem_url ? (
                      <div className="relative inline-block">
                        <img
                          src={etapa.imagem_url}
                          alt={`Imagem - ${etapa.titulo}`}
                          className="w-40 h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => removerImagem(etapa.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-40 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        {uploadingId === etapa.id ? (
                          <span className="text-xs text-muted-foreground">Enviando...</span>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 mb-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Adicionar imagem
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(etapa.id, file);
                          }}
                          disabled={uploadingId === etapa.id}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Imagem ilustrativa para esta etapa do processo
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removerEtapa(etapa.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
        
        {processo.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <ListOrdered className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma etapa adicionada ainda</p>
            <p className="text-xs">Explique seu processo de trabalho passo a passo!</p>
          </div>
        )}
        
        <Button
          variant="outline"
          onClick={adicionarEtapa}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Etapa
        </Button>
      </CardContent>
    </Card>
  );
}
