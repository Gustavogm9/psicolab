import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip as UITooltip, TooltipContent as UITooltipContent, TooltipProvider as UITooltipProvider, TooltipTrigger as UITooltipTrigger } from "@/components/ui/tooltip";
import { FeatureExplanation } from "@/components/shared/FeatureExplanation";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  CreditCard,
  Download,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Eye,
  FileText,
  Settings,
  RefreshCw,
  Loader2,
  Info,
  X,
  ArrowDownToLine,
  MoreHorizontal,
  XCircle,
  Trash2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useFaturas, useFaturaUpdate, useFaturaDelete } from "@/hooks/useFaturas";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { useMetricasFinanceiras } from "@/hooks/useMetricasFinanceiras";
import { useClientes } from "@/hooks/useClientes";
import { useFaturaSync } from "@/hooks/useFaturaSync";
import { useContratos } from "@/hooks/useContratos";
import { useExportRelatorioFinanceiro } from "@/hooks/useExportRelatorioFinanceiro";
import { useRelatorioAnalitico } from "@/hooks/useRelatorioAnalitico";
import { useAsaasSyncLogs } from "@/hooks/useAsaasSyncLogs";
import { supabase } from "@/integrations/supabase/client";
import { FaturaFormDialog } from "./Financeiro/FaturaFormDialog";
import { FaturaDetalhesDialog } from "./Financeiro/FaturaDetalhesDialog";
import { ContratosManager } from "./Financeiro/ContratosManager";
import { formatDate, isToday, parseISO, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Financeiro = () => {
  const navigate = useNavigate();
  const { syncAll, isSyncing, syncResult } = useFaturaSync();
  const [showSyncBanner, setShowSyncBanner] = useState(() => {
    return localStorage.getItem('sync_bidirecional_dismissed') !== 'true';
  });
  const [showSyncResult, setShowSyncResult] = useState(false);

  useEffect(() => {
    if (syncResult) {
      setShowSyncResult(true);
      const timer = setTimeout(() => setShowSyncResult(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [syncResult]);
  const [periodo, setPeriodo] = useState("mes_atual");
  const [clienteFiltro, setClienteFiltro] = useState<string | undefined>(undefined);
  const [statusFiltro, setStatusFiltro] = useState<string | undefined>(undefined);
  const [isNovaFaturaOpen, setIsNovaFaturaOpen] = useState(false);
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [selectedFatura, setSelectedFatura] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [confirmPagoTarget, setConfirmPagoTarget] = useState<any>(null);
  const [isCancellingQuick, setIsCancellingQuick] = useState<string | null>(null);
  const faturaUpdateMutation = useFaturaUpdate();
  const faturaDeleteMutation = useFaturaDelete();
  
  // Calcular datas baseadas no período
  const getDateRange = () => {
    const hoje = new Date();
    let dataInicio: string | undefined;
    let dataFim: string | undefined;
    
    switch (periodo) {
      case "mes_atual":
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case "ultimo_trimestre":
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1).toISOString().split('T')[0];
        dataFim = hoje.toISOString().split('T')[0];
        break;
      case "ultimo_semestre":
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 6, 1).toISOString().split('T')[0];
        dataFim = hoje.toISOString().split('T')[0];
        break;
      case "ultimo_ano":
        dataInicio = new Date(hoje.getFullYear() - 1, hoje.getMonth(), 1).toISOString().split('T')[0];
        dataFim = hoje.toISOString().split('T')[0];
        break;
    }
    
    return { dataInicio, dataFim };
  };
  
  const { dataInicio, dataFim } = getDateRange();
  
  // Buscar dados reais
  const { faturas: faturasRaw, isLoading: faturasLoading } = useFaturas({ 
    data_inicio: dataInicio, 
    data_fim: dataFim,
    cliente_id: clienteFiltro
  });
  // Filtro de status local (não afeta query)
  const faturas = statusFiltro 
    ? faturasRaw?.filter(f => f.status === statusFiltro) 
    : faturasRaw;
  const { metricas, isLoading: metricasLoading } = useMetricasFinanceiras({ data_inicio: dataInicio, data_fim: dataFim });
  const { data: clientes } = useClientes();
  const { contratos } = useContratos();
  const { exportarExcel, exportarPDF } = useExportRelatorioFinanceiro();
  const { receitaMensal, topClientes, distribuicaoStatus, isLoading: relatorioLoading } = useRelatorioAnalitico();
  const { stats: syncStats } = useAsaasSyncLogs(5);

  // Handle quick cancel with Asaas sync
  const handleQuickCancelar = async (fatura: any) => {
    if (fatura.asaas_payment_id) {
      setIsCancellingQuick(fatura.id);
      try {
        const { error } = await supabase.functions.invoke('asaas-cancel-payment', {
          body: { fatura_id: fatura.id }
        });
        if (error) throw error;
        toast.success('Fatura cancelada no Asaas e no sistema!');
      } catch (error: any) {
        toast.error(error.message || 'Erro ao cancelar fatura no Asaas');
      } finally {
        setIsCancellingQuick(null);
      }
    } else {
      faturaUpdateMutation.mutate({ id: fatura.id, status: 'cancelado' });
    }
  };

  // Handle quick mark as paid (with confirmation + Asaas sync)
  const [isConfirmingPago, setIsConfirmingPago] = useState(false);
  const handleConfirmPago = async () => {
    if (!confirmPagoTarget) return;
    
    if (confirmPagoTarget.asaas_payment_id) {
      // Sync with Asaas first
      setIsConfirmingPago(true);
      try {
        const { error } = await supabase.functions.invoke('asaas-confirm-payment', {
          body: { fatura_id: confirmPagoTarget.id }
        });
        if (error) throw error;
        toast.success('Pagamento confirmado no Asaas e no sistema!');
        setConfirmPagoTarget(null);
      } catch (error: any) {
        toast.error(error.message || 'Erro ao confirmar pagamento no Asaas');
      } finally {
        setIsConfirmingPago(false);
      }
    } else {
      faturaUpdateMutation.mutate(
        { id: confirmPagoTarget.id, status: 'pago', data_pagamento: new Date().toISOString().split('T')[0] },
        { onSuccess: () => setConfirmPagoTarget(null) }
      );
    }
  };

  // Auto-update overdue invoices on page load (with alerts)
  useEffect(() => {
    supabase.rpc('atualizar_faturas_vencidas_com_alertas').then(({ error }) => {
      if (error) console.error('Erro ao atualizar faturas vencidas:', error);
    });
  }, []);

  // Transformar métricas reais para o formato do UI
  const metricasCards = [
    {
      titulo: "Receita Total",
      valor: `R$ ${(metricas?.receita_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      variacao: "+0%",
      status: "positivo",
      descricao: "Receita confirmada no período",
      icon: DollarSign
    },
    {
      titulo: "Faturas Pendentes",
      valor: metricas?.faturas_pendentes?.toString() || "0",
      variacao: `R$ ${(metricas?.receita_pendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      status: "neutro",
      descricao: "Aguardando pagamento",
      icon: Clock
    },
    {
      titulo: "Ticket Médio",
      valor: `R$ ${(metricas?.ticket_medio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      variacao: "+0%",
      status: "positivo",
      descricao: "Valor médio por fatura",
      icon: Target
    },
    {
      titulo: "Taxa de Inadimplência",
      valor: `${(metricas?.taxa_inadimplencia || 0).toFixed(1)}%`,
      variacao: `${metricas?.faturas_atrasadas || 0} atrasadas`,
      status: (metricas?.taxa_inadimplencia || 0) > 10 ? "negativo" : "positivo",
      descricao: "Faturas vencidas",
      icon: AlertCircle
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "em_dia":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "pendente":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "atrasado":
        return "bg-red-500/10 text-red-700 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pago":
        return "Pago";
      case "em_dia":
        return "Em Dia";
      case "pendente":
        return "Pendente";
      case "atrasado":
        return "Atrasado";
      default:
        return "Desconhecido";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "positivo":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "negativo":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleVerDetalhes = (fatura: any) => {
    setSelectedFatura(fatura);
    setIsDetalhesOpen(true);
  };

  const handleExportar = (formato: 'excel' | 'pdf') => {
    if (!faturas || !metricas) {
      toast.error('Não há dados para exportar');
      return;
    }

    const dados = {
      periodo: periodo === 'mes_atual' ? 'Mês Atual' :
               periodo === 'ultimo_trimestre' ? 'Último Trimestre' :
               periodo === 'ultimo_semestre' ? 'Último Semestre' : 'Último Ano',
      dataInicio,
      dataFim,
      metricas,
      faturas: faturas as any[],
    };

    if (formato === 'excel') {
      exportarExcel(dados);
    } else {
      exportarPDF(dados);
    }
  };

  // Calcular próximas ações do banco de dados
  const proximasAcoes = [
    {
      tipo: 'Faturas Atrasadas',
      quantidade: metricas?.faturas_atrasadas || 0,
      descricao: 'Faturas vencidas que precisam de atenção'
    },
    {
      tipo: 'Contratos Ativos',
      quantidade: contratos?.filter(c => c.status === 'ativo').length || 0,
      descricao: 'Contratos gerando faturas automaticamente'
    },
    {
      tipo: 'Pagamentos Hoje',
      quantidade: faturas?.filter(f => f.status === 'pago' && f.data_pagamento && isToday(new Date(f.data_pagamento))).length || 0,
      descricao: 'Pagamentos confirmados hoje'
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Gestão Financeira</h1>
            <p className="text-muted-foreground">
              Acompanhe receitas, clientes e métricas financeiras
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => navigate('/financeiro/asaas')}>
              <Settings className="h-4 w-4" />
              Configurar Asaas
            </Button>
            <div className="flex flex-col items-end gap-0.5">
              <UITooltipProvider>
                <UITooltip>
                  <UITooltipTrigger asChild>
                    <Button variant="outline" className="gap-2" onClick={() => syncAll()} disabled={isSyncing}>
                      {isSyncing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Sincronizar
                    </Button>
                  </UITooltipTrigger>
                  <UITooltipContent side="bottom" className="max-w-xs text-center">
                    <p>Atualiza status de faturas existentes e importa cobranças criadas diretamente no Asaas</p>
                  </UITooltipContent>
                </UITooltip>
              </UITooltipProvider>
              {syncStats?.ultimaSync && (
                <span className="text-[10px] text-muted-foreground">
                  Última sync: {formatDistanceToNow(new Date(syncStats.ultimaSync.timestamp), { addSuffix: true, locale: ptBR })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Banner sincronização bidirecional */}
        {showSyncBanner && (
          <Alert className="border-blue-200 bg-blue-500/5">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <span className="text-sm">
                <strong className="text-blue-700">Sincronização bidirecional ativa</strong> — Cobranças criadas no Asaas são importadas automaticamente ao sincronizar. Você pode criar cobranças em qualquer um dos dois sistemas.
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 h-7 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setShowSyncBanner(false);
                  localStorage.setItem('sync_bidirecional_dismissed', 'true');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Resumo pós-sync */}
        {showSyncResult && syncResult && (
          <div className="flex items-center gap-4 rounded-lg border bg-muted/50 px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2">
            {(syncResult.atualizadas || 0) > 0 && (
              <span className="flex items-center gap-1.5 text-green-700">
                <CheckCircle className="h-4 w-4" />
                {syncResult.atualizadas} atualizada{syncResult.atualizadas !== 1 ? 's' : ''}
              </span>
            )}
            {(syncResult.importadas || 0) > 0 && (
              <span className="flex items-center gap-1.5 text-blue-700">
                <ArrowDownToLine className="h-4 w-4" />
                {syncResult.importadas} importada{syncResult.importadas !== 1 ? 's' : ''} do Asaas
              </span>
            )}
            {(syncResult.erros || 0) > 0 && (
              <span className="flex items-center gap-1.5 text-red-700">
                <AlertCircle className="h-4 w-4" />
                {syncResult.erros} erro{syncResult.erros !== 1 ? 's' : ''}
              </span>
            )}
            {(syncResult.atualizadas || 0) === 0 && (syncResult.importadas || 0) === 0 && (syncResult.erros || 0) === 0 && (
              <span className="text-muted-foreground">Tudo já estava atualizado ({syncResult.total_faturas} verificadas)</span>
            )}
          </div>
        )}

        {/* Explicação Faturas vs Contratos */}
        <FeatureExplanation type="financeiro" />

        {/* Período Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Período:</label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes_atual">Mês Atual</SelectItem>
                  <SelectItem value="ultimo_trimestre">Último Trimestre</SelectItem>
                  <SelectItem value="ultimo_semestre">Último Semestre</SelectItem>
                  <SelectItem value="ultimo_ano">Último Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="visao-geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="faturas">Faturas</TabsTrigger>
            <TabsTrigger value="contratos">Contratos</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="space-y-6">
            {/* Métricas Principais */}
            {(faturasLoading || metricasLoading) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-32 mb-2" />
                      <Skeleton className="h-3 w-40" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricasCards.map((metrica, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {metrica.titulo}
                        </CardTitle>
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <metrica.icon className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">{metrica.valor}</div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(metrica.status)}
                          <span className={`text-sm font-medium ${
                            metrica.status === "positivo" ? "text-green-600" : "text-red-600"
                          }`}>
                            {metrica.variacao}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{metrica.descricao}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Alerta de Clientes sem CPF/CNPJ */}
            {clientes && clientes.filter(c => !c.cpf_cnpj).length > 0 && (
              <Card className="border-yellow-200 bg-yellow-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="h-5 w-5" />
                    Atenção: Clientes sem CPF/CNPJ
                  </CardTitle>
                  <CardDescription>
                    Alguns clientes não possuem CPF/CNPJ cadastrado e não podem receber faturas via Asaas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                      <div>
                        <p className="text-2xl font-bold text-yellow-700">
                          {clientes.filter(c => !c.cpf_cnpj).length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {clientes.filter(c => !c.cpf_cnpj).length === 1 
                            ? 'cliente sem CPF/CNPJ' 
                            : 'clientes sem CPF/CNPJ'}
                        </p>
                      </div>
                      <Button onClick={() => navigate('/clientes')} variant="outline" size="sm" className="gap-2">
                        <Users className="h-4 w-4" />
                        Ver Clientes
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Por que isso importa?</strong> Sem CPF/CNPJ, você não consegue:
                      <br />• Emitir cobranças automáticas via Asaas
                      <br />• Gerar boletos ou PIX para pagamento
                      <br />• Sincronizar faturas com o sistema de pagamento
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Próximas Ações - Movido da aba Relatórios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Próximas Ações
                </CardTitle>
                <CardDescription>
                  Ações financeiras que precisam de sua atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      tipo: 'Faturas Atrasadas',
                      quantidade: metricas?.faturas_atrasadas || 0,
                      descricao: 'Precisam de atenção',
                      icon: AlertCircle,
                      color: 'text-red-600 bg-red-500/10'
                    },
                    {
                      tipo: 'Contratos Ativos',
                      quantidade: contratos?.filter(c => c.status === 'ativo').length || 0,
                      descricao: 'Gerando faturas',
                      icon: FileText,
                      color: 'text-blue-600 bg-blue-500/10'
                    },
                    {
                      tipo: 'Pagamentos Hoje',
                      quantidade: faturas?.filter(f => f.status === 'pago' && f.data_pagamento && isToday(new Date(f.data_pagamento))).length || 0,
                      descricao: 'Confirmados hoje',
                      icon: CheckCircle,
                      color: 'text-green-600 bg-green-500/10'
                    }
                  ].map((acao, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground mb-1">{acao.tipo}</p>
                            <p className="text-2xl font-bold mb-1">{acao.quantidade}</p>
                            <p className="text-xs text-muted-foreground">{acao.descricao}</p>
                          </div>
                          <div className={`p-2 rounded-lg ${acao.color}`}>
                            <acao.icon className="h-5 w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resumo Rápido */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Últimas Faturas</CardTitle>
                  <CardDescription>Faturas criadas recentemente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faturas?.slice(0, 5).map((fatura) => (
                      <div key={fatura.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">{fatura.cliente?.nome || 'Cliente'}</p>
                            <p className="text-xs text-muted-foreground">{fatura.numero_fatura}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">R$ {fatura.valor.toFixed(2)}</div>
                          <Badge className={`text-xs ${getStatusColor(fatura.status)}`}>
                            {getStatusLabel(fatura.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {(!faturas || faturas.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma fatura encontrada
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status dos Pagamentos</CardTitle>
                  <CardDescription>Situação atual dos recebimentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Pagas</span>
                      </div>
                      <span className="font-bold">{metricas?.faturas_pagas || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span>Pendentes</span>
                      </div>
                      <span className="font-bold">{metricas?.faturas_pendentes || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span>Atrasadas</span>
                      </div>
                      <span className="font-bold">{metricas?.faturas_atrasadas || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="faturas" className="space-y-6">
            {/* Header da Aba */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Faturas</CardTitle>
                    <CardDescription className="mt-1">
                      Cobranças pontuais criadas manualmente ou geradas automaticamente por contratos
                    </CardDescription>
                  </div>
                  <UITooltipProvider>
                    <UITooltip>
                      <UITooltipTrigger asChild>
                        <Button onClick={() => setIsNovaFaturaOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Nova Fatura
                        </Button>
                      </UITooltipTrigger>
                      <UITooltipContent>
                        <p>Criar fatura pontual para serviço avulso</p>
                      </UITooltipContent>
                    </UITooltip>
                  </UITooltipProvider>
                </div>
              </CardHeader>
            </Card>

            {/* Filtros */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Cliente:</label>
                    <Select value={clienteFiltro} onValueChange={(value) => setClienteFiltro(value === "all" ? undefined : value)}>
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder="Todos os clientes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os clientes</SelectItem>
                        {clientes?.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Status:</label>
                    <Select value={statusFiltro || "all"} onValueChange={(value) => setStatusFiltro(value === "all" ? undefined : value)}>
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pendente">
                          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-yellow-600" /> Pendente</span>
                        </SelectItem>
                        <SelectItem value="pago">
                          <span className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-green-600" /> Pago</span>
                        </SelectItem>
                        <SelectItem value="atrasado">
                          <span className="flex items-center gap-1.5"><AlertCircle className="h-3 w-3 text-red-600" /> Atrasado</span>
                        </SelectItem>
                        <SelectItem value="cancelado">
                          <span className="flex items-center gap-1.5"><XCircle className="h-3 w-3 text-gray-500" /> Cancelado</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(clienteFiltro || statusFiltro) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setClienteFiltro(undefined); setStatusFiltro(undefined); }}
                      className="gap-1"
                    >
                      Limpar filtros
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lista de Faturas */}
            <div className="space-y-4">
              {faturasLoading ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">Carregando faturas...</p>
                  </CardContent>
                </Card>
              ) : faturas && faturas.length > 0 ? (
                faturas.map((fatura) => (
                  <Card key={fatura.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{fatura.numero_fatura}</h3>
                            <Badge className={getStatusColor(fatura.status)}>
                              {getStatusLabel(fatura.status)}
                            </Badge>
                            <UITooltipProvider>
                              <UITooltip>
                                <UITooltipTrigger asChild>
                                  <Badge variant={fatura.contrato_id ? "secondary" : "outline"} className="text-xs cursor-help">
                                    {fatura.contrato_id ? (
                                      <><Calendar className="h-3 w-3 mr-1" /> Contrato</>
                                    ) : (
                                      <><FileText className="h-3 w-3 mr-1" /> Avulsa</>
                                    )}
                                  </Badge>
                                </UITooltipTrigger>
                                <UITooltipContent>
                                  <p className="text-xs max-w-[200px]">
                                    {fatura.contrato_id 
                                      ? 'Fatura gerada automaticamente a partir de um contrato recorrente' 
                                      : 'Fatura criada manualmente, sem vínculo a contrato recorrente'}
                                  </p>
                                </UITooltipContent>
                              </UITooltip>
                            </UITooltipProvider>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{fatura.cliente?.nome || 'Cliente'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>R$ {fatura.valor.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Venc: {formatDate(parseISO(fatura.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}</span>
                            </div>
                          </div>

                          <div className="mt-2 text-sm text-muted-foreground">
                            {fatura.descricao}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0 items-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVerDetalhes(fatura)}
                            className="gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Ver Detalhes
                          </Button>
                          {fatura.status !== 'pago' && fatura.status !== 'cancelado' ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">
                                  <MoreHorizontal className="h-3 w-3" />
                                  Ações
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setConfirmPagoTarget(fatura)}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Marcar como Pago
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  disabled={isCancellingQuick === fatura.id}
                                  onClick={() => handleQuickCancelar(fatura)}
                                >
                                  {isCancellingQuick === fatura.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-2 text-yellow-600" />
                                  )}
                                  {fatura.asaas_payment_id ? 'Cancelar (Asaas + Sistema)' : 'Cancelar Fatura'}
                                </DropdownMenuItem>
                                {!fatura.asaas_payment_id && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => setDeleteTarget(fatura)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Excluir Fatura
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <UITooltipProvider>
                              <UITooltip>
                                <UITooltipTrigger asChild>
                                  <div className="flex items-center justify-center w-8 h-8">
                                    {fatura.status === 'pago' ? (
                                      <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <XCircle className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </div>
                                </UITooltipTrigger>
                                <UITooltipContent>
                                  <p className="text-xs">
                                    {fatura.status === 'pago' ? 'Fatura paga — nenhuma ação necessária' : 'Fatura cancelada'}
                                  </p>
                                </UITooltipContent>
                              </UITooltip>
                            </UITooltipProvider>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma fatura encontrada</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {clienteFiltro 
                        ? "Este cliente não possui faturas no período selecionado"
                        : "Crie sua primeira fatura manual ou configure um contrato recorrente"
                      }
                    </p>
                    {!clienteFiltro && (
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => setIsNovaFaturaOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Nova Fatura Manual
                        </Button>
                        <Button variant="outline" onClick={() => {
                          const contratosTab = document.querySelector('[value="contratos"]') as HTMLElement;
                          contratosTab?.click();
                        }}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Configurar Contrato
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tab Contratos */}
          <TabsContent value="contratos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contratos Recorrentes</CardTitle>
                <CardDescription>
                  Configure mensalidades e cobranças automáticas. As faturas são geradas automaticamente todo mês.
                </CardDescription>
              </CardHeader>
            </Card>
            <ContratosManager />
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-6">
            {/* Gráfico: Evolução de Receita */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Evolução de Receita
                </CardTitle>
                <CardDescription>
                  Receita mensal dos últimos 6 meses (faturas pagas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatorioLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={receitaMensal}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="mes" 
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="receita" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Receita"
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico: Distribuição por Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Status</CardTitle>
                  <CardDescription>
                    Quantidade de faturas por situação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {relatorioLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={distribuicaoStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, quantidade }) => `${status}: ${quantidade}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="quantidade"
                        >
                          {distribuicaoStatus?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Tabela: Top 10 Clientes */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Clientes por Receita</CardTitle>
                  <CardDescription>
                    Clientes com maior faturamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {relatorioLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {topClientes?.map((cliente, index) => (
                        <div key={cliente.cliente_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{cliente.cliente_nome}</p>
                              <p className="text-xs text-muted-foreground">
                                {cliente.faturas_pagas} pagas · {cliente.faturas_atrasadas} atrasadas
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">
                              R$ {cliente.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            {cliente.taxa_inadimplencia > 0 && (
                              <p className="text-xs text-red-600">
                                {cliente.taxa_inadimplencia.toFixed(0)}% inadimplência
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!topClientes || topClientes.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum cliente com receita
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Card de Exportação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exportar Relatório Completo
                </CardTitle>
                <CardDescription>
                  Baixe um relatório financeiro completo do período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Receita Total</p>
                    <p className="text-xl font-bold">
                      R$ {(metricas?.receita_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Receita Pendente</p>
                    <p className="text-xl font-bold text-yellow-600">
                      R$ {(metricas?.receita_pendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Receita Atrasada</p>
                    <p className="text-xl font-bold text-red-600">
                      R$ {(metricas?.receita_atrasada || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total de Faturas</p>
                    <p className="text-xl font-bold">{metricas?.total_faturas || 0}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => handleExportar('excel')} className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Excel
                  </Button>
                  <Button onClick={() => handleExportar('pdf')} variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <FaturaFormDialog open={isNovaFaturaOpen} onOpenChange={setIsNovaFaturaOpen} />
      <FaturaDetalhesDialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen} fatura={selectedFatura} />
      <DeleteConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir Fatura"
        description={deleteTarget ? `Tem certeza que deseja excluir a fatura ${deleteTarget.numero_fatura} de R$ ${deleteTarget.valor?.toFixed(2)}?` : ''}
        warningItems={[
          "A fatura será removida permanentemente do sistema",
          "Dados financeiros e relatórios serão afetados",
        ]}
        onConfirm={() => {
          if (deleteTarget) {
            faturaDeleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null)
            });
          }
        }}
        isPending={faturaDeleteMutation.isPending}
      />
      {/* Confirmação Marcar como Pago */}
      <DeleteConfirmationDialog
        open={!!confirmPagoTarget}
        onOpenChange={(open) => !open && setConfirmPagoTarget(null)}
        title="Confirmar Pagamento"
        description={confirmPagoTarget ? `Marcar a fatura ${confirmPagoTarget.numero_fatura} (R$ ${confirmPagoTarget.valor?.toFixed(2)}) como paga?` : ''}
        warningItems={
          confirmPagoTarget?.asaas_payment_id 
            ? ["O status será atualizado também no Asaas"] 
            : ["O status será alterado para 'Pago' com a data de hoje"]
        }
        onConfirm={handleConfirmPago}
        isPending={faturaUpdateMutation.isPending}
      />
    </MainLayout>
  );
};

export default Financeiro;