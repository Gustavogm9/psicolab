import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";
import { Building2, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { CategoriasManager } from "@/components/configuracoes/CategoriasManager";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const companySchema = z.object({
  name: z.string().trim().min(1, "Nome da empresa é obrigatório").max(200, "Nome muito longo"),
  sector: z.string().optional(),
  size: z.string().optional(),
  address: z.string().max(300, "Endereço muito longo").optional()
});

const MinhaEmpresa = () => {
  const { effectiveUserId, effectiveProfile, isImpersonating, refreshImpersonatedProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("geral");
  const [isLoading, setIsLoading] = useState(false);
  
  const [companyData, setCompanyData] = useState({
    name: effectiveProfile?.company || "",
    sector: effectiveProfile?.empresa_setor || "",
    size: effectiveProfile?.empresa_tamanho || "",
    address: effectiveProfile?.empresa_endereco || ""
  });

  // Sincronizar com effectiveProfile quando mudar (impersonificação)
  useEffect(() => {
    if (effectiveProfile) {
      setCompanyData({
        name: effectiveProfile.company || "",
        sector: effectiveProfile.empresa_setor || "",
        size: effectiveProfile.empresa_tamanho || "",
        address: effectiveProfile.empresa_endereco || ""
      });
    }
  }, [effectiveProfile]);

  const handleSaveCompany = async () => {
    try {
      companySchema.parse(companyData);
      
      if (!effectiveUserId) {
        toast.error("Usuário não identificado");
        return;
      }

      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          company: companyData.name,
          empresa_setor: companyData.sector,
          empresa_tamanho: companyData.size,
          empresa_endereco: companyData.address
        })
        .eq('id', effectiveUserId);

      if (error) throw error;
      
      // Recarregar o perfil no AuthContext para manter sincronizado durante impersonificação
      if (isImpersonating) {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', effectiveUserId)
          .single();
        
        if (updatedProfile) {
          refreshImpersonatedProfile(updatedProfile);
        }
      }
      
      toast.success("Informações da empresa atualizadas!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        console.error("Erro ao atualizar empresa:", error);
        toast.error("Erro ao atualizar empresa. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Minha Empresa</h1>
            <p className="text-muted-foreground">Configure as informações da sua organização</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="geral">Informações Gerais</TabsTrigger>
            <TabsTrigger value="categorias">Categorias Personalizadas</TabsTrigger>
          </TabsList>

          {/* Informações Gerais */}
          <TabsContent value="geral" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Dados da Empresa
                </CardTitle>
                <CardDescription>Informações sobre sua organização</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Nome da Empresa</Label>
                  <Input 
                    id="company" 
                    value={companyData.name}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Setor</Label>
                  <Select 
                    value={companyData.sector}
                    onValueChange={(value) => setCompanyData(prev => ({ ...prev, sector: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="varejo">Varejo</SelectItem>
                      <SelectItem value="industria">Indústria</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Tamanho da Empresa</Label>
                  <Select 
                    value={companyData.size}
                    onValueChange={(value) => setCompanyData(prev => ({ ...prev, size: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 funcionários</SelectItem>
                      <SelectItem value="11-50">11-50 funcionários</SelectItem>
                      <SelectItem value="51-200">51-200 funcionários</SelectItem>
                      <SelectItem value="201-500">201-500 funcionários</SelectItem>
                      <SelectItem value="500+">500+ funcionários</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea 
                    id="address" 
                    value={companyData.address}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Digite o endereço completo da empresa"
                    rows={3}
                  />
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={handleSaveCompany}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Atualizar Empresa"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categorias */}
          <TabsContent value="categorias" className="space-y-6">
            <CategoriasManager />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default MinhaEmpresa;
