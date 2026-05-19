import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, Building2, Clock, MoreVertical, Check, X, Copy, Trash2, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EventoCardProps {
  evento: any;
  onEdit: (evento: any) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  onDuplicate: (id: string) => void;
}

const tipoLabels: Record<string, string> = {
  follow_up: "Follow-up",
  reuniao: "Reunião",
  workshop: "Workshop",
  consultoria: "Consultoria",
  avaliacao: "Avaliação",
  apresentacao: "Apresentação",
  treinamento: "Treinamento",
  outro: "Outro",
};

const tipoColors: Record<string, string> = {
  follow_up: "bg-blue-500",
  reuniao: "bg-purple-500",
  workshop: "bg-orange-500",
  consultoria: "bg-green-500",
  avaliacao: "bg-yellow-500",
  apresentacao: "bg-pink-500",
  treinamento: "bg-indigo-500",
  outro: "bg-gray-500",
};

const statusColors: Record<string, string> = {
  agendado: "default",
  realizado: "secondary",
  cancelado: "destructive",
};

export function EventoCard({ evento, onEdit, onDelete, onToggleStatus, onDuplicate }: EventoCardProps) {
  const dataHora = new Date(evento.data_hora);
  const isPassado = dataHora < new Date();
  const isHoje = format(dataHora, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  
  return (
    <Card className={`${isHoje ? "border-primary shadow-md" : ""} ${evento.status === "cancelado" ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-1 h-8 rounded ${tipoColors[evento.tipo] || "bg-gray-500"}`} />
              <div className="flex-1">
                <h3 className={`font-semibold ${evento.status === "cancelado" ? "line-through" : ""}`}>
                  {evento.titulo}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {format(dataHora, "HH:mm", { locale: ptBR })}
                  <span>•</span>
                  <Calendar className="h-3 w-3" />
                  {format(dataHora, "dd/MM/yyyy", { locale: ptBR })}
                  {isHoje && <Badge variant="default" className="ml-2">Hoje</Badge>}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="outline">{tipoLabels[evento.tipo] || evento.tipo}</Badge>
              <Badge variant={statusColors[evento.status] as any}>
                {evento.status === "agendado" && "Agendado"}
                {evento.status === "realizado" && "Realizado"}
                {evento.status === "cancelado" && "Cancelado"}
              </Badge>
            </div>
            
            {evento.clientes && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>{evento.clientes.nome}</span>
              </div>
            )}
            
            {evento.local && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{evento.local}</span>
              </div>
            )}
            
            {evento.observacoes && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                "{evento.observacoes.length > 100 
                  ? evento.observacoes.substring(0, 100) + '...' 
                  : evento.observacoes}"
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(evento)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              
              {evento.status === "agendado" && (
                <>
                  <DropdownMenuItem onClick={() => onToggleStatus(evento.id, "realizado")}>
                    <Check className="h-4 w-4 mr-2" />
                    Marcar como Realizado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleStatus(evento.id, "cancelado")}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar Evento
                  </DropdownMenuItem>
                </>
              )}
              
              {evento.status !== "agendado" && (
                <DropdownMenuItem onClick={() => onToggleStatus(evento.id, "agendado")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Reativar Evento
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={() => onDuplicate(evento.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onDelete(evento.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
