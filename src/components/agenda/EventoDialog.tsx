import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useClientes } from "@/hooks/useClientes";
import { useLeadsCRM } from "@/hooks/useLeadsCRM";
import { CategoriaSelector } from "@/components/shared/CategoriaSelector";

interface EventoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function EventoDialog({ open, onOpenChange, onSubmit, initialData }: EventoDialogProps) {
  const { data: clientes } = useClientes();
  const { data: leads } = useLeadsCRM();
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      titulo: "",
      tipo: "reuniao",
      data_hora: new Date(),
      cliente_id: "",
      lead_id: "",
      local: "",
      observacoes: "",
    },
  });
  
  // Atualizar formulário quando initialData mudar
  useEffect(() => {
    if (open && initialData) {
      reset({
        titulo: initialData.titulo || "",
        tipo: initialData.tipo || "reuniao",
        data_hora: initialData.data_hora ? new Date(initialData.data_hora) : new Date(),
        cliente_id: initialData.cliente_id || "",
        lead_id: initialData.lead_id || "",
        local: initialData.local || "",
        observacoes: initialData.observacoes || "",
      });
    } else if (open && !initialData) {
      reset({
        titulo: "",
        tipo: "reuniao",
        data_hora: new Date(),
        cliente_id: "",
        lead_id: "",
        local: "",
        observacoes: "",
      });
    }
  }, [open, initialData, reset]);
  
  const dataHora = watch("data_hora");
  const selectedDate = dataHora ? new Date(dataHora) : new Date();
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const currentTime = selectedDate;
      date.setHours(currentTime.getHours(), currentTime.getMinutes());
      setValue("data_hora", date);
    }
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':');
    const newDate = new Date(selectedDate);
    newDate.setHours(parseInt(hours), parseInt(minutes));
    setValue("data_hora", newDate);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              {...register("titulo", { required: true })}
              placeholder="Ex: Reunião de alinhamento"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <CategoriaSelector
              tipo="evento"
              value={watch("tipo")}
              onChange={(value) => setValue("tipo", value)}
              allowCreate={true}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hora">Horário *</Label>
              <Input
                id="hora"
                type="time"
                defaultValue={format(selectedDate, "HH:mm")}
                onChange={handleTimeChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cliente_id">Cliente (opcional)</Label>
            <Select
              defaultValue={initialData?.cliente_id || "sem_cliente"}
              onValueChange={(value) => setValue("cliente_id", value === "sem_cliente" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem_cliente">Sem cliente</SelectItem>
                {clientes?.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lead_id">Lead (opcional)</Label>
            <Select
              defaultValue={initialData?.lead_id || "sem_lead"}
              onValueChange={(value) => setValue("lead_id", value === "sem_lead" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem lead vinculado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem_lead">Sem lead vinculado</SelectItem>
                {leads?.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="local">Local ou Link</Label>
            <Input
              id="local"
              {...register("local")}
              placeholder="Ex: Sala 3 ou https://meet.google.com/..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register("observacoes")}
              placeholder="Adicione detalhes, notas ou lembretes sobre este evento..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? "Salvar" : "Criar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
