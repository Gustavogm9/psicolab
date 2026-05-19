import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Brain,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useDashboardConsolidado } from "@/hooks/useDashboardConsolidado";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const FeedbackHub = () => {
  const { data: stats, isLoading } = useDashboardConsolidado();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-16 w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </MainLayout>
    );
  }

  // Preparar dados para gráficos
  const dadosGrafico = [
    { nome: 'Captação de Leads', respostas: stats?.totalRespostasDiagnosticos || 0 },
    { nome: 'Avaliações Internas', respostas: stats?.totalRespostasAvaliacoes || 0 },
  ];

  const tendenciaMensal = [
    { mes: 'Jan', leads: 45, avaliacoes: 32 },
    { mes: 'Fev', leads: 52, avaliacoes: 41 },
    { mes: 'Mar', leads: 61, avaliacoes: 38 },
    { mes: 'Abr', leads: 58, avaliacoes: 45 },
    { mes: 'Mai', leads: 67, avaliacoes: 52 },
    { mes: 'Jun', leads: 73, avaliacoes: 48 },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Central de Feedback
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão consolidada de captação de leads e avaliações internas
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="leads">Captação de Leads</TabsTrigger>
            <TabsTrigger value="pesquisas">Avaliações Internas</TabsTrigger>
            <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPIs Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalRespostas || 0}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+12%</span> vs mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leads Gerados</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.leadsGerados || 0}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+8%</span> vs mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(stats?.taxaConversao || 0)}%</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">-2%</span> vs mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.leadsConvertidos || 0}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+5</span> novos este mês
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Respostas</CardTitle>
                  <CardDescription>Por tipo de feedback coletado</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dadosGrafico}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="respostas" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tendência Mensal</CardTitle>
                  <CardDescription>Evolução de respostas ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={tendenciaMensal}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" name="Captação de Leads" strokeWidth={2} />
                      <Line type="monotone" dataKey="avaliacoes" stroke="hsl(var(--accent))" name="Avaliações Internas" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Insights Rápidos */}
            <Card>
              <CardHeader>
                <CardTitle>Insights Principais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Captação em Alta</p>
                    <p className="text-sm text-muted-foreground">
                      Seus questionários de captação geraram 12% mais leads este mês comparado ao anterior
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Engajamento de Avaliações</p>
                    <p className="text-sm text-muted-foreground">
                      Taxa média de resposta de 78% nas avaliações internas, acima da média do setor
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Oportunidade de Melhoria</p>
                    <p className="text-sm text-muted-foreground">
                      Considere aumentar a frequência de follow-up com leads de score alto
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Captação de Leads */}
          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle>Captação de Leads</CardTitle>
                </div>
                <CardDescription>
                  Questionários públicos para atrair e qualificar novos clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats?.totalRespostasDiagnosticos || 0}</div>
                    <div className="text-sm text-muted-foreground">Total de Respostas</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats?.leadsGerados || 0}</div>
                    <div className="text-sm text-muted-foreground">Leads Gerados</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.leadsGerados && stats.totalRespostasDiagnosticos 
                        ? Math.round((stats.leadsGerados / stats.totalRespostasDiagnosticos) * 100)
                        : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Taxa de Qualificação</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Pesquisas Internas */}
          <TabsContent value="pesquisas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <CardTitle>Avaliações Internas</CardTitle>
                </div>
                <CardDescription>
                  Avaliações privadas para clientes existentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats?.totalRespostasAvaliacoes || 0}</div>
                    <div className="text-sm text-muted-foreground">Total de Respostas</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">78%</div>
                    <div className="text-sm text-muted-foreground">Taxa Média de Resposta</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Comparativo */}
          <TabsContent value="comparativo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise Comparativa</CardTitle>
                <CardDescription>Compare o desempenho entre captação e pesquisas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Captação de Leads</div>
                        <div className="text-sm text-muted-foreground">{stats?.totalRespostasDiagnosticos || 0} respostas</div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {stats?.totalRespostas && stats.totalRespostasDiagnosticos
                        ? Math.round((stats.totalRespostasDiagnosticos / stats.totalRespostas) * 100)
                        : 0}% do total
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Avaliações Internas</div>
                        <div className="text-sm text-muted-foreground">{stats?.totalRespostasAvaliacoes || 0} respostas</div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {stats?.totalRespostas && stats.totalRespostasAvaliacoes
                        ? Math.round((stats.totalRespostasAvaliacoes / stats.totalRespostas) * 100)
                        : 0}% do total
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default FeedbackHub;
