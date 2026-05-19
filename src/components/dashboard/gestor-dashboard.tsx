import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  TrendingDown, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Download,
  Eye,
  BarChart3,
  Target,
  DollarSign,
  Clock,
  CheckCircle2
} from "lucide-react";

export function GestorDashboard() {
  // Mock data para demonstração
  const kpis = [
    {
      title: "Taxa de Absenteísmo",
      value: "4.2%",
      description: "Meta: < 5%",
      icon: TrendingDown,
      trend: { value: -12, isPositive: true },
      variant: "success" as const
    },
    {
      title: "Turnover Mensal", 
      value: "2.8%",
      description: "Meta: < 3%",
      icon: Users,
      trend: { value: -8, isPositive: true },
      variant: "success" as const
    },
    {
      title: "Índice de Risco",
      value: "Médio",
      description: "3 fatores de atenção",
      icon: AlertTriangle,
      variant: "warning" as const
    },
    {
      title: "ROI Estimado",
      value: "R$ 180k",
      description: "Economia anual projetada",
      icon: DollarSign,
      trend: { value: 25, isPositive: true },
      variant: "primary" as const
    }
  ];

  const topRisks = [
    {
      factor: "Sobrecarga de Trabalho",
      area: "TI",
      severity: "Alto",
      affected: 45,
      color: "destructive" as const
    },
    {
      factor: "Comunicação Ineficaz",
      area: "Vendas", 
      severity: "Médio",
      affected: 32,
      color: "warning" as const
    },
    {
      factor: "Falta de Reconhecimento",
      area: "Operações",
      severity: "Médio", 
      affected: 28,
      color: "warning" as const
    },
    {
      factor: "Conflitos Interpessoais",
      area: "Atendimento",
      severity: "Baixo",
      affected: 15,
      color: "success" as const
    }
  ];

  const actionPlans = [
    {
      action: "Workshop Gestão do Tempo",
      responsible: "RH",
      deadline: "30 Jan",
      status: "Em andamento",
      progress: 75
    },
    {
      action: "Treinamento Comunicação",
      responsible: "Gestores",
      deadline: "15 Feb",
      status: "Planejado",
      progress: 25
    },
    {
      action: "Programa de Reconhecimento",
      responsible: "Diretoria",
      deadline: "28 Feb",
      status: "Iniciado",
      progress: 40
    }
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            Painel Executivo
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão estratégica dos riscos psicossociais
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/relatorios/1-pager">
              <Eye className="mr-2 h-4 w-4" />
              1-Pager
            </Link>
          </Button>
          <Button className="bg-gradient-to-r from-secondary to-primary hover:opacity-90" asChild>
            <Link to="/relatorios/detalhado">
              <Download className="mr-2 h-4 w-4" />
              Relatório Completo
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <StatCard key={index} {...kpi} className="fade-in" />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top 5 Riscos */}
        <div className="lg:col-span-2">
          <Card className="card-premium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-destructive" />
                    Top 5 Fatores de Risco
                  </CardTitle>
                  <CardDescription>
                    Fatores que requerem atenção prioritária
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Atualizado hoje
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topRisks.map((risk, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-4 p-4 border border-border/30 rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{risk.factor}</h4>
                        <Badge 
                          variant={risk.color === 'destructive' ? 'destructive' : 'secondary'} 
                          className={`text-xs ${
                            risk.color === 'destructive' ? 'bg-destructive text-destructive-foreground' :
                            risk.color === 'warning' ? 'bg-warning/10 text-warning' : 
                            'bg-success/10 text-success'
                          }`}
                        >
                          {risk.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Área: {risk.area}</span>
                        <span>{risk.affected} colaboradores afetados</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            risk.color === 'destructive' ? 'bg-destructive' :
                            risk.color === 'warning' ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${(risk.affected / 50) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Planos de Ação */}
        <div className="space-y-6">
          {/* Planos de Ação */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Planos de Ação
              </CardTitle>
              <CardDescription>Status das intervenções</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {actionPlans.map((plan, index) => (
                <div key={index} className="space-y-3 p-3 border border-border/30 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{plan.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {plan.responsible} • {plan.deadline}
                      </p>
                    </div>
                    <Badge 
                      variant={plan.status === "Em andamento" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {plan.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progresso</span>
                      <span>{plan.progress}%</span>
                    </div>
                    <Progress value={plan.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Status Geral */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Status Geral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm font-medium">Coleta</span>
                </div>
                <span className="text-xs text-success">Completa</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium">Análise</span>
                </div>
                <span className="text-xs text-primary">Em andamento</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 border border-border/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm font-medium">Intervenções</span>
                </div>
                <span className="text-xs text-muted-foreground">Planejado</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}