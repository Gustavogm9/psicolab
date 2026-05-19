import { format, isBefore, isToday, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useLeadEventos, useEventoDelete, useEventoUpdate } from '@/hooks/useLeadEventos';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface LeadEventosProps {
  leadId: string;
}

export function LeadEventos({ leadId }: LeadEventosProps) {
  const { data: eventos = [], isLoading } = useLeadEventos(leadId);
  const deleteEvento = useEventoDelete();
  const updateEvento = useEventoUpdate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'realizado':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'cancelado':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      agendado: 'Agendado',
      realizado: 'Realizado',
      cancelado: 'Cancelado',
    };
    return labels[status] || status;
  };

  const handleMarcarRealizado = (eventoId: string) => {
    updateEvento.mutate({ id: eventoId, status: 'realizado' });
  };

  const handleCancelar = (eventoId: string) => {
    updateEvento.mutate({ id: eventoId, status: 'cancelado' });
  };

  const handleExcluir = (eventoId: string) => {
    deleteEvento.mutate(eventoId);
  };

  const eventosFuturos = eventos.filter((evento) =>
    isFuture(new Date(evento.data_hora)) || isToday(new Date(evento.data_hora))
  );

  const eventosPassados = eventos.filter((evento) =>
    isBefore(new Date(evento.data_hora), new Date()) && !isToday(new Date(evento.data_hora))
  );

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando eventos...</div>;
  }

  if (eventos.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Nenhum evento agendado ainda. Use o botão "Agendar" para criar um novo evento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Eventos Futuros */}
      {eventosFuturos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximos Eventos ({eventosFuturos.length})
          </h3>
          <div className="space-y-3">
            {eventosFuturos.map((evento) => {
              const dataEvento = new Date(evento.data_hora);
              const isHoje = isToday(dataEvento);
              const isVencido = isBefore(dataEvento, new Date()) && evento.status === 'agendado';

              return (
                <Card key={evento.id} className={isHoje ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{evento.titulo}</h4>
                          <Badge className={getStatusColor(evento.status)}>
                            {getStatusLabel(evento.status)}
                          </Badge>
                          {isHoje && <Badge variant="destructive">Hoje</Badge>}
                          {isVencido && <Badge variant="destructive">Atrasado</Badge>}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {format(dataEvento, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          {evento.tipo && (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline">{evento.tipo}</Badge>
                            </div>
                          )}
                          {evento.local && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{evento.local}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {evento.status === 'agendado' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarcarRealizado(evento.id)}
                            disabled={updateEvento.isPending}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelar(evento.id)}
                            disabled={updateEvento.isPending}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O evento será removido permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleExcluir(evento.id)}
                                  disabled={deleteEvento.isPending}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Eventos Passados */}
      {eventosPassados.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Eventos Anteriores ({eventosPassados.length})
          </h3>
          <div className="space-y-2">
            {eventosPassados.map((evento) => (
              <Card key={evento.id} className="opacity-70">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{evento.titulo}</span>
                        <Badge className={getStatusColor(evento.status)} variant="outline">
                          {getStatusLabel(evento.status)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(evento.data_hora), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O evento será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleExcluir(evento.id)}
                            disabled={deleteEvento.isPending}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
