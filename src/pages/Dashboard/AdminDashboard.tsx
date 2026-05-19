import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Globe, Activity, TrendingUp } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { PsychologistSelector } from "@/components/admin/PsychologistSelector";

// Import admin page components
import DominiosCustomizados from "../Admin/DominiosCustomizados";
import PerfisPublicos from "../Admin/PerfisPublicos";
import WhiteLabelConfig from "../Admin/WhiteLabelConfig";
import AnalyticsConsolidado from "../Admin/AnalyticsConsolidado";
import AuditLogs from "../Admin/AuditLogs";

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get active tab from URL hash
  const getTabFromHash = () => {
    const hash = location.hash.replace('#', '');
    return hash || 'overview';
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromHash());

  // Sync URL hash with active tab
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && hash !== activeTab) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/dashboard/admin#${value}`, { replace: true });
  };

  // Buscar estatísticas do sistema
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Total de psicólogos/consultoras
      const { count: totalPsicologos } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "consultora");

      // Total de perfis públicos ativos
      const { count: perfisAtivos } = await supabase
        .from("perfis_publicos")
        .select("*", { count: "exact", head: true })
        .eq("ativo", true);

      // Total de domínios customizados
      const { count: dominiosCustomizados } = await supabase
        .from("dominios_customizados")
        .select("*", { count: "exact", head: true });

      // Domínios aguardando aprovação
      const { count: dominiosPendentes } = await supabase
        .from("dominios_customizados")
        .select("*", { count: "exact", head: true })
        .eq("status", "aguardando_aprovacao");

      return {
        totalPsicologos: totalPsicologos || 0,
        perfisAtivos: perfisAtivos || 0,
        dominiosCustomizados: dominiosCustomizados || 0,
        dominiosPendentes: dominiosPendentes || 0,
      };
    },
  });

  // Buscar atividade recente
  const { data: atividadeRecente } = useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => {
      const { data } = await supabase
        .from("perfil_publico_analytics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      return data || [];
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
            <p className="text-muted-foreground">
              Gestão completa do sistema
            </p>
          </div>
          <PsychologistSelector />
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Dashboard</TabsTrigger>
            <TabsTrigger value="dominios">Domínios</TabsTrigger>
            <TabsTrigger value="perfis">Perfis Públicos</TabsTrigger>
            <TabsTrigger value="whitelabel">White-Label</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="audit-logs">Auditoria</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Métricas Principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Psicólogos Cadastrados</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalPsicologos || 0}</div>
                  <p className="text-xs text-muted-foreground">Total no sistema</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Perfis Públicos Ativos</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.perfisAtivos || 0}</div>
                  <p className="text-xs text-muted-foreground">Páginas publicadas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Domínios Customizados</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.dominiosCustomizados || 0}</div>
                  <p className="text-xs text-muted-foreground">Total configurados</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Domínios Pendentes</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.dominiosPendentes || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.dominiosPendentes ? "Aguardando aprovação" : "Nenhum pendente"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cards de Informação */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  {atividadeRecente && atividadeRecente.length > 0 ? (
                    <div className="space-y-2">
                      {atividadeRecente.slice(0, 5).map((atividade) => (
                        <div
                          key={atividade.id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <span className="text-sm text-muted-foreground">
                            {atividade.tipo_evento}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(atividade.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma atividade recente
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Acesso Rápido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleTabChange('dominios')}
                      className="w-full block p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                    >
                      <h3 className="font-medium">Gerenciar Domínios</h3>
                      <p className="text-sm text-muted-foreground">
                        Aprovar e configurar domínios customizados
                      </p>
                    </button>
                    <button
                      onClick={() => handleTabChange('perfis')}
                      className="w-full block p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                    >
                      <h3 className="font-medium">Perfis Públicos</h3>
                      <p className="text-sm text-muted-foreground">
                        Visualizar e gerenciar perfis públicos
                      </p>
                    </button>
                    <button
                      onClick={() => handleTabChange('analytics')}
                      className="w-full block p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                    >
                      <h3 className="font-medium">Analytics Global</h3>
                      <p className="text-sm text-muted-foreground">
                        Métricas consolidadas do sistema
                      </p>
                    </button>
                    <button
                      onClick={() => handleTabChange('audit-logs')}
                      className="w-full block p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                    >
                      <h3 className="font-medium">Logs de Auditoria</h3>
                      <p className="text-sm text-muted-foreground">
                        Histórico de impersonificações
                      </p>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Domínios Tab */}
          <TabsContent value="dominios">
            <DominiosCustomizados />
          </TabsContent>

          {/* Perfis Tab */}
          <TabsContent value="perfis">
            <PerfisPublicos />
          </TabsContent>

          {/* White-Label Tab */}
          <TabsContent value="whitelabel">
            <WhiteLabelConfig />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsConsolidado />
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit-logs">
            <AuditLogs />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
