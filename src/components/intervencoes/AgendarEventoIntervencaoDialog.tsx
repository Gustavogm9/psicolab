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
import { toast } from "sonner";
import { CategoriaSelector } from "@/components/shared/CategoriaSelector";

interface AgendarEventoIntervencaoDialogProps {
  intervencao: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgendarEventoIntervencaoDialog({ 
  intervencao, 
  open, 
  onOpenChange 
}: AgendarEventoIntervencaoDialogProps) {
  const createEvento = useEventoCreate();
  
  const [formData, setFormData] = useState({
    titulo: `Reunião: ${intervencao.titulo}`,
    data: new Date(),
    hora: "14:00",
    tipo: "reuniao",
    local: "",
    observacoes: intervencao.descricao || "",
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
        cliente_id: intervencao.cliente_id,
        local: formData.local,
        observacoes: `${formData.observacoes}\n\n[intervencao_id:${intervencao.id}]`,
        lead_id: null,
      });

      toast.success("Evento agendado com sucesso!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro ao agendar evento", {
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Evento</DialogTitle>
          <DialogDescription>
            Agende uma reunião relacionada à intervenção "{intervencao.titulo}"
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
              placeholder="Ex: Sala de reuniões, Online, etc."
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
            {createEvento.isPending ? "Agendando..." : "Agendar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
