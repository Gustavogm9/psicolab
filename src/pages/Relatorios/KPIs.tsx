import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react";
import { useState } from "react";

interface KPIsProps {
  kpis?: {
    taxaParticipacaoMedia: number;
    scoreMedia: number;
    totalRespostas: number;
    totalParticipantes: number;
    alertasAtivos: number;
    porDimensao: {
      dimensao: string;
      pontuacao: number;
      variacao: number;
      status: 'positivo' | 'negativo' | 'neutro';
      participantes: number;
      alertas: number;
    }[];
    tendenciasTrimestre: {
      periodo: string;
      participacao: number;
      pontuacaoMedia: number;
      riscoAlto: number;
      riscoMedio: number;
      riscoBaixo: number;
    }[];
  };
  clientes?: any[];
  filtroCliente?: string;
  onClienteChange?: (clienteId: string) => void;
}

const KPIs = ({ kpis, clientes = [], filtroCliente = "todos", onClienteChange }: KPIsProps) => {
  const [periodo, setPeriodo] = useState("ultimo_trimestre");

  if (!kpis) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Carregando KPIs...
      </div>
    );
  }

  const kpisGerais = [
    {
      titulo: "Taxa de Participação",
      valor: `${kpis.taxaParticipacaoMedia.toFixed(1)}%`,
      variacao: "+0.0%",
      status: "positivo",
      descricao: "Percentual de colaboradores que participaram das avaliações",
      meta: "85%"
    },
    {
      titulo: "Pontuação Média Geral",
      valor: `${kpis.scoreMedia.toFixed(1)}/10`,
      variacao: "+0.0",
      status: "positivo", 
      descricao: "Média das pontuações em todas as dimensões avaliadas",
      meta: "7.0/10"
    },
    {
      titulo: "Total de Respostas",
      valor: kpis.totalRespostas.toString(),
      variacao: "Total",
      status: "neutro",
      descricao: "Número total de respostas coletadas",
      meta: "-"
    },
    {
      titulo: "Alertas Ativos",
      valor: kpis.alertasAtivos.toString(),
      variacao: "Atual",
      status: kpis.alertasAtivos > 0 ? "negativo" : "positivo",
      descricao: "Número de alertas que requerem atenção",
      meta: "0"
    }
  ];

  const kpisDimensoes = kpis.porDimensao.length > 0 ? kpis.porDimensao : [{
    dimensao: "Sem dados",
    pontuacao: 0,
    variacao: 0,
    status: 'neutro' as const,
    participantes: 0,
    alertas: 0
  }];

  const kpisTendencias = kpis.tendenciasTrimestre.length > 0 ? kpis.tendenciasTrimestre : [
    {
      periodo: "Sem dados",
      participacao: 0,
      pontuacaoMedia: 0,
      riscoAlto: 0,
      riscoMedio: 0,
      riscoBaixo: 0
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "positivo":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "negativo":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "positivo":
        return "text-green-600";
      case "negativo":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">KPIs da Consultoria</h1>
            <p className="text-muted-foreground">
              {onClienteChange ? (
                filtroCliente === "todos" 
                  ? "Visão consolidada de todos os clientes"
                  : `Indicadores do cliente: ${clientes.find(c => c.id === filtroCliente)?.nome || "Selecionado"}`
              ) : (
                "Monitore os principais indicadores de saúde psicossocial"
              )}
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {onClienteChange && (
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Cliente</label>
                  <Select value={filtroCliente} onValueChange={onClienteChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Visão Geral (Todos)</SelectItem>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Período</label>
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ultimo_mes">Último Mês</SelectItem>
                    <SelectItem value="ultimo_trimestre">Último Trimestre</SelectItem>
                    <SelectItem value="ultimo_semestre">Último Semestre</SelectItem>
                    <SelectItem value="ultimo_ano">Último Ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="dimensoes">Por Categoria</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6">
            {/* KPIs Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpisGerais.map((kpi, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {kpi.titulo}
                      </CardTitle>
                      {getStatusIcon(kpi.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{kpi.valor}</div>
                      <div className={`text-sm font-medium ${getStatusColor(kpi.status)}`}>
                        {kpi.variacao}
                      </div>
                      <p className="text-xs text-muted-foreground">{kpi.descricao}</p>
                      <div className="flex items-center gap-1 text-xs">
                        <Target className="h-3 w-3" />
                        <span>Meta: {kpi.meta}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tendências Trimestrais */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução dos Indicadores</CardTitle>
                <CardDescription>
                  Acompanhe a evolução dos principais KPIs ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {kpisTendencias.map((periodo, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{periodo.periodo}</h3>
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          Trimestre
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{periodo.participacao.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">Participação</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{periodo.pontuacaoMedia.toFixed(1)}/10</div>
                          <div className="text-xs text-muted-foreground">Pontuação Média</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{periodo.riscoBaixo.toFixed(0)}%</div>
                          <div className="text-xs text-muted-foreground">Risco Baixo</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">{periodo.riscoAlto.toFixed(0)}%</div>
                          <div className="text-xs text-muted-foreground">Risco Alto</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dimensoes" className="space-y-6">
            {/* KPIs por Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kpisDimensoes.map((dimensao, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{dimensao.dimensao}</CardTitle>
                      {dimensao.alertas > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {dimensao.alertas}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">{dimensao.pontuacao.toFixed(1)}/10</div>
                        <div className={`text-sm font-medium ${getStatusColor(dimensao.status)}`}>
                          {dimensao.variacao > 0 ? '+' : ''}{dimensao.variacao.toFixed(1)}%
                        </div>
                      </div>
                      {getStatusIcon(dimensao.status)}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{dimensao.participantes} participantes</span>
                      </div>
                      {dimensao.alertas === 0 && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Sem alertas</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default KPIs;