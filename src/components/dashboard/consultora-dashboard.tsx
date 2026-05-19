import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  AlertCircle, 
  Calendar,
  FileText,
  Plus,
  ArrowRight,
  Building2,
  Activity,
  DollarSign,
  Clock
} from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useMetricasFinanceiras } from "@/hooks/useMetricasFinanceiras";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { ClienteFormModal } from "@/components/clientes/ClienteFormModal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function ConsultoraDashboard() {
  const navigate = useNavigate();
  const { stats, projetos, eventos, alertas, isLoading } = useDashboardData();
  // Filter financial metrics by current month
  const mesAtualInicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const mesAtualFim = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
  const { metricas, isLoading: metricasLoading } = useMetricasFinanceiras({ data_inicio: mesAtualInicio, data_fim: mesAtualFim });
  const [showClienteModal, setShowClienteModal] = useState(false);

  // Atualizar faturas vencidas ao carregar o dashboard
  useEffect(() => {
    supabase.rpc('atualizar_faturas_vencidas_com_alertas').then(() => {});
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: "Clientes Ativos",
      value: String(stats?.clientesAtivos || 0),
      description: "Ativos no momento",
      icon: Building2,
      variant: "primary" as const
    },
    {
      title: "Avaliações em Andamento", 
      value: String(stats?.avaliacoesAndamento || 0),
      description: "Neste trimestre",
      icon: Activity,
      variant: "secondary" as const
    },
    {
      title: "Taxa de Resposta Média",
      value: `${stats?.taxaResposta || 0}%`,
      description: "Média geral",
      icon: TrendingUp,
      variant: "success" as const
    },
    {
      title: "Relatórios Pendentes",
      value: String(stats?.relatoriosPendentes || 0),
      description: "Para entregar",
      icon: FileText,
      variant: "warning" as const
    }
  ];

  const priorityColors = {
    high: "destructive",
    medium: "warning", 
    low: "success"
  };

  const statusColors = {
    "Coleta": "primary",
    "Análise": "secondary",
    "Relatório": "success",
    "Concluído": "default"
  };

  const getAlertColor = (tipo: string) => {
    switch (tipo) {
      case 'error': return 'bg-destructive/10 border-destructive/20';
      case 'warning': return 'bg-warning/10 border-warning/20';
      case 'info': return 'bg-primary/10 border-primary/20';
      default: return 'bg-muted/10 border-border/20';
    }
  };

  const getAlertIconColor = (tipo: string) => {
    switch (tipo) {
      case 'error': return 'text-destructive';
      case 'warning': return 'text-warning';
      case 'info': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const handleProjectClick = (id: string) => {
    navigate(`/avaliacoes/${id}`);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            Dashboard Consultora
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral dos seus clientes e projetos
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          onClick={() => setShowClienteModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} className="fade-in" />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projetos Recentes */}
        <div className="lg:col-span-2">
          <Card className="card-premium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Projetos em Andamento
                  </CardTitle>
                  <CardDescription>
                    Acompanhe o progresso das avaliações
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/avaliacoes">
                    Ver Todos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!projetos || projetos.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Nenhum projeto em andamento</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link to="/avaliacoes/criar">Criar Primeiro Projeto</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projetos.map((project: any) => (
                    <div 
                      key={project.id}
                      className="flex items-center space-x-4 p-4 border border-border/30 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{project.cliente?.nome || 'Cliente'}</h4>
                          <Badge 
                            variant={statusColors[project.status as keyof typeof statusColors] as any}
                            className="text-xs"
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{project.tipo || project.nome}</span>
                          <span>Entrega: {project.data_fim ? format(new Date(project.data_fim), 'dd MMM yyyy', { locale: ptBR }) : 'N/A'}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progresso</span>
                            <span>{project.progresso}%</span>
                          </div>
                          <Progress value={project.progresso} className="h-2" />
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <Badge 
                          variant={priorityColors[project.prioridade as keyof typeof priorityColors] as any}
                          className="w-2 h-2 p-0 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Próximas Ações */}
        <div className="space-y-6">
          {/* Próximos Eventos */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-secondary" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!eventos || eventos.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">
                  Nenhum evento próximo
                </p>
              ) : (
                eventos.map((evento: any) => (
                  <div key={evento.id} className="flex items-start space-x-3 p-3 border border-border/30 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{evento.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {evento.cliente?.nome || 'Cliente'} - {format(new Date(evento.data_hora), "dd MMM HH:mm", { locale: ptBR })}
                      </p>
                      {evento.local && (
                        <p className="text-xs text-muted-foreground">{evento.local}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Alertas */}
          <Card className="card-premium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Alertas
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate('/agenda')}>
                  Ver todos
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {!alertas || alertas.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">
                  Nenhum alerta no momento
                </p>
              ) : (
                alertas.map((alerta: any) => (
                  <div 
                    key={alerta.id} 
                    className={`flex items-start space-x-3 p-3 border rounded-lg ${getAlertColor(alerta.tipo)}`}
                  >
                    <AlertCircle className={`h-4 w-4 mt-0.5 ${getAlertIconColor(alerta.tipo)}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alerta.titulo}</p>
                      {alerta.descricao && (
                        <p className="text-xs text-muted-foreground">{alerta.descricao}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card className="card-premium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Financeiro
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/financeiro">
                    Ver tudo
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {metricasLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-200/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Receita do mês</p>
                      <p className="text-lg font-bold text-green-700">
                        R$ {(metricas?.receita_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  {(metricas?.faturas_atrasadas || 0) > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-200/50">
                      <div>
                        <p className="text-xs text-muted-foreground">Faturas atrasadas</p>
                        <p className="text-lg font-bold text-red-700">
                          {metricas?.faturas_atrasadas} · R$ {(metricas?.receita_atrasada || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                  )}
                  {(metricas?.faturas_pendentes || 0) > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/5 border border-yellow-200/50">
                      <div>
                        <p className="text-xs text-muted-foreground">Pendentes</p>
                        <p className="text-sm font-medium text-yellow-700">
                          {metricas?.faturas_pendentes} fatura{(metricas?.faturas_pendentes || 0) > 1 ? 's' : ''} · R$ {(metricas?.receita_pendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                  )}
                  {(metricas?.faturas_atrasadas || 0) === 0 && (metricas?.faturas_pendentes || 0) === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Sem faturas pendentes ou atrasadas 🎉
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ClienteFormModal 
        open={showClienteModal}
        onOpenChange={setShowClienteModal}
        onSuccess={() => {
          toast.success('Cliente criado! Suas estatísticas foram atualizadas.');
        }}
      />
    </div>
  );
}
