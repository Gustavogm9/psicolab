import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Calendar, TrendingUp, User, DollarSign, Clock, CalendarPlus } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AgendarEventoIntervencaoDialog } from "@/components/intervencoes/AgendarEventoIntervencaoDialog";

interface ClienteIntervencoesProps {
  intervencoes: any[];
  isLoading: boolean;
}

const statusConfig = {
  'planejada': { label: 'Planejada', variant: 'secondary' as const },
  'em_andamento': { label: 'Em Andamento', variant: 'default' as const },
  'concluida': { label: 'Concluída', variant: 'outline' as const },
  'cancelada': { label: 'Cancelada', variant: 'destructive' as const },
};

const prioridadeConfig = {
  'baixa': { label: 'Baixa', variant: 'outline' as const },
  'media': { label: 'Média', variant: 'secondary' as const },
  'alta': { label: 'Alta', variant: 'default' as const },
  'urgente': { label: 'Urgente', variant: 'destructive' as const },
};

export function ClienteIntervencoes({ intervencoes, isLoading }: ClienteIntervencoesProps) {
  const [agendarDialogOpen, setAgendarDialogOpen] = useState(false);
  const [intervencaoSelecionada, setIntervencaoSelecionada] = useState<any>(null);

  const handleAgendar = (intervencao: any) => {
    setIntervencaoSelecionada(intervencao);
    setAgendarDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (intervencoes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma intervenção cadastrada</h3>
          <p className="text-sm text-muted-foreground text-center">
            Este cliente ainda não possui intervenções registradas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {intervencoes.map((intervencao) => {
        const status = statusConfig[intervencao.status as keyof typeof statusConfig] || statusConfig.planejada;
        const prioridade = prioridadeConfig[intervencao.prioridade as keyof typeof prioridadeConfig] || prioridadeConfig.media;
        
        return (
          <Card key={intervencao.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{intervencao.titulo}</CardTitle>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={prioridade.variant} className="text-xs">
                  {prioridade.label}
                </Badge>
                {intervencao.categoria && (
                  <Badge variant="outline" className="text-xs">
                    {intervencao.categoria}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {intervencao.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {intervencao.descricao}
                </p>
              )}

              {/* Barra de Progresso */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Progresso
                  </span>
                  <span className="font-medium">{intervencao.progresso || 0}%</span>
                </div>
                <Progress value={intervencao.progresso || 0} />
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {intervencao.data_inicio && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">Início: {format(new Date(intervencao.data_inicio), 'dd/MM/yyyy')}</span>
                  </div>
                )}
                {intervencao.data_fim && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">Fim: {format(new Date(intervencao.data_fim), 'dd/MM/yyyy')}</span>
                  </div>
                )}
              </div>

              {/* Informações Adicionais */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground border-t pt-3">
                {intervencao.responsavel && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{intervencao.responsavel}</span>
                  </div>
                )}
                {intervencao.duracao_estimada && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{intervencao.duracao_estimada}h</span>
                  </div>
                )}
                {intervencao.custo_estimado && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>R$ {Number(intervencao.custo_estimado).toLocaleString('pt-BR')}</span>
                  </div>
                )}
              </div>

              {/* Botão Agendar Evento */}
              <div className="border-t pt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleAgendar(intervencao)}
                >
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Agendar Evento
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Dialog de Agendamento */}
      {intervencaoSelecionada && (
        <AgendarEventoIntervencaoDialog
          intervencao={intervencaoSelecionada}
          open={agendarDialogOpen}
          onOpenChange={setAgendarDialogOpen}
        />
      )}
    </div>
  );
}
