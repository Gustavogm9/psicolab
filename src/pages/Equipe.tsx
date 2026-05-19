import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { mockDepartamentos, getStatusColor } from "@/lib/mock-data";

export default function Equipe() {

  const getRiskColor = (score: number) => {
    if (score >= 70) return "bg-destructive";
    if (score >= 50) return "bg-warning";
    return "bg-success";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Equipe</h1>
          <p className="text-muted-foreground">Visão geral dos departamentos e colaboradores</p>
        </div>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Gerar Relatório
        </Button>
      </div>

      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDepartamentos.reduce((total, dept) => total + dept.colaboradores, 0)}</div>
            <p className="text-xs text-muted-foreground">
              {mockDepartamentos.length} departamentos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações Completas</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDepartamentos.reduce((total, dept) => total + dept.avaliacoesCompletas, 0)}</div>
            <p className="text-xs text-success">
              {Math.round((mockDepartamentos.reduce((total, dept) => total + dept.avaliacoesCompletas, 0) / mockDepartamentos.reduce((total, dept) => total + dept.colaboradores, 0)) * 100)}% de conclusão
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDepartamentos.reduce((total, dept) => total + dept.avaliacoesPendentes, 0)}</div>
            <p className="text-xs text-muted-foreground">
              Para completar
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risco Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(mockDepartamentos.reduce((total, dept) => total + dept.risco, 0) / mockDepartamentos.length)}</div>
            <p className="text-xs text-muted-foreground">
              Score geral
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Departamentos */}
      <div className="grid gap-6 md:grid-cols-2">
        {mockDepartamentos.map((dept) => (
          <Card key={dept.id} className="card-premium">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{dept.nome}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Líder: {dept.responsavel}
                  </p>
                </div>
                <Badge className={getStatusColor(dept.status)}>
                  {dept.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score de Risco</span>
                <span className="text-lg font-bold">{dept.risco}</span>
              </div>
              <Progress 
                value={dept.risco} 
                className="h-2"
              />
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Colaboradores</p>
                  <p className="text-lg font-semibold">{dept.colaboradores}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avaliações</p>
                  <p className="text-lg font-semibold">
                    {dept.avaliacoesCompletas}/{dept.colaboradores}
                  </p>
                </div>
              </div>
              
              {dept.avaliacoesPendentes > 0 && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                  <p className="text-sm text-warning">
                    {dept.avaliacoesPendentes} avaliações pendentes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </MainLayout>
  );
}