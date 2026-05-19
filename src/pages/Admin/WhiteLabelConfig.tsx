import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Building2, Palette, Globe, BarChart3, Save } from "lucide-react";
import { toast } from "sonner";

export default function WhiteLabelConfig() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nome_empresa: "",
    logo_url: "",
    cor_primaria: "#3b82f6",
    cor_secundaria: "#8b5cf6",
    dominio_customizado: "",
    template_padrao: "moderno",
    politica_privacidade: "",
    termos_uso: "",
    analytics_id: "",
    pixel_facebook: "",
    ativo: true,
  });

  // Query para buscar configuração existente
  const { data: config, isLoading } = useQuery({
    queryKey: ["whitelabel-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes_whitelabel")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) setFormData(data);
      return data;
    },
  });

  // Mutation para salvar configuração
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (config?.id) {
        // Update
        const { error } = await supabase
          .from("configuracoes_whitelabel")
          .update(formData)
          .eq("id", config.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from("configuracoes_whitelabel")
          .insert([formData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whitelabel-config"] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao salvar configurações");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-center">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Configurações White-Label</h1>
          <p className="text-muted-foreground">
            Personalize a identidade visual e configurações da plataforma
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
              <CardDescription>Dados básicos da organização</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_empresa">Nome da Empresa</Label>
                <Input
                  id="nome_empresa"
                  value={formData.nome_empresa}
                  onChange={(e) => setFormData({ ...formData, nome_empresa: e.target.value })}
                  placeholder="Ex: Minha Clínica de Psicologia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">URL do Logo</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>

          {/* Identidade Visual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Identidade Visual
              </CardTitle>
              <CardDescription>Cores e template padrão</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cor_primaria">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cor_primaria"
                      type="color"
                      value={formData.cor_primaria}
                      onChange={(e) => setFormData({ ...formData, cor_primaria: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.cor_primaria}
                      onChange={(e) => setFormData({ ...formData, cor_primaria: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cor_secundaria">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cor_secundaria"
                      type="color"
                      value={formData.cor_secundaria}
                      onChange={(e) => setFormData({ ...formData, cor_secundaria: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.cor_secundaria}
                      onChange={(e) => setFormData({ ...formData, cor_secundaria: e.target.value })}
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domínio Customizado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Domínio Customizado
              </CardTitle>
              <CardDescription>Configure seu próprio domínio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dominio_customizado">Domínio</Label>
                <Input
                  id="dominio_customizado"
                  value={formData.dominio_customizado}
                  onChange={(e) => setFormData({ ...formData, dominio_customizado: e.target.value })}
                  placeholder="exemplo.com.br"
                />
                <p className="text-sm text-muted-foreground">
                  Após configurar, adicione os registros DNS necessários
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Analytics e Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics e Tracking
              </CardTitle>
              <CardDescription>IDs de rastreamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="analytics_id">Google Analytics ID</Label>
                <Input
                  id="analytics_id"
                  value={formData.analytics_id}
                  onChange={(e) => setFormData({ ...formData, analytics_id: e.target.value })}
                  placeholder="UA-XXXXXXXXX-X ou G-XXXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pixel_facebook">Facebook Pixel ID</Label>
                <Input
                  id="pixel_facebook"
                  value={formData.pixel_facebook}
                  onChange={(e) => setFormData({ ...formData, pixel_facebook: e.target.value })}
                  placeholder="123456789012345"
                />
              </div>
            </CardContent>
          </Card>

          {/* Termos e Políticas */}
          <Card>
            <CardHeader>
              <CardTitle>Termos e Políticas</CardTitle>
              <CardDescription>Textos legais da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="termos_uso">Termos de Uso</Label>
                <Textarea
                  id="termos_uso"
                  value={formData.termos_uso}
                  onChange={(e) => setFormData({ ...formData, termos_uso: e.target.value })}
                  placeholder="Insira os termos de uso..."
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="politica_privacidade">Política de Privacidade</Label>
                <Textarea
                  id="politica_privacidade"
                  value={formData.politica_privacidade}
                  onChange={(e) => setFormData({ ...formData, politica_privacidade: e.target.value })}
                  placeholder="Insira a política de privacidade..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ativo">Configuração Ativa</Label>
                  <p className="text-sm text-muted-foreground">
                    Ative ou desative as configurações white-label
                  </p>
                </div>
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
    </div>
  );
}
