import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { TrendingUp, TrendingDown, BarChart3, Calendar, Building2, Users, Target, Award, Loader2, CheckCircle, X, Play } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { MainLayout } from "@/components/layout/main-layout";

const Analises = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("6m");
  const [selectedMetric, setSelectedMetric] = useState("clima");
  const [loading, setLoading] = useState(false);
  const [implementarDialogOpen, setImplementarDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [planoIntervencao, setPlanoIntervencao] = useState({
    titulo: "",
    descricao: "",
    prazo: "",
    responsavel: "",
    recursos: "",
    objetivos: ""
  });

  const trendData = [
    { month: "Jan", clima: 7.2, engagement: 6.8, burnout: 3.2 },
    { month: "Fev", clima: 7.4, engagement: 7.1, burnout: 3.0 },
    { month: "Mar", clima: 7.8, engagement: 7.5, burnout: 2.8 },
    { month: "Abr", clima: 8.1, engagement: 7.8, burnout: 2.5 },
    { month: "Mai", clima: 8.3, engagement: 8.2, burnout: 2.2 },
    { month: "Jun", clima: 8.5, engagement: 8.5, burnout: 2.0 }
  ];

  const benchmarkData = [
    { setor: "Tecnologia", score: 8.1 },
    { setor: "Sua Empresa", score: 8.5 },
    { setor: "Consultoria", score: 7.8 },
    { setor: "Financeiro", score: 7.5 },
    { setor: "Saúde", score: 7.9 },
    { setor: "Educação", score: 8.0 }
  ];

  const departmentData = [
    { department: "RH", clima: 9.2, engagement: 9.0, burnout: 1.5, comunicacao: 8.8, lideranca: 9.1 },
    { department: "Tecnologia", clima: 8.5, engagement: 8.7, burnout: 2.0, comunicacao: 8.2, lideranca: 8.4 },
    { department: "Vendas", clima: 8.1, engagement: 8.3, burnout: 2.3, comunicacao: 7.9, lideranca: 8.0 },
    { department: "Marketing", clima: 8.7, engagement: 8.9, burnout: 1.8, comunicacao: 8.6, lideranca: 8.5 },
    { department: "Operações", clima: 7.9, engagement: 7.8, burnout: 2.8, comunicacao: 7.5, lideranca: 7.7 }
  ];

  const insights = [
    {
      id: 1,
      title: "Tendência Positiva no Clima",
      description: "Clima organizacional melhorou 18% nos últimos 6 meses",
      impact: "Positivo",
      trend: "up",
      value: "+18%",
      color: "text-green-600"
    },
    {
      id: 2,
      title: "Redução do Burnout",
      description: "Índice de burnout diminuiu significativamente no último trimestre",
      impact: "Positivo",
      trend: "down",
      value: "-37%",
      color: "text-green-600"
    },
    {
      id: 3,
      title: "Benchmark Acima da Média",
      description: "Sua empresa está 6% acima da média do setor",
      impact: "Positivo",
      trend: "up",
      value: "+6%",
      color: "text-green-600"
    },
    {
      id: 4,
      title: "Oportunidade em Operações",
      description: "Departamento com maior potencial de melhoria identificado",
      impact: "Atenção",
      trend: "down",
      value: "7.9/10",
      color: "text-orange-600"
    }
  ];

  // Funções para lidar com implementação de ações
  const handleImplementarAcao = (action: any) => {
    setSelectedAction(action);
    setPlanoIntervencao({
      titulo: action.title,
      descricao: `Plano de implementação para: ${action.title}`,
      prazo: action.timeline,
      responsavel: "",
      recursos: "",
      objetivos: action.expectedImpact
    });
    setImplementarDialogOpen(true);
  };

  const planoIntervencaoSchema = z.object({
    titulo: z.string().trim().min(1, "Título é obrigatório").max(200, "Título muito longo"),
    descricao: z.string().trim().min(1, "Descrição é obrigatória").max(1000, "Descrição muito longa"),
    prazo: z.string().max(100, "Prazo muito longo").optional(),
    responsavel: z.string().max(100, "Responsável muito longo").optional(),
    recursos: z.string().max(500, "Recursos muito longo").optional(),
    objetivos: z.string().max(500, "Objetivos muito longo").optional()
  });

  const handleSalvarPlanoIntervencao = async () => {
    // Validar com zod
    try {
      planoIntervencaoSchema.parse(planoIntervencao);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular criação da intervenção
      const novaIntervencao = {
        id: Date.now(),
        title: planoIntervencao.titulo,
        description: planoIntervencao.descricao,
        department: selectedAction?.department,
        priority: selectedAction?.priority,
        timeline: planoIntervencao.prazo,
        responsible: planoIntervencao.responsavel,
        resources: planoIntervencao.recursos,
        objectives: planoIntervencao.objetivos,
        status: 'planejada',
        createdAt: new Date().toISOString()
      };
      
      toast.success(`Intervenção "${planoIntervencao.titulo}" criada com sucesso!`);
      setImplementarDialogOpen(false);
      setPlanoIntervencao({
        titulo: "",
        descricao: "",
        prazo: "",
        responsavel: "",
        recursos: "",
        objetivos: ""
      });
    } catch (error) {
      toast.error("Erro ao criar plano de intervenção. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const actionableInsights = [
    {
      title: "Implementar programa de reconhecimento",
      department: "Operações",
      expectedImpact: "Melhoria de 15% no engagement",
      priority: "Alta",
      timeline: "2-4 semanas"
    },
    {
      title: "Treinamento de liderança colaborativa",
      department: "Vendas",
      expectedImpact: "Redução de 20% no burnout",
      priority: "Média",
      timeline: "6-8 semanas"
    },
    {
      title: "Círculos de feedback estruturados",
      department: "Tecnologia",
      expectedImpact: "Melhoria de 10% na comunicação",
      priority: "Baixa",
      timeline: "4-6 semanas"
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Análises Comparativas</h1>
            <p className="text-muted-foreground">Insights avançados e benchmarking de mercado</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 meses</SelectItem>
                <SelectItem value="6m">6 meses</SelectItem>
                <SelectItem value="1y">1 ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
            <TabsTrigger value="departments">Departamentos</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Tendências */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clima Atual</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">8.5</div>
                  <p className="text-xs text-muted-foreground">+18% vs período anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">8.5</div>
                  <p className="text-xs text-muted-foreground">+25% vs período anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Burnout</CardTitle>
                  <TrendingDown className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">2.0</div>
                  <p className="text-xs text-muted-foreground">-37% vs período anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Score Geral</CardTitle>
                  <Award className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">8.3</div>
                  <p className="text-xs text-muted-foreground">+15% vs período anterior</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Evolução Temporal</CardTitle>
                <CardDescription>Acompanhe as principais métricas ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="clima" stroke="#22c55e" strokeWidth={3} />
                      <Line type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={3} />
                      <Line type="monotone" dataKey="burnout" stroke="#ef4444" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benchmark */}
          <TabsContent value="benchmark" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Benchmark de Mercado</CardTitle>
                <CardDescription>Compare sua empresa com outros setores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={benchmarkData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 10]} />
                      <YAxis dataKey="setor" type="category" width={100} />
                      <Tooltip />
                      <Bar 
                        dataKey="score" 
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Posição no Mercado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">2º</div>
                  <p className="text-sm text-muted-foreground">Entre 6 setores analisados</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">Acima da média</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Diferencial Competitivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">+6%</div>
                  <p className="text-sm text-muted-foreground">Acima da média do setor</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Vantagem</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Empresas Similares
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">847</div>
                  <p className="text-sm text-muted-foreground">Na base de comparação</p>
                  <Badge className="mt-2 bg-purple-100 text-purple-800">Representativo</Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Departamentos */}
          <TabsContent value="departments" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Análise Radar por Departamento</CardTitle>
                  <CardDescription>Visão 360° das métricas por área</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        { subject: 'Clima', A: departmentData[0].clima },
                        { subject: 'Engagement', A: departmentData[0].engagement },
                        { subject: 'Comunicação', A: departmentData[0].comunicacao },
                        { subject: 'Liderança', A: departmentData[0].lideranca }
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis domain={[0, 10]} />
                        <Radar name="RH" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ranking Departamental</CardTitle>
                  <CardDescription>Performance por área organizacional</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {departmentData.map((dept, index) => (
                    <div key={dept.department} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{dept.department}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-bold">{dept.clima.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">Clima</div>
                        </div>
                        <Progress value={dept.clima * 10} className="w-20" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Insights Automáticos</CardTitle>
                  <CardDescription>IA identifica padrões e oportunidades</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {insight.trend === "up" ? (
                            <TrendingUp className={`w-4 h-4 ${insight.color}`} />
                          ) : (
                            <TrendingDown className={`w-4 h-4 ${insight.color}`} />
                          )}
                          <span className={`text-sm font-bold ${insight.color}`}>
                            {insight.value}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recomendações de Ação</CardTitle>
                  <CardDescription>Sugestões baseadas em dados para melhoria</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {actionableInsights.map((action, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold flex-1">{action.title}</h4>
                        <Badge variant={action.priority === "Alta" ? "destructive" : action.priority === "Média" ? "secondary" : "outline"}>
                          {action.priority}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Departamento:</span>
                          <span className="font-medium">{action.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Impacto esperado:</span>
                          <span className="font-medium">{action.expectedImpact}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prazo:</span>
                          <span className="font-medium">{action.timeline}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-3"
                        onClick={() => handleImplementarAcao(action)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        Implementar Ação
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Implementação de Ação */}
      <Dialog open={implementarDialogOpen} onOpenChange={setImplementarDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Implementar Ação</DialogTitle>
            <DialogDescription>
              Crie um plano de intervenção baseado na recomendação selecionada
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="titulo">Título da Intervenção</Label>
              <Input
                id="titulo"
                value={planoIntervencao.titulo}
                onChange={(e) => setPlanoIntervencao({...planoIntervencao, titulo: e.target.value})}
                placeholder="Digite o título da intervenção"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={planoIntervencao.descricao}
                onChange={(e) => setPlanoIntervencao({...planoIntervencao, descricao: e.target.value})}
                placeholder="Descreva detalhadamente o plano de implementação"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prazo">Prazo</Label>
                <Input
                  id="prazo"
                  value={planoIntervencao.prazo}
                  onChange={(e) => setPlanoIntervencao({...planoIntervencao, prazo: e.target.value})}
                  placeholder="Ex: 4-6 semanas"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={planoIntervencao.responsavel}
                  onChange={(e) => setPlanoIntervencao({...planoIntervencao, responsavel: e.target.value})}
                  placeholder="Nome do responsável"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recursos">Recursos Necessários</Label>
              <Textarea
                id="recursos"
                value={planoIntervencao.recursos}
                onChange={(e) => setPlanoIntervencao({...planoIntervencao, recursos: e.target.value})}
                placeholder="Liste os recursos necessários (humanos, financeiros, materiais)"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="objetivos">Objetivos e Metas</Label>
              <Textarea
                id="objetivos"
                value={planoIntervencao.objetivos}
                onChange={(e) => setPlanoIntervencao({...planoIntervencao, objetivos: e.target.value})}
                placeholder="Defina os objetivos específicos e metas mensuráveis"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImplementarDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSalvarPlanoIntervencao} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Criar Intervenção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Analises;