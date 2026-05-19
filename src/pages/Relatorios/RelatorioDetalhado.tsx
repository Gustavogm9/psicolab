import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRelatorioDetalhes } from "@/hooks/useRelatorioDetalhes";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Users,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  Loader2
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

const RelatorioDetalhado = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const id = searchParams.get("id");
  const tipo = (searchParams.get("tipo") || 'avaliacao') as 'avaliacao' | 'diagnostico';

  const { data: relatorio, isLoading, error } = useRelatorioDetalhes(id || undefined, tipo);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !relatorio) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg text-muted-foreground">Erro ao carregar relatório</p>
          <Button onClick={() => navigate('/relatorios')}>
            Voltar para Relatórios
          </Button>
        </div>
      </MainLayout>
    );
  }

  const relatorioData = {
    titulo: relatorio.titulo,
    categoria: relatorio.categoria,
    dataGeracao: relatorio.dataGeracao,
    totalParticipantes: relatorio.totalParticipantes,
    totalRespostas: relatorio.totalRespostas,
    taxaParticipacao: relatorio.taxaParticipacao,
    scoreGeral: relatorio.scoreGeral,
    tendencia: relatorio.tendencia,
    variacao: relatorio.variacao || 0,
  };

  const departamentos = relatorio.departamentos || [];
  const insights = relatorio.insights;
  const recomendacoes = relatorio.recomendacoes;

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-success";
    if (score >= 6) return "text-warning";
    return "text-destructive";
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "alta": return "bg-destructive text-white";
      case "media": return "bg-warning text-white";
      case "baixa": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getInsightIcon = (tipo: string) => {
    switch (tipo) {
      case "alerta": return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "destaque": return <CheckCircle className="w-5 h-5 text-success" />;
      case "observacao": return <Info className="w-5 h-5 text-primary" />;
      default: return <Lightbulb className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/relatorios")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
          
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <span>{relatorioData.titulo}</span>
            </h1>
            <p className="text-muted-foreground">
              {relatorioData.categoria} • Gerado em {format(new Date(relatorioData.dataGeracao), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar PDF</span>
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className={`text-3xl font-bold ${getScoreColor(relatorioData.scoreGeral)}`}>
              {relatorioData.scoreGeral.toFixed(1)}/10
            </div>
            <p className="text-sm text-muted-foreground">Score Geral</p>
            {relatorioData.variacao !== 0 && (
              <div className="flex items-center justify-center mt-2">
                {relatorioData.tendencia === 'up' ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-xs text-success ml-1">+{relatorioData.variacao.toFixed(1)}%</span>
                  </>
                ) : relatorioData.tendencia === 'down' ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-destructive" />
                    <span className="text-xs text-destructive ml-1">{relatorioData.variacao.toFixed(1)}%</span>
                  </>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{relatorioData.totalRespostas}</div>
            <p className="text-sm text-muted-foreground">Respostas</p>
            <p className="text-xs text-muted-foreground">
              {relatorioData.taxaParticipacao.toFixed(0)}% de participação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{relatorioData.totalParticipantes}</div>
            <p className="text-sm text-muted-foreground">Total Possível</p>
            <p className="text-xs text-muted-foreground">Participantes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{relatorio.scoresPorCategoria.length}</div>
            <p className="text-sm text-muted-foreground">Categorias</p>
            <p className="text-xs text-muted-foreground">Avaliadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{relatorio.questoes.length}</div>
            <p className="text-sm text-muted-foreground">Questões</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principal */}
      <Tabs defaultValue="visao-geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="acoes">Recomendações</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scores por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Scores por Categoria</CardTitle>
                <CardDescription>Desempenho em cada dimensão avaliada</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatorio.scoresPorCategoria.map((cat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{cat.categoria}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-muted rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              cat.score >= 8 ? 'bg-success' : cat.score >= 6 ? 'bg-warning' : 'bg-destructive'
                            }`}
                            style={{ width: `${cat.porcentagem}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold w-12 ${getScoreColor(cat.score)}`}>
                          {cat.score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Respostas */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição das Respostas</CardTitle>
                <CardDescription>Classificação por faixa de score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatorio.distribuicaoRespostas.map((dist, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{dist.faixa}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-muted rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              dist.faixa.includes('Excelente') ? 'bg-success' :
                              dist.faixa.includes('Bom') ? 'bg-primary' :
                              dist.faixa.includes('Regular') ? 'bg-warning' :
                              'bg-destructive'
                            }`}
                            style={{ width: `${dist.porcentagem}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-16">
                          {dist.quantidade} ({dist.porcentagem.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-4">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {getInsightIcon(insight.tipo)}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{insight.titulo}</h3>
                      <p className="text-muted-foreground mb-3">{insight.descricao}</p>
                      
                      <Badge variant={
                        insight.tipo === "alerta" ? "destructive" : 
                        insight.tipo === "destaque" ? "default" : 
                        "outline"
                      }>
                        {insight.tipo.charAt(0).toUpperCase() + insight.tipo.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="acoes" className="space-y-6">
          <div className="grid gap-4">
            {recomendacoes.map((rec, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Target className="w-5 h-5 text-primary mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{rec.titulo}</h3>
                          <Badge className={getPrioridadeColor(rec.prioridade)}>
                            {rec.prioridade.charAt(0).toUpperCase() + rec.prioridade.slice(1)}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{rec.descricao}</p>
                        
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span className="font-medium">Categoria:</span>
                          <Badge variant="outline">{rec.categoria}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </MainLayout>
  );
};

export default RelatorioDetalhado;