import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AnaliseTemoralProps {
  relatorios: any[];
  clienteId: string;
}

const AnaliseTemporal = ({ relatorios, clienteId }: AnaliseTemoralProps) => {
  // Agrupar relatórios por mês
  const dadosTemporais = useMemo(() => {
    const relatoriosFiltrados = clienteId 
      ? relatorios.filter(r => r.cliente_id === clienteId)
      : relatorios;

    // Agrupar por mês
    const grupos: { [key: string]: any[] } = {};
    
    relatoriosFiltrados.forEach(rel => {
      const data = parseISO(rel.data_geracao);
      const mesAno = format(data, 'yyyy-MM');
      
      if (!grupos[mesAno]) {
        grupos[mesAno] = [];
      }
      grupos[mesAno].push(rel);
    });

    // Calcular médias por mês
    const dadosGrafico = Object.entries(grupos)
      .map(([mesAno, rels]) => {
        const scores = rels.map(r => r.score_geral || 0).filter(s => s > 0);
        const participacoes = rels.map(r => r.taxa_participacao || 0).filter(p => p > 0);
        
        return {
          mes: format(parseISO(mesAno + '-01'), 'MMM/yy', { locale: ptBR }),
          mesCompleto: format(parseISO(mesAno + '-01'), 'MMMM yyyy', { locale: ptBR }),
          scoreMedia: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
          participacaoMedia: participacoes.length > 0 ? participacoes.reduce((a, b) => a + b, 0) / participacoes.length : 0,
          totalRelatorios: rels.length,
          totalParticipantes: rels.reduce((acc, r) => acc + (r.total_participantes || 0), 0),
          alertas: rels.reduce((acc, r) => acc + (r.alertas_count || 0), 0)
        };
      })
      .sort((a, b) => a.mes.localeCompare(b.mes));

    return dadosGrafico;
  }, [relatorios, clienteId]);

  // Calcular tendências
  const tendencias = useMemo(() => {
    if (dadosTemporais.length < 2) {
      return { score: 0, participacao: 0 };
    }

    const ultimo = dadosTemporais[dadosTemporais.length - 1];
    const penultimo = dadosTemporais[dadosTemporais.length - 2];

    const scoreTendencia = ultimo.scoreMedia - penultimo.scoreMedia;
    const participacaoTendencia = ultimo.participacaoMedia - penultimo.participacaoMedia;

    return {
      score: scoreTendencia,
      participacao: participacaoTendencia
    };
  }, [dadosTemporais]);

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  if (dadosTemporais.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Não há dados suficientes para análise temporal</p>
            <p className="text-sm mt-2">
              {clienteId ? "Selecione outro cliente ou realize mais avaliações" : "Realize avaliações ao longo do tempo para ver a evolução"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com tendências */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendência de Score</CardTitle>
            {getTrendIcon(tendencias.score)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dadosTemporais[dadosTemporais.length - 1]?.scoreMedia.toFixed(1) || 0}
            </div>
            <p className={`text-xs ${getTrendColor(tendencias.score)}`}>
              {tendencias.score > 0 ? '+' : ''}{tendencias.score.toFixed(1)} pontos vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendência de Participação</CardTitle>
            {getTrendIcon(tendencias.participacao)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dadosTemporais[dadosTemporais.length - 1]?.participacaoMedia.toFixed(1) || 0}%
            </div>
            <p className={`text-xs ${getTrendColor(tendencias.participacao)}`}>
              {tendencias.participacao > 0 ? '+' : ''}{tendencias.participacao.toFixed(1)}% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução do Score */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Score ao Longo do Tempo</CardTitle>
          <CardDescription>
            Acompanhe a tendência de desempenho {clienteId ? 'do cliente' : 'geral'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosTemporais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.mesCompleto;
                    }
                    return label;
                  }}
                  formatter={(value: any) => [value.toFixed(1), '']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="scoreMedia" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Score Médio"
                  dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Participação */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Taxa de Participação</CardTitle>
          <CardDescription>
            Monitore o engajamento nas avaliações ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosTemporais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 12 }}
                  label={{ value: '%', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.mesCompleto;
                    }
                    return label;
                  }}
                  formatter={(value: any) => [value.toFixed(1) + '%', '']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="participacaoMedia" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={3}
                  name="Taxa de Participação"
                  dot={{ fill: 'hsl(var(--chart-2))', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas mensais */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas por Período</CardTitle>
          <CardDescription>Resumo detalhado mês a mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dadosTemporais.slice().reverse().map((dado, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="space-y-1">
                  <p className="font-medium capitalize">{dado.mesCompleto}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{dado.totalRelatorios} relatórios</span>
                    <span>{dado.totalParticipantes} participantes</span>
                    {dado.alertas > 0 && (
                      <span className="text-orange-600">{dado.alertas} alertas</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="text-2xl font-bold">{dado.scoreMedia.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dado.participacaoMedia.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Participação</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnaliseTemporal;
