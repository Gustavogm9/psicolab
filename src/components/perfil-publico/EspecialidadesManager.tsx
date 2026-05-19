import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, Sparkles, Star, Upload, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Especialidade {
  id: string;
  icone: string;
  titulo: string;
  descricao: string;
  destaque: boolean;
  imagem_url?: string;
}

interface EspecialidadesManagerProps {
  especialidades: Especialidade[];
  onChange: (especialidades: Especialidade[]) => void;
}

export function EspecialidadesManager({ especialidades, onChange }: EspecialidadesManagerProps) {
  const { effectiveUserId } = useAuth();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const adicionarEspecialidade = () => {
    const novaEspecialidade: Especialidade = {
      id: crypto.randomUUID(),
      icone: "Briefcase",
      titulo: "",
      descricao: "",
      destaque: false,
      imagem_url: undefined
    };
    onChange([...especialidades, novaEspecialidade]);
  };

  const removerEspecialidade = (id: string) => {
    onChange(especialidades.filter(e => e.id !== id));
  };

  const atualizarEspecialidade = (id: string, campo: keyof Especialidade, valor: string | boolean | undefined) => {
    onChange(especialidades.map(e => 
      e.id === id ? { ...e, [campo]: valor } : e
    ));
  };

  const handleImageUpload = async (especialidadeId: string, file: File) => {
    if (!effectiveUserId) {
      toast.error("Você precisa estar autenticado");
      return;
    }

    setUploadingId(especialidadeId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${effectiveUserId}/especialidades/${especialidadeId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      atualizarEspecialidade(especialidadeId, 'imagem_url', publicUrl);
      toast.success("Imagem carregada com sucesso!");
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error("Erro ao carregar imagem");
    } finally {
      setUploadingId(null);
    }
  };

  const removerImagem = (especialidadeId: string) => {
    atualizarEspecialidade(especialidadeId, 'imagem_url', undefined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Áreas de Especialidade
        </CardTitle>
        <CardDescription>
          Destaque suas áreas de atuação e especialização profissional. Adicione imagens para ilustrar cada área!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {especialidades.map((especialidade, index) => (
          <Card key={especialidade.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Ícone (nome do Lucide Icon)</Label>
                    <Input
                      value={especialidade.icone}
                      onChange={(e) => atualizarEspecialidade(especialidade.id, 'icone', e.target.value)}
                      placeholder="Briefcase, Heart, Brain, Users, etc"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Veja ícones em: lucide.dev/icons
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch
                      checked={especialidade.destaque}
                      onCheckedChange={(checked) => atualizarEspecialidade(especialidade.id, 'destaque', checked)}
                    />
                    <div>
                      <Label className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Destaque
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Aparece em posição de destaque
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Título / Área</Label>
                  <Input
                    value={especialidade.titulo}
                    onChange={(e) => atualizarEspecialidade(especialidade.id, 'titulo', e.target.value)}
                    placeholder="Ex: Clima Organizacional, Gestão de Conflitos"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={especialidade.descricao}
                    onChange={(e) => atualizarEspecialidade(especialidade.id, 'descricao', e.target.value)}
                    placeholder="Descreva sua experiência e abordagem nesta área..."
                    rows={3}
                  />
                </div>

                {/* Upload de Imagem */}
                <div>
                  <Label className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Imagem de Fundo (opcional)
                  </Label>
                  <div className="mt-2">
                    {especialidade.imagem_url ? (
                      <div className="relative inline-block">
                        <img
                          src={especialidade.imagem_url}
                          alt={`Imagem - ${especialidade.titulo}`}
                          className="w-40 h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => removerImagem(especialidade.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-40 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        {uploadingId === especialidade.id ? (
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
                            if (file) handleImageUpload(especialidade.id, file);
                          }}
                          disabled={uploadingId === especialidade.id}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Imagem de fundo sutil para o card desta especialidade
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removerEspecialidade(especialidade.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
        
        {especialidades.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma especialidade adicionada ainda</p>
            <p className="text-xs">Destaque suas principais áreas de atuação!</p>
          </div>
        )}
        
        <Button
          variant="outline"
          onClick={adicionarEspecialidade}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Especialidade
        </Button>
      </CardContent>
    </Card>
  );
}
