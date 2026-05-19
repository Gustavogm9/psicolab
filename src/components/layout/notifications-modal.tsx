import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Clock, CheckCircle, AlertTriangle, Info, ExternalLink } from "lucide-react";
import { useAlertas, useMarcarAlertaLido, useMarcarTodosAlertasLidos } from "@/hooks/useAlertas";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: string;
  read: boolean;
  link: string | null;
}

const getAlertaLink = (tipo: string): string | null => {
  switch (tipo) {
    case 'fatura_atrasada':
      return '/financeiro';
    case 'lead_diagnostico':
    case 'lead_perfil_publico':
      return '/crm';
    case 'resposta_avaliacao':
    case 'resposta_avaliacao_publica':
      return '/avaliacoes';
    case 'depoimento_pendente':
      return '/perfil-publico/configurar';
    case 'follow_up_pendente':
      return '/crm';
    default:
      return null;
  }
};

const getTipoFromAlerta = (tipo: string): "info" | "warning" | "success" | "error" => {
  if (tipo === 'follow_up_pendente' || tipo === 'fatura_atrasada') return 'warning';
  if (tipo === 'error') return 'error';
  if (tipo === 'warning') return 'warning';
  return 'info';
};

const formatRelativeTime = (date: string) => {
  return formatDistanceToNow(new Date(date), { 
    addSuffix: true, 
    locale: ptBR 
  });
};

export function NotificationsModal() {
  const { data: alertas = [], isLoading } = useAlertas();
  const marcarLido = useMarcarAlertaLido();
  const marcarTodosLidos = useMarcarTodosAlertasLidos();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const notifications: Notification[] = alertas.map(alerta => ({
    id: alerta.id,
    title: alerta.titulo,
    message: alerta.descricao || '',
    type: getTipoFromAlerta(alerta.tipo),
    timestamp: formatRelativeTime(alerta.created_at),
    read: alerta.lido || false,
    link: getAlertaLink(alerta.tipo),
  }));

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-success" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      marcarLido.mutate(notification.id);
    }
    if (notification.link) {
      setOpen(false);
      navigate(notification.link);
    }
  };

  const markAllAsRead = () => {
    marcarTodosLidos.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Notificações</DialogTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.read 
                      ? "bg-muted/30 border-border/30" 
                      : "bg-card border-border hover:bg-muted/50"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium ${
                          notification.read ? "text-muted-foreground" : "text-foreground"
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {notification.link && (
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          )}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{notification.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
