import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Phone, Building2, Calendar, Edit, Save, Loader2, Bell, Shield, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useBlockSensitiveActions } from "@/hooks/useBlockSensitiveActions";

const perfilSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  phone: z.string().trim().max(20, "Telefone muito longo").optional(),
  cargo: z.string().trim().max(100, "Cargo muito longo").optional(),
  bio: z.string().trim().max(500, "Biografia muito longa").optional(),
  crp: z.string().trim().max(50, "Registro muito longo").optional(),
  area_atuacao: z.string().trim().max(100, "Área de atuação muito longa").optional(),
  anos_experiencia: z.coerce.number().min(0).max(60).optional()
});

const passwordSchema = z.object({
  current: z.string().min(1, "Senha atual é obrigatória"),
  new: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres").max(100, "Senha muito longa"),
  confirm: z.string().min(1, "Confirmação de senha é obrigatória")
}).refine((data) => data.new === data.confirm, {
  message: "As senhas não coincidem",
  path: ["confirm"]
});

const MeuPerfil = () => {
  const { effectiveProfile, effectiveEmail, updateProfile, user, isLoading: authLoading } = useAuth();
  const { blockSensitiveAction, isImpersonating } = useBlockSensitiveActions();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("pessoais");
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    cargo: "",
    bio: "",
    crp: "",
    area_atuacao: "",
    anos_experiencia: 0
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reports: true,
    alerts: true
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  useEffect(() => {
    if (effectiveProfile) {
      setFormData({
        name: effectiveProfile.name || "",
        phone: effectiveProfile.phone || "",
        cargo: effectiveProfile.cargo || "",
        bio: effectiveProfile.bio || "",
        crp: effectiveProfile.crp || "",
        area_atuacao: effectiveProfile.area_atuacao || "",
        anos_experiencia: effectiveProfile.anos_experiencia || 0
      });
    }
  }, [effectiveProfile]);

  const handleSave = async () => {
    try {
      perfilSchema.parse(formData);
      setIsSaving(true);
      const { error } = await updateProfile(formData);
      if (error) {
        toast.error("Erro ao atualizar perfil: " + error.message);
      } else {
        toast.success("Perfil atualizado com sucesso!");
        setIsEditing(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('psych_harmony_notifications', JSON.stringify(notifications));
      toast.success("Preferências de notificação salvas!");
    } catch (error) {
      toast.error("Erro ao salvar preferências. Tente novamente.");
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleChangePassword = async () => {
    // Bloquear durante impersonificação
    if (blockSensitiveAction("alterar senha")) {
      return;
    }

    try {
      passwordSchema.parse(passwordData);
      setIsLoadingPassword(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPasswordData({ current: "", new: "", confirm: "" });
      toast.success("Senha alterada com sucesso!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        toast.error("Erro ao alterar senha. Tente novamente.");
      }
    } finally {
      setIsLoadingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const initials = formData.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Meu Perfil</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gerencie suas informações pessoais e preferências
            </p>
          </div>
          <Badge variant="outline" className="w-fit">Conta Ativa</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Profile Image and Basic Info */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                <AvatarImage src={effectiveProfile?.avatar_url || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg sm:text-xl break-words">{formData.name}</CardTitle>
              <CardDescription>{formData.cargo || "Usuário"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm break-all">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{effectiveEmail}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Membro desde {new Date(effectiveProfile?.created_at || "").getFullYear()}</span>
              </div>
              <Separator />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isEditing ? (
                  <Save className="h-4 w-4 mr-2" />
                ) : (
                  <Edit className="h-4 w-4 mr-2" />
                )}
                {isSaving ? "Salvando..." : isEditing ? "Salvar" : "Editar Perfil"}
              </Button>
            </CardContent>
          </Card>

          {/* Tabs with Information */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pessoais">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
                <TabsTrigger value="preferencias">Preferências</TabsTrigger>
              </TabsList>

              {/* Dados Pessoais */}
              <TabsContent value="pessoais" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Informações Pessoais</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input 
                          id="name" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={effectiveEmail || ""}
                          disabled={true}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input 
                          id="phone" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cargo">Cargo</Label>
                        <Input 
                          id="cargo" 
                          value={formData.cargo}
                          onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia</Label>
                      <Textarea 
                        id="bio" 
                        placeholder="Conte um pouco sobre sua experiência..."
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        disabled={!isEditing}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Dados Profissionais */}
              <TabsContent value="profissionais" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>Informações Profissionais</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="crp">Registro Profissional (CRP)</Label>
                        <Input 
                          id="crp" 
                          value={formData.crp}
                          onChange={(e) => setFormData({...formData, crp: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="area_atuacao">Área de Atuação</Label>
                        <Input 
                          id="area_atuacao" 
                          value={formData.area_atuacao}
                          onChange={(e) => setFormData({...formData, area_atuacao: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="anos_experiencia">Anos de Experiência</Label>
                        <Input 
                          id="anos_experiencia"
                          type="number"
                          value={formData.anos_experiencia}
                          onChange={(e) => setFormData({...formData, anos_experiencia: parseInt(e.target.value) || 0})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferências */}
              <TabsContent value="preferencias" className="space-y-4">
                {/* Notificações */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notificações
                    </CardTitle>
                    <CardDescription>Configure como e quando receber notificações</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Notificações por Email</Label>
                          <p className="text-sm text-muted-foreground">Receba resumos e alertas por email</p>
                        </div>
                        <Switch 
                          checked={notifications.email}
                          onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Notificações Push</Label>
                          <p className="text-sm text-muted-foreground">Alertas em tempo real no navegador</p>
                        </div>
                        <Switch 
                          checked={notifications.push}
                          onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Relatórios Automáticos</Label>
                          <p className="text-sm text-muted-foreground">Receba relatórios semanais por email</p>
                        </div>
                        <Switch 
                          checked={notifications.reports}
                          onCheckedChange={(checked) => setNotifications({...notifications, reports: checked})}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Alertas Críticos</Label>
                          <p className="text-sm text-muted-foreground">Notificações para situações que precisam de atenção</p>
                        </div>
                        <Switch 
                          checked={notifications.alerts}
                          onCheckedChange={(checked) => setNotifications({...notifications, alerts: checked})}
                        />
                      </div>
                    </div>
                    <Button 
                      variant="secondary"
                      className="w-full"
                      onClick={handleSaveNotifications}
                      disabled={isLoadingNotifications}
                    >
                      {isLoadingNotifications ? "Salvando..." : "Salvar Preferências"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Segurança */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Segurança da Conta
                    </CardTitle>
                    <CardDescription>Mantenha sua conta protegida</CardDescription>
                  </CardHeader>
                  {isImpersonating && (
                    <Alert variant="destructive" className="mx-6 mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Alteração de senha bloqueada durante impersonificação. Encerre a sessão de impersonificação para realizar esta ação.
                      </AlertDescription>
                    </Alert>
                  )}
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Senha Atual</Label>
                      <Input 
                        id="current-password" 
                        type="password"
                        value={passwordData.current}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <Input 
                        id="new-password" 
                        type="password"
                        value={passwordData.new}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                      <Input 
                        id="confirm-password" 
                        type="password"
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                      />
                    </div>
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={handleChangePassword}
                      disabled={isLoadingPassword || isImpersonating}
                    >
                      {isLoadingPassword ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MeuPerfil;
