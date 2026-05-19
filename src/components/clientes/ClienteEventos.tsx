import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { getStatusColor } from "@/lib/mock-data";

interface ClienteEventosProps {
  eventos: any[];
  isLoading: boolean;
}

export function ClienteEventos({ eventos, isLoading }: ClienteEventosProps) {
  if (isLoading) {
    return <div className="text-center py-8">Carregando eventos...</div>;
  }

  if (eventos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum evento cadastrado para este cliente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {eventos.map((evento) => (
        <Card key={evento.id} className="card-premium hover:scale-[1.01] transition-transform">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{evento.titulo}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{evento.tipo}</p>
              </div>
              <Badge className={getStatusColor(evento.status)}>
                {evento.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {new Date(evento.data_hora).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {new Date(evento.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {evento.local && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{evento.local}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
