import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MousePointerClick, Mail, TrendingUp, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

export default function AnalyticsConsolidado() {
  // Query para dados dos últimos 30 dias
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics-consolidado"],
    queryFn: async () => {
      const dataInicio = format(subDays(new Date(), 30), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("perfil_publico_analytics_consolidado")
        .select("*")
        .gte("data", dataInicio)
        .order("data", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Query para totais acumulados
  const { data: totals } = useQuery({
    queryKey: ["analytics-totals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("perfil_publico_analytics_consolidado")
        .select("*");

      if (error) throw error;

      const totais = data.reduce(
        (acc, curr) => ({
          visualizacoes: acc.visualizacoes + (curr.total_visualizacoes || 0),
          cliques: acc.cliques + (curr.total_cliques_cta || 0),
          leads: acc.leads + (curr.total_leads_capturados || 0),
          diagnosticos: acc.diagnosticos + (curr.total_diagnosticos_iniciados || 0),
        }),
        { visualizacoes: 0, cliques: 0, leads: 0, diagnosticos: 0 }
      );

      const taxaConversao = totais.visualizacoes > 0 
        ? ((totais.leads / totais.visualizacoes) * 100).toFixed(2)
        : "0.00";

      return { ...totais, taxaConversao };
    },
  });

  // Formatar dados para o gráfico
  const chartData = analytics?.map((item) => ({
    data: format(new Date(item.data), "dd/MM"),
    Visualizações: item.total_visualizacoes,
    "Cliques CTA": item.total_cliques_cta,
    Leads: item.total_leads_capturados,
  })) || [];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-center">Carregando analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Consolidado</h1>
          <p className="text-muted-foreground">
            Visão geral de performance de todos os perfis públicos
          </p>
        </div>

        {/* Cards de Métricas */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visualizações</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totals?.visualizacoes || 0).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cliques CTA</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totals?.cliques || 0).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totals?.leads || 0).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diagnósticos Iniciados</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totals?.diagnosticos || 0).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals?.taxaConversao || "0.00"}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Evolução */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução dos Últimos 30 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Visualizações"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Cliques CTA"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Leads"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
    </div>
  );
}
