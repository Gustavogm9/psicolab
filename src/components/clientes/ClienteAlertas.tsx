import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface ClienteAlertasProps {
  alertas: any[];
  isLoading: boolean;
}

const getAlertIcon = (tipo: string) => {
  switch (tipo.toLowerCase()) {
    case 'critico':
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    case 'alerta':
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    default:
      return <Info className="h-5 w-5 text-info" />;
  }
};

const getAlertColor = (tipo: string) => {
  switch (tipo.toLowerCase()) {
    case 'critico':
      return 'bg-destructive/10 border-destructive/20';
    case 'alerta':
      return 'bg-warning/10 border-warning/20';
    default:
      return 'bg-info/10 border-info/20';
  }
};

export function ClienteAlertas({ alertas, isLoading }: ClienteAlertasProps) {
  if (isLoading) {
    return <div className="text-center py-8">Carregando alertas...</div>;
  }

  if (alertas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum alerta registrado para este cliente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alertas.map((alerta) => (
        <Card key={alerta.id} className={`border-2 ${getAlertColor(alerta.tipo)}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              {getAlertIcon(alerta.tipo)}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{alerta.titulo}</h4>
                  <Badge variant={alerta.lido ? "outline" : "default"}>
                    {alerta.lido ? "Lido" : "Novo"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alerta.descricao}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(alerta.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
