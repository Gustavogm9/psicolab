import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Building, Users, Award, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ComparacaoClientesProps {
  relatorios: any[];
  clientes: any[];
}

const ComparacaoClientes = ({ relatorios, clientes }: ComparacaoClientesProps) => {
  // Agrupar dados por cliente
  const dadosComparacao = useMemo(() => {
    const grupos: { [key: string]: any } = {};
    
    relatorios.forEach(rel => {
      if (!rel.cliente_id) return;
      
      if (!grupos[rel.cliente_id]) {
        const cliente = clientes.find(c => c.id === rel.cliente_id);
        grupos[rel.cliente_id] = {
          id: rel.cliente_id,
          nome: cliente?.nome || 'Cliente',
          setor: cliente?.setor || 'N/A',
          scores: [],
          participacoes: [],
          totalRelatorios: 0,
          totalParticipantes: 0,
          alertasTotal: 0
        };
      }
      
      grupos[rel.cliente_id].totalRelatorios++;
      grupos[rel.cliente_id].totalParticipantes += rel.total_participantes || 0;
      grupos[rel.cliente_id].alertasTotal += rel.alertas_count || 0;
      
      if (rel.score_geral > 0) {
        grupos[rel.cliente_id].scores.push(rel.score_geral);
      }
      
      if (rel.taxa_participacao > 0) {
        grupos[rel.cliente_id].participacoes.push(rel.taxa_participacao);
      }
    });

    // Calcular médias e preparar dados
    const dadosGrafico = Object.values(grupos).map((grupo: any) => ({
      ...grupo,
      scoreMedia: grupo.scores.length > 0 
        ? grupo.scores.reduce((a: number, b: number) => a + b, 0) / grupo.scores.length 
        : 0,
      participacaoMedia: grupo.participacoes.length > 0 
        ? grupo.participacoes.reduce((a: number, b: number) => a + b, 0) / grupo.participacoes.length 
        : 0,
      alertasMedia: grupo.totalRelatorios > 0 
        ? grupo.alertasTotal / grupo.totalRelatorios 
        : 0
    }));

    // Ordenar por score médio (decrescente)
    return dadosGrafico.sort((a, b) => b.scoreMedia - a.scoreMedia);
  }, [relatorios, clientes]);

  // Calcular médias gerais
  const mediasGerais = useMemo(() => {
    if (dadosComparacao.length === 0) {
      return { score: 0, participacao: 0 };
    }

    const scoreTotal = dadosComparacao.reduce((acc, c) => acc + c.scoreMedia, 0);
    const participacaoTotal = dadosComparacao.reduce((acc, c) => acc + c.participacaoMedia, 0);

    return {
      score: scoreTotal / dadosComparacao.length,
      participacao: participacaoTotal / dadosComparacao.length
    };
  }, [dadosComparacao]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Bom</Badge>;
    return <Badge className="bg-red-100 text-red-800">Atenção</Badge>;
  };

  if (dadosComparacao.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Não há dados de clientes para comparação</p>
            <p className="text-sm mt-2">Realize avaliações em diferentes clientes para ver a comparação</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Avaliados</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dadosComparacao.length}</div>
            <p className="text-xs text-muted-foreground">
              {dadosComparacao.reduce((acc, c) => acc + c.totalRelatorios, 0)} relatórios totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio Geral</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(mediasGerais.score)}`}>
              {mediasGerais.score.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Entre todos os clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participação Média</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediasGerais.participacao.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Entre todos os clientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Comparativo de Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Performance por Cliente</CardTitle>
          <CardDescription>Scores médios de cada cliente ordenados do maior para o menor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosComparacao} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis 
                  dataKey="nome" 
                  type="category" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'scoreMedia') return [value.toFixed(1), 'Score'];
                    if (name === 'participacaoMedia') return [value.toFixed(1) + '%', 'Participação'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="scoreMedia" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                  name="Score Médio"
                />
                <Bar 
                  dataKey="participacaoMedia" 
                  fill="hsl(var(--chart-2))" 
                  radius={[0, 4, 4, 0]}
                  name="Participação (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Ranking Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking Detalhado de Clientes</CardTitle>
          <CardDescription>Performance completa de cada cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dadosComparacao.map((cliente, index) => (
              <div 
                key={cliente.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{cliente.nome}</h3>
                      {getScoreBadge(cliente.scoreMedia)}
                    </div>
                    
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{cliente.setor}</span>
                      <span>•</span>
                      <span>{cliente.totalRelatorios} relatórios</span>
                      <span>•</span>
                      <span>{cliente.totalParticipantes} participantes</span>
                    </div>

                    {cliente.alertasTotal > 0 && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{cliente.alertasTotal} alertas identificados</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-8 text-right">
                  <div>
                    <p className={`text-2xl font-bold ${getScoreColor(cliente.scoreMedia)}`}>
                      {cliente.scoreMedia.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Score</p>
                    {cliente.scoreMedia >= mediasGerais.score && (
                      <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        Acima da média
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-2xl font-bold">{cliente.participacaoMedia.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Participação</p>
                    {cliente.participacaoMedia >= mediasGerais.participacao && (
                      <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        Acima da média
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights de Comparação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dadosComparacao[0] && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                <p className="text-sm">
                  <span className="font-semibold">{dadosComparacao[0].nome}</span> lidera com score de{' '}
                  <span className="font-semibold">{dadosComparacao[0].scoreMedia.toFixed(1)}</span>
                </p>
              </div>
            )}
            
            {dadosComparacao.filter(c => c.scoreMedia < 60).length > 0 && (
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                <p className="text-sm">
                  <span className="font-semibold">{dadosComparacao.filter(c => c.scoreMedia < 60).length}</span>{' '}
                  {dadosComparacao.filter(c => c.scoreMedia < 60).length === 1 ? 'cliente necessita' : 'clientes necessitam'} de atenção especial
                </p>
              </div>
            )}

            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
              <p className="text-sm">
                Taxa média de participação geral:{' '}
                <span className="font-semibold">{mediasGerais.participacao.toFixed(1)}%</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparacaoClientes;
