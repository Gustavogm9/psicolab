import { useState, useMemo, useEffect } from "react";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEventos, type EventoFilters } from "@/hooks/useEventos";
import { useEventoCreate, useEventoUpdate, useEventoDelete, useEventoDuplicate } from "@/hooks/useEventoMutations";
import { EventoDialog } from "@/components/agenda/EventoDialog";
import { EventosList } from "@/components/agenda/EventosList";
import { EventosCalendar } from "@/components/agenda/EventosCalendar";
import { EventoFilters as FiltersComponent } from "@/components/agenda/EventoFilters";
import { EventoStats } from "@/components/agenda/EventoStats";
import { MainLayout } from "@/components/layout/main-layout";
import { isToday, isThisWeek, isThisMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export default function Agenda() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<any>(null);
  const [filters, setFilters] = useState<EventoFilters>({
    cliente_id: 'todos',
    tipo: 'todos',
    status: 'todos',
  });
  
  const { data: eventos = [], isLoading, refetch: refetchEventos } = useEventos(filters);

  // Auto-update past events on mount
  useEffect(() => {
    supabase.rpc('atualizar_eventos_passados').then(() => {
      refetchEventos();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const createMutation = useEventoCreate();
  const updateMutation = useEventoUpdate();
  const deleteMutation = useEventoDelete();
  const duplicateMutation = useEventoDuplicate();
  
  // Calcular estatísticas
  const stats = useMemo(() => {
    const hoje = eventos.filter(e => isToday(new Date(e.data_hora)) && e.status === 'agendado').length;
    const semana = eventos.filter(e => isThisWeek(new Date(e.data_hora)) && e.status === 'agendado').length;
    const realizadosMes = eventos.filter(e => isThisMonth(new Date(e.data_hora)) && e.status === 'realizado').length;
    
    const totalMes = eventos.filter(e => isThisMonth(new Date(e.data_hora))).length;
    const taxa = totalMes > 0 ? Math.round((realizadosMes / totalMes) * 100) : 0;
    
    return {
      eventosHoje: hoje,
      eventosSemana: semana,
      eventosRealizadosMes: realizadosMes,
      taxaRealizacao: taxa,
    };
  }, [eventos]);
  
  const handleSubmit = (data: any) => {
    if (eventoEditando) {
      updateMutation.mutate({ id: eventoEditando.id, data });
    } else {
      createMutation.mutate(data);
    }
    setDialogOpen(false);
    setEventoEditando(null);
  };
  
  const handleEdit = (evento: any) => {
    setEventoEditando(evento);
    setDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      deleteMutation.mutate(id);
    }
  };
  
  const handleToggleStatus = (id: string, status: string) => {
    updateMutation.mutate({ id, data: { status } });
  };
  
  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id);
  };
  
  const handleNovoEvento = () => {
    setEventoEditando(null);
    setDialogOpen(true);
  };
  
  const voltarHoje = () => {
    setFilters({ ...filters, periodo: 'hoje' });
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center gap-2">
              <CalendarIcon className="h-8 w-8" />
              Agenda
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os seus eventos e compromissos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={voltarHoje}>
              Hoje
            </Button>
            <Button onClick={handleNovoEvento}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </div>
        </div>
        
        <EventoStats {...stats} />
        
        <FiltersComponent filters={filters} onFiltersChange={setFilters} />
        
        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">
              📋 Lista
            </TabsTrigger>
            <TabsTrigger value="calendario">
              📅 Calendário
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="lista" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">Carregando eventos...</div>
            ) : (
              <EventosList
                eventos={eventos}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onDuplicate={handleDuplicate}
              />
            )}
          </TabsContent>
          
          <TabsContent value="calendario">
            <EventosCalendar 
              eventos={eventos}
              onEventoClick={handleEdit}
            />
          </TabsContent>
        </Tabs>
        
        <EventoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          initialData={eventoEditando}
        />
      </div>
    </MainLayout>
  );
}
