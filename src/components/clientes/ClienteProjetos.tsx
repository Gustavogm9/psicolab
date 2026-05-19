import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Users } from "lucide-react";
import { getStatusColor } from "@/lib/mock-data";

interface ClienteProjetosProps {
  projetos: any[];
  isLoading: boolean;
}

export function ClienteProjetos({ projetos, isLoading }: ClienteProjetosProps) {
  if (isLoading) {
    return <div className="text-center py-8">Carregando projetos...</div>;
  }

  if (projetos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum projeto cadastrado para este cliente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {projetos.map((projeto) => (
        <Card key={projeto.id} className="card-premium hover:scale-[1.01] transition-transform">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{projeto.nome}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{projeto.tipo}</p>
              </div>
              <Badge className={getStatusColor(projeto.status)}>
                {projeto.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progresso</span>
                <span className="text-sm text-muted-foreground">{projeto.progresso}%</span>
              </div>
              <Progress value={projeto.progresso} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Início</p>
                  <p className="text-muted-foreground">
                    {projeto.data_inicio ? new Date(projeto.data_inicio).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Fim</p>
                  <p className="text-muted-foreground">
                    {projeto.data_fim ? new Date(projeto.data_fim).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {projeto.participantes_responderam || 0} / {projeto.participantes_total || 0} participantes responderam
              </span>
            </div>

            <div className="pt-2 border-t">
              <Badge variant="outline">
                Prioridade: {projeto.prioridade}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
