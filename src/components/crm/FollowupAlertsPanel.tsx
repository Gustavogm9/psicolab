import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertCircle, Calendar as CalendarIcon, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { format, isBefore, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useFollowupAlerts } from "@/hooks/useFollowupAlerts";
import { useLeadUpdate } from "@/hooks/useLeadsCRM";
import { toast } from "@/hooks/use-toast";

export function FollowupAlertsPanel() {
  const navigate = useNavigate();
  const { leadsComFollowup, isLoading } = useFollowupAlerts();
  const updateLead = useLeadUpdate();
  const [leadEmAdiamento, setLeadEmAdiamento] = useState<string | null>(null);
  const [novaData, setNovaData] = useState<Date>(new Date());

  const handleAbrirLead = (leadId: string) => {
    navigate(`/crm/${leadId}`);
  };

  const handleMarcarFeito = async (leadId: string) => {
    try {
      await updateLead.mutateAsync({
        id: leadId,
        proximoFollowup: null,
      });
      toast({
        title: "Follow-up concluído",
        description: "O follow-up foi marcado como realizado.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAdiarFollowup = async (leadId: string) => {
    try {
      await updateLead.mutateAsync({
        id: leadId,
        proximoFollowup: novaData.toISOString(),
      });
      setLeadEmAdiamento(null);
      toast({
        title: "Follow-up adiado",
        description: `Reagendado para ${format(novaData, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Follow-ups Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (leadsComFollowup.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Follow-ups em Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum follow-up pendente. Ótimo trabalho! 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Follow-ups Pendentes ({leadsComFollowup.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leadsComFollowup.map((lead) => {
          const dataFollowup = new Date(lead.proximo_followup!);
          const isVencido = isBefore(dataFollowup, new Date());
          const isHoje = isToday(dataFollowup);

          return (
            <Card key={lead.id} className={isVencido ? "border-destructive" : ""}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{lead.nome}</h4>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {format(dataFollowup, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {isVencido && <Badge variant="destructive">Atrasado</Badge>}
                      {isHoje && <Badge variant="default">Hoje</Badge>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAbrirLead(lead.id)}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Abrir Lead
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarcarFeito(lead.id)}
                      disabled={updateLead.isPending}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Marcar Feito
                    </Button>

                    <Popover
                      open={leadEmAdiamento === lead.id}
                      onOpenChange={(open) => setLeadEmAdiamento(open ? lead.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          Adiar
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={novaData}
                          onSelect={(date) => date && setNovaData(date)}
                          locale={ptBR}
                          disabled={(date) => date < new Date()}
                        />
                        <div className="p-3 border-t">
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleAdiarFollowup(lead.id)}
                            disabled={updateLead.isPending}
                          >
                            Confirmar
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}
