import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EventosCalendarProps {
  eventos: any[];
  onEventoClick: (evento: any) => void;
}

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

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function EventosCalendar({ eventos, onEventoClick }: EventosCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventosForDay = (day: Date) => {
    return eventos.filter(evento => 
      isSameDay(new Date(evento.data_hora), day)
    );
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="space-y-4">
      {/* Header com navegação */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grade do calendário */}
      <Card>
        <CardContent className="p-4">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-2">
            {days.map(day => {
              const dayEventos = getEventosForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isDayToday = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[100px] p-2 rounded-lg border transition-colors",
                    !isCurrentMonth && "bg-muted/30 opacity-50",
                    isDayToday && "border-primary border-2 bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isDayToday && "text-primary font-bold"
                  )}>
                    {format(day, "d")}
                  </div>

                  <div className="space-y-1">
                    {dayEventos.slice(0, 3).map(evento => (
                      <button
                        key={evento.id}
                        onClick={() => onEventoClick(evento)}
                        className={cn(
                          "w-full text-left p-1 rounded text-xs hover:opacity-80 transition-opacity",
                          "truncate cursor-pointer",
                          evento.status === "cancelado" && "opacity-50 line-through"
                        )}
                        style={{
                          backgroundColor: tipoColors[evento.tipo] || "#6b7280",
                        }}
                      >
                        <div className="text-white font-medium truncate">
                          {format(new Date(evento.data_hora), "HH:mm")} {evento.titulo}
                        </div>
                      </button>
                    ))}
                    {dayEventos.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEventos.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>Follow-up</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span>Reunião</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span>Workshop</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Consultoria</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span>Avaliação</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded bg-pink-500" />
              <span>Apresentação</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded bg-indigo-500" />
              <span>Treinamento</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
