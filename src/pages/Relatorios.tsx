import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  BarChart3, 
  Search, 
  Calendar, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Download,
  Filter,
  Loader2,
  DollarSign
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import KPIs from "./Relatorios/KPIs";
import AnaliseTemporal from "./Relatorios/AnaliseTemporal";
import ComparacaoClientes from "./Relatorios/ComparacaoClientes";
import { useRelatoriosConsolidados } from "@/hooks/useRelatoriosConsolidados";
import { useExportAvaliacao } from "@/hooks/useExportAvaliacao";
import { useExportDiagnostico } from "@/hooks/useExportDiagnostico";
import { useClientes } from "@/hooks/useClientes";

const Relatorios = () => {
  const navigate = useNavigate();
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroCliente, setFiltroCliente] = useState("todos");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { data: clientesData } = useClientes();
  const { data, isLoading } = useRelatoriosConsolidados(filtroCliente === "todos" ? undefined : filtroCliente);
  const { exportarHistoricoCSV } = useExportAvaliacao();
  const { exportarRespostasCSV } = useExportDiagnostico();
  
  const relatorios = data?.relatorios || [];
  const kpis = data?.kpis;
  const clientes = clientesData || [];

  const getTipoIcon = (tipo: string) => {
    if (tipo === 'avaliacao') return "📊";
    if (tipo === 'diagnostico') return "🎯";
    return "📋";
  };

  const getTipoLabel = (tipo: string) => {
    if (tipo === 'avaliacao') return "Avaliação";
    if (tipo === 'diagnostico') return "Diagnóstico";
    return tipo;
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case "up": return <TrendingUp className="w-4 h-4 text-success" />;
      case "down": return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <div className="w-4 h-4 rounded-full bg-muted"></div>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-success";
    if (score >= 6) return "text-warning";
    return "text-destructive";
  };

  const handleDownloadRelatorio = async (relatorio: any) => {
    setLoading(true);
    try {
      if (relatorio.origem === 'avaliacao' && relatorio.avaliacaoId) {
        navigate(`/avaliacoes/${relatorio.avaliacaoId}/relatorio`);
      } else if (relatorio.origem === 'diagnostico' && relatorio.questionarioId) {
        await exportarRespostasCSV(relatorio.questionarioId);
      }
    } catch (error) {
      toast.error("Erro ao acessar relatório.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportarTudo = async () => {
    setLoading(true);
    try {
      const dadosExportacao = relatorios.map(r => ({
        titulo: r.titulo,
        tipo: r.tipo,
        categoria: r.categoria,
        dataGeracao: new Date(r.dataGeracao).toLocaleDateString('pt-BR'),
        participantes: r.participantes,
        taxaParticipacao: r.taxaParticipacao.toFixed(1) + '%',
        score: r.score.toFixed(1),
        alertas: r.alertas,
        status: r.status === 'finalizado' ? 'Finalizado' : 'Em Andamento'
      }));
      
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Título,Tipo,Categoria,Data Geração,Participantes,Taxa Participação,Score,Alertas,Status\n" +
        dadosExportacao.map(r => Object.values(r).join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "relatorios-completo.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Relatórios exportados com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar relatórios.");
    } finally {
      setLoading(false);
    }
  };

  const relatoriosFiltrados = relatorios.filter(relatorio => {
    const filtroTipoOk = filtroTipo === "todos" || relatorio.tipo === filtroTipo;
    const filtroStatusOk = filtroStatus === "todos" || relatorio.status === filtroStatus;
    const buscaOk = busca === "" || relatorio.titulo.toLowerCase().includes(busca.toLowerCase());
    
    return filtroTipoOk && filtroStatusOk && buscaOk;
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Relatórios e Análises</h1>
            <p className="text-muted-foreground">
              Visualize insights e resultados das suas pesquisas de bem-estar
            </p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={handleExportarTudo}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Exportar Tudo</span>
          </Button>
        </div>

        {/* Tabs de Navegação */}
        <Tabs defaultValue="lista" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lista">
              Todos os Relatórios
            </TabsTrigger>
            <TabsTrigger value="kpis">
              KPIs da Consultoria
            </TabsTrigger>
            <TabsTrigger value="temporal">
              Análise Temporal
            </TabsTrigger>
            <TabsTrigger value="comparacao">
              Comparação de Clientes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-6 mt-6">

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Relatórios</p>
                <p className="text-2xl font-bold">{data?.totalRelatorios || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Participantes Total</p>
                <p className="text-2xl font-bold">{kpis?.totalParticipantes || 0}</p>
              </div>
              <Users className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold">{kpis?.scoreMedia.toFixed(1) || '0.0'}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold">{kpis?.alertasAtivos || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar relatórios..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filtroCliente} onValueChange={setFiltroCliente}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Clientes</SelectItem>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="avaliacao">Avaliações</SelectItem>
                <SelectItem value="diagnostico">Diagnósticos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="finalizado">Finalizados</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setBusca("");
              setFiltroCliente("todos");
              setFiltroTipo("todos");
              setFiltroStatus("todos");
            }}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <div className="grid gap-4">
        {relatoriosFiltrados.map((relatorio) => (
          <Card key={relatorio.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getTipoIcon(relatorio.tipo)}</div>
                  <div>
                    <h3 className="text-lg font-semibold">{relatorio.titulo}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Gerado em {new Date(relatorio.dataGeracao).toLocaleDateString('pt-BR')}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{relatorio.participantes} participantes ({relatorio.taxaParticipacao.toFixed(0)}%)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Score */}
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Score</div>
                    <div className={`text-xl font-bold ${getScoreColor(relatorio.score)}`}>
                      {relatorio.score}/10
                    </div>
                  </div>

                  {/* Tendência */}
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Tendência</div>
                    <div className="flex justify-center mt-1">
                      {getTendenciaIcon(relatorio.tendencia)}
                    </div>
                  </div>

                  {/* Alertas */}
                  {relatorio.alertas > 0 && (
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Alertas</div>
                      <Badge variant="destructive" className="mt-1">
                        {relatorio.alertas}
                      </Badge>
                    </div>
                  )}

                  {/* Status e Ações */}
                  <div className="flex items-center space-x-3">
                    <Badge variant={relatorio.status === "finalizado" ? "secondary" : "outline"}>
                      {relatorio.status === "finalizado" ? "Finalizado" : "Em Andamento"}
                    </Badge>
                    
                    <Badge variant="outline">
                      {relatorio.categoria}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadRelatorio(relatorio)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>Ver Relatório</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

        {relatoriosFiltrados.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum relatório encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Não há relatórios que correspondam aos filtros selecionados.
              </p>
              <Button onClick={() => navigate("/avaliacoes")}>
                Ver Avaliações
              </Button>
            </CardContent>
          </Card>
        )}
          </TabsContent>

          {/* Tab: KPIs */}
          <TabsContent value="kpis" className="mt-6">
            <KPIs 
              kpis={kpis} 
              clientes={clientes}
              filtroCliente={filtroCliente}
              onClienteChange={setFiltroCliente}
            />
          </TabsContent>

          {/* Tab: Análise Temporal */}
          <TabsContent value="temporal" className="mt-6">
            <AnaliseTemporal 
              relatorios={relatoriosFiltrados}
              clienteId={filtroCliente}
            />
          </TabsContent>

          {/* Tab: Comparação de Clientes */}
          <TabsContent value="comparacao" className="mt-6">
            <ComparacaoClientes 
              relatorios={relatoriosFiltrados}
              clientes={clientes}
            />
          </TabsContent>
          </Tabs>
        </div>
    </MainLayout>
  );
};

export default Relatorios;