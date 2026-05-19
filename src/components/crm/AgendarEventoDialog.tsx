import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEventoCreate } from "@/hooks/useEventoMutations";
import { useLeadUpdate } from "@/hooks/useLeadsCRM";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CategoriaSelector } from "@/components/shared/CategoriaSelector";

interface AgendarEventoDialogProps {
  lead: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgendarEventoDialog({ lead, open, onOpenChange }: AgendarEventoDialogProps) {
  const createEvento = useEventoCreate();
  const updateLead = useLeadUpdate();
  
  const [formData, setFormData] = useState({
    titulo: `Follow-up com ${lead.nome}`,
    data: new Date(),
    hora: "09:00",
    tipo: "follow_up",
    local: "",
    observacoes: "",
  });

  const handleSubmit = async () => {
    try {
      const [hours, minutes] = formData.hora.split(":");
      const dataHora = new Date(formData.data);
      dataHora.setHours(parseInt(hours), parseInt(minutes));

      await createEvento.mutateAsync({
        titulo: formData.titulo,
        tipo: formData.tipo,
        data_hora: dataHora.toISOString(),
        cliente_id: lead.cliente_id || null,
        local: formData.local,
        observacoes: formData.observacoes,
        lead_id: lead.id,
      });

      await updateLead.mutateAsync({
        id: lead.id,
        proximoFollowup: dataHora.toISOString(),
      });

      await supabase.from("leads_historico").insert({
        lead_id: lead.id,
        tipo: "follow_up_agendado",
        descricao: `Follow-up agendado para ${format(dataHora, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao agendar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Evento</DialogTitle>
          <DialogDescription>
            Agende um follow-up ou reunião com {lead.nome}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.data, "dd/MM/yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data}
                    onSelect={(date) => date && setFormData({ ...formData, data: date })}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">Hora</Label>
              <Input
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <CategoriaSelector
              tipo="evento"
              value={formData.tipo}
              onChange={(value) => setFormData({ ...formData, tipo: value })}
              allowCreate={true}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              placeholder="Ex: Escritório, Online, etc."
              value={formData.local}
              onChange={(e) => setFormData({ ...formData, local: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createEvento.isPending}>
            Agendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
