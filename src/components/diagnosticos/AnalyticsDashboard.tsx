import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Clock,
  Target,
  Eye,
  CheckCircle,
  UserCheck,
  Calendar,
  BarChart3,
  Loader2
} from 'lucide-react';
import { useAnalyticsDiagnosticos } from '@/hooks/useAnalyticsDiagnosticos';
import { useTendenciasDiagnosticos } from '@/hooks/useTendenciasDiagnosticos';

const AnalyticsDashboard: React.FC = () => {
  const { data, isLoading } = useAnalyticsDiagnosticos();
  const { data: tendencias, isLoading: isLoadingTendencias } = useTendenciasDiagnosticos();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum dado disponível
      </div>
    );
  }

  // Transformar dados para os gráficos
  const respostasPorDia = Object.entries(data.respostasPorDia || {})
    .slice(-7)
    .map(([dia, total]) => ({
      data: new Date(dia).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      respostas: total,
      conclusoes: Math.round(total * (data.taxaConclusao / 100))
    }));

  const origemLeads = Object.entries(data.origemDistribution || {}).map(([origem, quantidade], index) => ({
    origem: origem === 'desconhecido' ? 'Desconhecido' : origem,
    quantidade: quantidade as number,
    cor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5]
  }));

  const questionariosMaisUsados = data.questionarios
    ?.slice(0, 4)
    .map(q => ({
      nome: q.titulo || 'Sem título',
      respostas: q.total_respostas || 0,
      taxaConclusao: q.total_respostas > 0 
        ? Math.round((q.total_respostas / (q.total_respostas + 10)) * 100) 
        : 0
    })) || [];

  const periodo = 'Últimos 30 dias';

  const metricsCards = [
    {
      title: 'Questionários Ativos',
      value: data.questionariosAtivos,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: tendencias?.questionarios.textoVariacao || 'Calculando...',
      changeType: tendencias?.questionarios.tipo || 'neutro'
    },
    {
      title: 'Total de Respostas',
      value: data.totalRespostas,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: tendencias?.respostas.textoVariacao || 'Calculando...',
      changeType: tendencias?.respostas.tipo || 'neutro'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${data.taxaConclusao}%`,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: 'Período atual',
      changeType: 'neutro' as const
    },
    {
      title: 'Tempo Médio',
      value: `${data.tempoMedio}min`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: 'Período atual',
      changeType: 'neutro' as const
    },
    {
      title: 'Leads Gerados',
      value: data.leadsGerados,
      icon: UserCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      change: tendencias?.leads.textoVariacao || 'Calculando...',
      changeType: tendencias?.leads.tipo || 'neutro'
    },
    {
      title: 'Taxa de Conversão',
      value: `${data.taxaConversao}%`,
      icon: Target,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: tendencias?.conversao.textoVariacao || 'Calculando...',
      changeType: tendencias?.conversao.tipo || 'neutro'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Estatísticas e métricas dos seus questionários - {periodo}
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <BarChart3 className="h-4 w-4 mr-2" />
          Atualizado agora
        </Badge>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricsCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      {metric.changeType === 'positivo' && <TrendingUp className="h-4 w-4 text-green-500 mr-1" />}
                      {metric.changeType === 'negativo' && <TrendingDown className="h-4 w-4 text-red-500 mr-1" />}
                      <span className={`text-sm font-medium ${
                        metric.changeType === 'positivo' ? 'text-green-600' : 
                        metric.changeType === 'negativo' ? 'text-red-600' : 
                        'text-muted-foreground'
                      }`}>
                        {isLoadingTendencias ? 'Calculando...' : metric.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Respostas por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Respostas por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={respostasPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="respostas"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Respostas"
                />
                <Area
                  type="monotone"
                  dataKey="conclusoes"
                  stackId="2"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Conclusões"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Origem dos Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Origem dos Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={origemLeads}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ origem, percent }) => `${origem} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {origemLeads.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questionários Mais Usados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Questionários Mais Usados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={questionariosMaisUsados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="respostas" fill="#3b82f6" name="Respostas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Taxa de Conversão por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.questionarios?.slice(0, 4).map((q, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{q.categoria}</span>
                  <Badge variant="outline">{q.total_respostas || 0} respostas</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance dos Questionários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionariosMaisUsados.map((questionario, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{questionario.nome}</h4>
                  <p className="text-sm text-muted-foreground">
                    {questionario.respostas} respostas
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {questionario.taxaConclusao}% conclusão
                    </p>
                    <Progress 
                      value={questionario.taxaConclusao} 
                      className="w-20 h-2 mt-1" 
                    />
                  </div>
                  <Badge 
                    variant={questionario.taxaConclusao > 70 ? "default" : "secondary"}
                  >
                    {questionario.taxaConclusao > 70 ? "Excelente" : "Bom"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
