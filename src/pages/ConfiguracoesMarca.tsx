import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useWhiteLabel } from "@/hooks/useWhiteLabel";
import { useWhiteLabelConfig } from "@/hooks/useWhiteLabelConfig";
import { Upload, Palette, Building2, Eye, Globe } from "lucide-react";
import { SystemFaviconUploader } from "@/components/marca/SystemFaviconUploader";
import { toast } from "sonner";

export default function ConfiguracoesMarca() {
  const { config, refetch } = useWhiteLabel();
  const { saveConfig, isSaving, uploadLogo, isUploading } = useWhiteLabelConfig();

  const [formData, setFormData] = useState({
    nome_empresa: "",
    logo_url: null as string | null,
    cor_primaria: "#6366f1",
    cor_secundaria: "#8b5cf6",
    titulo_sistema: "PsiColab",
    favicon_url: null as string | null,
  });

  const [previewColors, setPreviewColors] = useState({
    primary: "#6366f1",
    secondary: "#8b5cf6",
  });

  useEffect(() => {
    if (config) {
      setFormData({
        nome_empresa: config.nome_empresa,
        logo_url: config.logo_url,
        cor_primaria: config.cor_primaria,
        cor_secundaria: config.cor_secundaria,
        titulo_sistema: config.titulo_sistema || "PsiColab",
        favicon_url: config.favicon_url,
      });
      setPreviewColors({
        primary: config.cor_primaria,
        secondary: config.cor_secundaria,
      });
    }
  }, [config]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    try {
      const publicUrl = await uploadLogo(file);
      setFormData({ ...formData, logo_url: publicUrl });
      toast.success("Logo enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar logo:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig(formData, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleColorChange = (field: "cor_primaria" | "cor_secundaria", value: string) => {
    setFormData({ ...formData, [field]: value });
    if (field === "cor_primaria") {
      setPreviewColors({ ...previewColors, primary: value });
    } else {
      setPreviewColors({ ...previewColors, secondary: value });
    }
  };

  const resetToDefault = () => {
    const defaults = {
      nome_empresa: formData.nome_empresa,
      logo_url: null,
      cor_primaria: "#6366f1",
      cor_secundaria: "#8b5cf6",
      titulo_sistema: "PsiColab",
      favicon_url: null,
    };
    setFormData(defaults);
    setPreviewColors({
      primary: "#6366f1",
      secondary: "#8b5cf6",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Manual de Marca</h1>
          <p className="text-muted-foreground mt-2">
            Configure a identidade visual do sistema com o logo e cores da sua empresa
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>
                Nome e logo que aparecerão em todo o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nome_empresa">Nome da Empresa</Label>
                <Input
                  id="nome_empresa"
                  value={formData.nome_empresa}
                  onChange={(e) =>
                    setFormData({ ...formData, nome_empresa: e.target.value })
                  }
                  placeholder="Ex: Minha Consultoria RH"
                  required
                />
              </div>

              <div>
                <Label>Logo da Empresa</Label>
                <div className="mt-2 space-y-4">
                  {formData.logo_url && (
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                      <img
                        src={formData.logo_url}
                        alt="Logo"
                        className="h-16 w-16 object-contain rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Logo atual</p>
                        <p className="text-xs text-muted-foreground">
                          Recomendado: 200x200px, PNG ou SVG
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("logo")?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? "Enviando..." : "Enviar Logo"}
                    </Button>
                    {formData.logo_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setFormData({ ...formData, logo_url: null })}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tamanho máximo: 2MB. Formatos aceitos: PNG, JPG, SVG
                  </p>
                </div>
              </div>
            </CardContent>
            </Card>

            {/* Identidade do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Identidade do Sistema
                </CardTitle>
                <CardDescription>
                  Configure o título e ícone que aparecem na aba do navegador
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Título da Aba */}
                <div>
                  <Label htmlFor="titulo-sistema">Título da Aba do Navegador</Label>
                  <Input
                    id="titulo-sistema"
                    value={formData.titulo_sistema}
                    onChange={(e) => setFormData({ ...formData, titulo_sistema: e.target.value })}
                    placeholder="Ex: Minha Consultoria"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Texto que aparece na aba do navegador quando o sistema está aberto
                  </p>
                </div>

                {/* Upload de Favicon */}
                <SystemFaviconUploader 
                  faviconUrl={formData.favicon_url}
                  onUploadComplete={(url) => setFormData({ ...formData, favicon_url: url })}
                />

                {/* Preview da Aba */}
                <div className="p-4 border rounded-lg bg-muted/30">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Preview da aba do navegador:
                  </Label>
                  <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2 w-fit shadow-sm">
                    {formData.favicon_url ? (
                      <img src={formData.favicon_url} alt="Favicon" className="w-4 h-4 object-contain" />
                    ) : (
                      <img src="/favicon.png" alt="Favicon padrão" className="w-4 h-4 object-contain" />
                    )}
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {formData.titulo_sistema || "PsiColab"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paleta de Cores */}
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Paleta de Cores
              </CardTitle>
              <CardDescription>
                Defina as cores primária e secundária do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cor_primaria">Cor Primária</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      id="cor_primaria"
                      value={formData.cor_primaria}
                      onChange={(e) => handleColorChange("cor_primaria", e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.cor_primaria}
                      onChange={(e) => handleColorChange("cor_primaria", e.target.value)}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Botões principais, links e destaques
                  </p>
                </div>

                <div>
                  <Label htmlFor="cor_secundaria">Cor Secundária</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      id="cor_secundaria"
                      value={formData.cor_secundaria}
                      onChange={(e) => handleColorChange("cor_secundaria", e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.cor_secundaria}
                      onChange={(e) => handleColorChange("cor_secundaria", e.target.value)}
                      placeholder="#8b5cf6"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Botões secundários e elementos complementares
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={resetToDefault}>
                  Restaurar Padrão
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview das Cores
              </CardTitle>
              <CardDescription>
                Veja como as cores ficarão nos componentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button style={{ backgroundColor: previewColors.primary }}>
                    Botão Primário
                  </Button>
                  <Button
                    variant="outline"
                    style={{
                      borderColor: previewColors.primary,
                      color: previewColors.primary,
                    }}
                  >
                    Botão Outline
                  </Button>
                  <Button style={{ backgroundColor: previewColors.secondary }}>
                    Botão Secundário
                  </Button>
                </div>

                <div className="p-4 rounded-lg border">
                  <p className="text-sm">
                    Este é um exemplo de texto com{" "}
                    <span style={{ color: previewColors.primary }} className="font-semibold">
                      destaque primário
                    </span>{" "}
                    e{" "}
                    <span style={{ color: previewColors.secondary }} className="font-semibold">
                      destaque secundário
                    </span>
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
