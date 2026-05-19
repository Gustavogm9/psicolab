import { Calendar, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EventoStatsProps {
  eventosHoje: number;
  eventosSemana: number;
  eventosRealizadosMes: number;
  taxaRealizacao: number;
}

export function EventoStats({ 
  eventosHoje, 
  eventosSemana, 
  eventosRealizadosMes, 
  taxaRealizacao 
}: EventoStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{eventosHoje}</p>
              <p className="text-sm text-muted-foreground">Hoje</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{eventosSemana}</p>
              <p className="text-sm text-muted-foreground">Esta Semana</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{eventosRealizadosMes}</p>
              <p className="text-sm text-muted-foreground">Realizados (Mês)</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{taxaRealizacao}%</p>
              <p className="text-sm text-muted-foreground">Taxa Realização</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
