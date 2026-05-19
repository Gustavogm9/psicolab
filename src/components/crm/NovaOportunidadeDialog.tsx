import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useOportunidadeCreate } from '@/hooks/useOportunidadeCreate';
import { useLeadsCRM } from '@/hooks/useLeadsCRM';
import { Badge } from '@/components/ui/badge';

interface NovaOportunidadeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaOportunidadeDialog({ open, onOpenChange }: NovaOportunidadeDialogProps) {
  const [leadId, setLeadId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valorEstimado, setValorEstimado] = useState('');
  const [probabilidade, setProbabilidade] = useState([50]);
  const [estagio, setEstagio] = useState('prospecção');
  const [dataFechamento, setDataFechamento] = useState('');

  const { data: leads } = useLeadsCRM();
  const createOportunidade = useOportunidadeCreate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadId || !titulo) {
      return;
    }

    await createOportunidade.mutateAsync({
      lead_id: leadId,
      titulo,
      descricao,
      valor_estimado: valorEstimado ? parseFloat(valorEstimado) : undefined,
      probabilidade: probabilidade[0],
      estagio,
      data_fechamento_prevista: dataFechamento || undefined,
    });

    // Reset form
    setLeadId('');
    setTitulo('');
    setDescricao('');
    setValorEstimado('');
    setProbabilidade([50]);
    setEstagio('prospecção');
    setDataFechamento('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Oportunidade</DialogTitle>
          <DialogDescription>
            Crie uma nova oportunidade de negócio vinculada a um Lead existente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead">Lead *</Label>
            <Select value={leadId} onValueChange={setLeadId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o lead..." />
              </SelectTrigger>
              <SelectContent>
                {leads?.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    <div className="flex items-center gap-2">
                      <span>{lead.nome}</span>
                      {lead.empresa && (
                        <Badge variant="outline" className="text-xs">
                          {lead.empresa}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Oportunidade *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Diagnóstico Organizacional"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva os detalhes da oportunidade..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor Estimado (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={valorEstimado}
                onChange={(e) => setValorEstimado(e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data Prevista de Fechamento</Label>
              <Input
                id="data"
                type="date"
                value={dataFechamento}
                onChange={(e) => setDataFechamento(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estagio">Estágio Inicial</Label>
            <Select value={estagio} onValueChange={setEstagio}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prospecção">Prospecção</SelectItem>
                <SelectItem value="qualificação">Qualificação</SelectItem>
                <SelectItem value="proposta">Proposta</SelectItem>
                <SelectItem value="negociação">Negociação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Probabilidade de Fechamento</Label>
              <span className="text-sm font-medium">{probabilidade[0]}%</span>
            </div>
            <Slider
              value={probabilidade}
              onValueChange={setProbabilidade}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createOportunidade.isPending}>
              {createOportunidade.isPending ? 'Criando...' : 'Criar Oportunidade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
