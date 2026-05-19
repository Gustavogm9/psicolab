import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, TrendingUp, Activity } from "lucide-react";

interface ClienteAnalyticsProps {
  cliente: any;
  projetos: any[];
}

export function ClienteAnalytics({ cliente, projetos }: ClienteAnalyticsProps) {
  const projetosAtivos = projetos.filter(p => p.status === 'Ativo' || p.status === 'Coleta').length;
  const projetosConcluidos = projetos.filter(p => p.status === 'Concluído').length;
  const progressoMedio = projetos.length > 0 
    ? projetos.reduce((acc, p) => acc + (p.progresso || 0), 0) / projetos.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projetosAtivos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              em andamento
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Concluídos</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projetosConcluidos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              finalizados com sucesso
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressoMedio.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              dos projetos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métricas de Engajamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Taxa de Resposta</span>
                <span className="text-sm text-muted-foreground">
                  {projetos.length > 0 
                    ? (projetos.reduce((acc, p) => acc + ((p.participantes_responderam || 0) / (p.participantes_total || 1) * 100), 0) / projetos.length).toFixed(0)
                    : 0}%
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Risco Atual</span>
                <span className="text-sm text-muted-foreground">{cliente.risco_atual || 0}%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Total de Colaboradores</span>
                <span className="text-sm text-muted-foreground">{cliente.colaboradores}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-12 text-center">
          <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Gráficos detalhados de evolução serão implementados em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
