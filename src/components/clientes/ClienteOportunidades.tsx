import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, DollarSign, Users, Trash2 } from "lucide-react";
import { useOportunidades, useOportunidadeCreate, useOportunidadeUpdate, useOportunidadeDelete } from "@/hooks/useOportunidades";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";

interface ClienteOportunidadesProps {
  clienteId: string;
}

const estagioLabels = {
  'prospecção': 'Prospecção',
  'qualificação': 'Qualificação',
  'proposta': 'Proposta',
  'negociação': 'Negociação',
  'fechamento': 'Fechamento',
  'ganho': 'Ganho',
  'perdido': 'Perdido',
};

const estagioColors = {
  'prospecção': 'secondary',
  'qualificação': 'default',
  'proposta': 'default',
  'negociação': 'default',
  'fechamento': 'default',
  'ganho': 'default',
  'perdido': 'destructive',
} as const;

type Estagio = keyof typeof estagioLabels;

const estagiosFinais: Estagio[] = ['ganho', 'perdido'];

export function ClienteOportunidades({ clienteId }: ClienteOportunidadesProps) {
  const { data: oportunidades, isLoading } = useOportunidades({ clienteId });
  const createOportunidade = useOportunidadeCreate();
  const updateOportunidade = useOportunidadeUpdate();
  const deleteOportunidade = useOportunidadeDelete();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [oportunidadeToDelete, setOportunidadeToDelete] = useState<{ id: string; titulo: string } | null>(null);
  const [formData, setFormData] = useState<{
    titulo: string;
    descricao: string;
    valorEstimado: string;
    probabilidade: string;
    estagio: Estagio;
    dataFechamentoPrevista: string;
    origem: string;
  }>({
    titulo: '',
    descricao: '',
    valorEstimado: '',
    probabilidade: '50',
    estagio: 'prospecção',
    dataFechamentoPrevista: '',
    origem: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOportunidade.mutateAsync({
      clienteId,
      titulo: formData.titulo,
      descricao: formData.descricao,
      valorEstimado: formData.valorEstimado ? parseFloat(formData.valorEstimado) : undefined,
      probabilidade: parseInt(formData.probabilidade),
      estagio: formData.estagio,
      dataFechamentoPrevista: formData.dataFechamentoPrevista || undefined,
      origem: formData.origem || undefined,
    });
    setIsDialogOpen(false);
    setFormData({
      titulo: '',
      descricao: '',
      valorEstimado: '',
      probabilidade: '50',
      estagio: 'prospecção',
      dataFechamentoPrevista: '',
      origem: '',
    });
  };

  const handleEstagioChange = async (oportunidadeId: string, novoEstagio: string) => {
    await updateOportunidade.mutateAsync({
      id: oportunidadeId,
      estagio: novoEstagio as Estagio,
    });
  };

  const handleDeleteClick = (oportunidade: { id: string; titulo: string }) => {
    setOportunidadeToDelete(oportunidade);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (oportunidadeToDelete) {
      await deleteOportunidade.mutateAsync(oportunidadeToDelete.id);
      setDeleteDialogOpen(false);
      setOportunidadeToDelete(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Oportunidades</CardTitle>
          <CardDescription>Acompanhe as oportunidades de negócio</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Oportunidade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Oportunidade</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="valorEstimado">Valor Estimado (R$)</Label>
                  <Input
                    id="valorEstimado"
                    type="number"
                    step="0.01"
                    value={formData.valorEstimado}
                    onChange={(e) => setFormData({ ...formData, valorEstimado: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probabilidade">Probabilidade (%)</Label>
                  <Input
                    id="probabilidade"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probabilidade}
                    onChange={(e) => setFormData({ ...formData, probabilidade: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estagio">Estágio</Label>
                  <Select value={formData.estagio} onValueChange={(v) => setFormData({ ...formData, estagio: v as Estagio })}>
                    <SelectTrigger id="estagio">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(estagioLabels).filter(([value]) => !estagiosFinais.includes(value as Estagio)).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFechamentoPrevista">Previsão de Fechamento</Label>
                  <Input
                    id="dataFechamentoPrevista"
                    type="date"
                    value={formData.dataFechamentoPrevista}
                    onChange={(e) => setFormData({ ...formData, dataFechamentoPrevista: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="origem">Origem</Label>
                <Input
                  id="origem"
                  value={formData.origem}
                  onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createOportunidade.isPending}>
                  Criar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : !oportunidades || oportunidades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma oportunidade criada ainda</p>
            <p className="text-sm">Crie uma oportunidade para acompanhar este negócio</p>
          </div>
        ) : (
          <div className="space-y-4">
            {oportunidades.map((oportunidade) => (
              <div key={oportunidade.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{oportunidade.titulo}</h4>
                      <Badge variant={estagioColors[oportunidade.estagio as keyof typeof estagioColors]}>
                        {estagioLabels[oportunidade.estagio as keyof typeof estagioLabels]}
                      </Badge>
                      {oportunidade.lead_id && (
                        <Badge variant="outline" className="border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400">
                          <Users className="w-3 h-3 mr-1" />
                          Originada de Lead
                        </Badge>
                      )}
                    </div>
                    {oportunidade.descricao && (
                      <p className="text-sm text-muted-foreground">{oportunidade.descricao}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {oportunidade.valor_estimado && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-semibold">
                          <DollarSign className="h-4 w-4" />
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(oportunidade.valor_estimado)}
                        </div>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteClick({ id: oportunidade.id, titulo: oportunidade.titulo })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Probabilidade</span>
                    <span className="font-medium">{oportunidade.probabilidade}%</span>
                  </div>
                  <Progress value={oportunidade.probabilidade || 0} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    {oportunidade.data_fechamento_prevista && (
                      <span>
                        Previsão: {format(new Date(oportunidade.data_fechamento_prevista), "dd/MM/yyyy")}
                      </span>
                    )}
                    {oportunidade.origem && <span>Origem: {oportunidade.origem}</span>}
                  </div>
                  <Select
                    value={oportunidade.estagio}
                    onValueChange={(v) => handleEstagioChange(oportunidade.id, v)}
                  >
                    <SelectTrigger className="w-auto h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(estagioLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Oportunidade"
        description={`Deseja realmente excluir a oportunidade "${oportunidadeToDelete?.titulo || ''}"?`}
        onConfirm={handleConfirmDelete}
        isPending={deleteOportunidade.isPending}
      />
    </Card>
  );
}
