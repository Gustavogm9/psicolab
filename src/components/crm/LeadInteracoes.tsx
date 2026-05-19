import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Phone, Mail, MessageSquare, FileText, Calendar, MoreHorizontal } from "lucide-react";
import { useLeadInteracoes, useLeadInteracaoCreate } from "@/hooks/useLeadInteracoes";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeadInteracoesProps {
  leadId: string;
}

const tipoIcons = {
  ligacao: Phone,
  reuniao: Calendar,
  email: Mail,
  whatsapp: MessageSquare,
  proposta: FileText,
  outro: MoreHorizontal,
};

const tipoLabels = {
  ligacao: 'Ligação',
  reuniao: 'Reunião',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  proposta: 'Proposta',
  outro: 'Outro',
};

const resultadoColors = {
  positivo: 'default',
  neutro: 'secondary',
  negativo: 'destructive',
  sem_resposta: 'outline',
} as const;

const resultadoLabels = {
  positivo: 'Positivo',
  neutro: 'Neutro',
  negativo: 'Negativo',
  sem_resposta: 'Sem Resposta',
};

export function LeadInteracoes({ leadId }: LeadInteracoesProps) {
  const { data: interacoes, isLoading } = useLeadInteracoes(leadId);
  const createInteracao = useLeadInteracaoCreate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'ligacao' as const,
    titulo: '',
    descricao: '',
    dataInteracao: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    duracao: '',
    resultado: 'neutro' as const,
    proximosPassos: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInteracao.mutateAsync({
      leadId,
      tipo: formData.tipo,
      titulo: formData.titulo,
      descricao: formData.descricao,
      dataInteracao: formData.dataInteracao,
      duracao: formData.duracao ? parseInt(formData.duracao) : undefined,
      resultado: formData.resultado,
      proximosPassos: formData.proximosPassos,
    });
    setIsDialogOpen(false);
    setFormData({
      tipo: 'ligacao',
      titulo: '',
      descricao: '',
      dataInteracao: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      duracao: '',
      resultado: 'neutro',
      proximosPassos: '',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Histórico de Interações</CardTitle>
          <CardDescription>Todas as interações registradas com este lead</CardDescription>
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
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="resultado">Resultado</Label>
                  <Select value={formData.resultado} onValueChange={(v: any) => setFormData({ ...formData, resultado: v })}>
                    <SelectTrigger id="resultado">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(resultadoLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
            <p className="text-sm">Comece registrando sua primeira interação com este lead</p>
          </div>
        ) : (
          <div className="space-y-4">
            {interacoes.map((interacao) => {
              const Icon = tipoIcons[interacao.tipo as keyof typeof tipoIcons];
              return (
                <div key={interacao.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{interacao.titulo}</h4>
                          {interacao.resultado && (
                            <Badge variant={resultadoColors[interacao.resultado as keyof typeof resultadoColors]}>
                              {resultadoLabels[interacao.resultado as keyof typeof resultadoLabels]}
                            </Badge>
                          )}
                        </div>
                        {interacao.descricao && (
                          <p className="text-sm text-muted-foreground">{interacao.descricao}</p>
                        )}
                        {interacao.proximos_passos && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                            <span className="font-medium">Próximos passos:</span> {interacao.proximos_passos}
                          </div>
                        )}
                      </div>
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
