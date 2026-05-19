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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useLeadUpdate } from "@/hooks/useLeadsCRM";
import { cleanCpfCnpj, formatCpfCnpj, isValidCpfCnpj } from "@/lib/cpf-cnpj-validator";
import { toast } from "sonner";

interface LeadEditDialogProps {
  lead: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadEditDialog({ lead, open, onOpenChange }: LeadEditDialogProps) {
  const updateLead = useLeadUpdate();
  const [formData, setFormData] = useState({
    nome: lead.nome,
    responsavel: lead.responsavel || "",
    email: lead.email,
    telefone: lead.telefone || "",
    cpf_cnpj: lead.cpf_cnpj || "",
    endereco: lead.endereco || "",
    colaboradores: lead.colaboradores || 0,
    tipo: lead.tipo || "",
    cargo: lead.cargo || "",
    prioridade: lead.prioridade || "media",
    valorPotencial: lead.valor_potencial || 0,
    observacoes: lead.observacoes || "",
    score: lead.score || 0,
  });

  const handleSubmit = async () => {
      // Validar CPF/CNPJ se preenchido
      if (formData.cpf_cnpj && !isValidCpfCnpj(formData.cpf_cnpj)) {
        toast.error('CPF ou CNPJ inválido');
        return;
      }

      await updateLead.mutateAsync({
        id: lead.id,
        nome: formData.nome,
        responsavel: formData.responsavel,
        email: formData.email,
        telefone: formData.telefone,
        cpf_cnpj: formData.cpf_cnpj ? cleanCpfCnpj(formData.cpf_cnpj) : undefined,
        endereco: formData.endereco,
        colaboradores: formData.colaboradores,
        tipo: formData.tipo,
        cargo: formData.cargo,
        prioridade: formData.prioridade as any,
        valorPotencial: formData.valorPotencial,
        observacoes: formData.observacoes,
        score: formData.score,
      });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
          <DialogDescription>
            Atualize as informações do lead
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4">
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Dados da Empresa</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Empresa</Label>
                <Input
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="Ex: Corporativo, PME"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colaboradores">Colaboradores</Label>
                <Input
                  id="colaboradores"
                  type="number"
                  min="0"
                  value={formData.colaboradores}
                  onChange={(e) =>
                    setFormData({ ...formData, colaboradores: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm">Contato Principal</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsavel">Nome do Responsável</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  ⚠️ Sem email: envio de e-mail e conversão automática ficam limitados
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="cpf_cnpj">CPF ou CNPJ</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">
                        <strong>Por que é importante?</strong>
                        <br />• Necessário para emitir cobranças via Asaas
                        <br />• Sem ele, você só poderá criar faturas locais
                        <br />• Pode ser preenchido agora ou depois
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={(e) => {
                  const formatted = formatCpfCnpj(e.target.value);
                  setFormData({ ...formData, cpf_cnpj: formatted });
                }}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                maxLength={18}
              />
              <p className="text-xs text-muted-foreground">
                💡 Necessário para emitir faturas. Pode ser preenchido depois.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm">Qualificação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value) => setFormData({ ...formData, prioridade: value })}
                >
                  <SelectTrigger id="prioridade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor Potencial</Label>
                <Input
                  id="valor"
                  type="number"
                  min="0"
                  value={formData.valorPotencial}
                  onChange={(e) =>
                    setFormData({ ...formData, valorPotencial: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {/* Mostrar campo de score APENAS para leads manuais */}
            {lead.origem !== 'diagnostico' && (
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="score">Score (0-100)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">
                          Avalie a qualidade deste lead com base em:
                          <br />• <strong>0-30:</strong> Baixo interesse ou fit ruim
                          <br />• <strong>31-60:</strong> Interesse moderado
                          <br />• <strong>61-100:</strong> Alto interesse e bom fit
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-2">
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      const clampedValue = Math.min(Math.max(value, 0), 100);
                      setFormData({ ...formData, score: clampedValue });
                    }}
                    placeholder="Ex: 75"
                  />
                  {/* Barra de progresso visual */}
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        formData.score >= 70 ? 'bg-green-500' : 
                        formData.score >= 40 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${formData.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.score <= 30 && "🔴 Baixa qualificação"}
                    {formData.score > 30 && formData.score <= 60 && "🟡 Qualificação moderada"}
                    {formData.score > 60 && "🟢 Alta qualificação"}
                  </p>
                </div>
              </div>
            )}

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={updateLead.isPending}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
