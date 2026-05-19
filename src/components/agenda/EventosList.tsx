import { format, isToday, isThisWeek, isThisMonth, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { EventoCard } from "./EventoCard";

interface EventosListProps {
  eventos: any[];
  onEdit: (evento: any) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  onDuplicate: (id: string) => void;
}

export function EventosList({ eventos, onEdit, onDelete, onToggleStatus, onDuplicate }: EventosListProps) {
  const eventosHoje = eventos.filter(e => isToday(new Date(e.data_hora)));
  const eventosSemana = eventos.filter(e => {
    const data = new Date(e.data_hora);
    return isThisWeek(data, { locale: ptBR }) && !isToday(data);
  });
  const eventosMes = eventos.filter(e => {
    const data = new Date(e.data_hora);
    return isThisMonth(data) && !isThisWeek(data, { locale: ptBR });
  });
  const eventosProximos = eventos.filter(e => {
    const data = new Date(e.data_hora);
    return !isThisMonth(data) && !isPast(data);
  });
  const eventosPassados = eventos.filter(e => {
    const data = new Date(e.data_hora);
    return isPast(data) && !isToday(data);
  });
  
  const Section = ({ title, eventos }: { title: string; eventos: any[] }) => {
    if (eventos.length === 0) return null;
    
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">{title} ({eventos.length})</h3>
        <div className="space-y-2">
          {eventos.map((evento) => (
            <EventoCard
              key={evento.id}
              evento={evento}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      </div>
    );
  };
  
  if (eventos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum evento encontrado</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <Section title="📌 Hoje" eventos={eventosHoje} />
      <Section title="📅 Esta Semana" eventos={eventosSemana} />
      <Section title="📆 Este Mês" eventos={eventosMes} />
      <Section title="🔜 Próximos" eventos={eventosProximos} />
      <Section title="📂 Passados" eventos={eventosPassados} />
    </div>
  );
}
