import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Phone, Mail, MessageSquare, MapPin, Calendar, MoreHorizontal } from "lucide-react";
import { useClienteInteracoes, useClienteInteracaoCreate } from "@/hooks/useClienteInteracoes";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClienteInteracoesProps {
  clienteId: string;
}

const tipoIcons = {
  ligacao: Phone,
  reuniao: Calendar,
  email: Mail,
  whatsapp: MessageSquare,
  visita: MapPin,
  outro: MoreHorizontal,
};

const tipoLabels = {
  ligacao: 'Ligação',
  reuniao: 'Reunião',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  visita: 'Visita',
  outro: 'Outro',
};

export function ClienteInteracoes({ clienteId }: ClienteInteracoesProps) {
  const { data: interacoes, isLoading } = useClienteInteracoes(clienteId);
  const createInteracao = useClienteInteracaoCreate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'reuniao' as const,
    titulo: '',
    descricao: '',
    dataInteracao: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    duracao: '',
    participantes: '',
    resultado: '',
    proximosPassos: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInteracao.mutateAsync({
      clienteId,
      tipo: formData.tipo,
      titulo: formData.titulo,
      descricao: formData.descricao,
      dataInteracao: formData.dataInteracao,
      duracao: formData.duracao ? parseInt(formData.duracao) : undefined,
      participantes: formData.participantes ? formData.participantes.split(',').map(p => p.trim()) : undefined,
      resultado: formData.resultado || undefined,
      proximosPassos: formData.proximosPassos || undefined,
    });
    setIsDialogOpen(false);
    setFormData({
      tipo: 'reuniao',
      titulo: '',
      descricao: '',
      dataInteracao: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      duracao: '',
      participantes: '',
      resultado: '',
      proximosPassos: '',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Histórico de Interações</CardTitle>
          <CardDescription>Todas as interações registradas com este cliente</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Interação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nova Interação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Interação</Label>
                <Select value={formData.tipo} onValueChange={(v: any) => setFormData({ ...formData, tipo: v })}>
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tipoLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataInteracao">Data e Hora</Label>
                  <Input
                    id="dataInteracao"
                    type="datetime-local"
                    value={formData.dataInteracao}
                    onChange={(e) => setFormData({ ...formData, dataInteracao: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duracao">Duração (minutos)</Label>
                  <Input
                    id="duracao"
                    type="number"
                    value={formData.duracao}
                    onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="participantes">Participantes (separados por vírgula)</Label>
                <Input
                  id="participantes"
                  value={formData.participantes}
                  onChange={(e) => setFormData({ ...formData, participantes: e.target.value })}
                  placeholder="João Silva, Maria Santos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resultado">Resultado</Label>
                <Textarea
                  id="resultado"
                  value={formData.resultado}
                  onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proximosPassos">Próximos Passos</Label>
                <Textarea
                  id="proximosPassos"
                  value={formData.proximosPassos}
                  onChange={(e) => setFormData({ ...formData, proximosPassos: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createInteracao.isPending}>
                  Registrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !interacoes || interacoes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma interação registrada ainda</p>
            <p className="text-sm">Comece registrando sua primeira interação com este cliente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {interacoes.map((interacao) => {
              const Icon = tipoIcons[interacao.tipo as keyof typeof tipoIcons];
              return (
                <div key={interacao.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium">{interacao.titulo}</h4>
                      {interacao.descricao && (
                        <p className="text-sm text-muted-foreground">{interacao.descricao}</p>
                      )}
                      {interacao.participantes && interacao.participantes.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Participantes:</span> {interacao.participantes.join(', ')}
                        </div>
                      )}
                      {interacao.resultado && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                          <span className="font-medium">Resultado:</span> {interacao.resultado}
                        </div>
                      )}
                      {interacao.proximos_passos && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                          <span className="font-medium">Próximos passos:</span> {interacao.proximos_passos}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      {format(new Date(interacao.data_interacao), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </span>
                    {interacao.duracao && <span>{interacao.duracao} minutos</span>}
                    <span className="capitalize">{tipoLabels[interacao.tipo as keyof typeof tipoLabels]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
