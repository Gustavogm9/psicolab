import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFaturaCreate } from "@/hooks/useFaturas";
import { useClientes } from "@/hooks/useClientes";
import { useAsaasCredentials } from "@/hooks/useAsaasCredentials";
import { Loader2, AlertTriangle, Edit, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClienteFormModal } from "@/components/clientes/ClienteFormModal";

interface FaturaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FaturaFormDialog({ open, onOpenChange }: FaturaFormDialogProps) {
  const { data: clientes } = useClientes();
  const createFatura = useFaturaCreate();
  const { credentials } = useAsaasCredentials();
  const [isClienteEditOpen, setIsClienteEditOpen] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    cliente_id: "",
    descricao: "",
    valor: "",
    data_vencimento: "",
    forma_pagamento: "PIX"
  });

  const clienteSelecionado = clientes?.find(c => c.id === formData.cliente_id);
  const clienteSemCpfCnpj = clienteSelecionado && !clienteSelecionado.cpf_cnpj;
  const isProducao = credentials?.environment === 'production';
  const VALOR_MINIMO_PRODUCAO = 5.0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.cliente_id) {
      toast.error('Selecione um cliente');
      return;
    }
    
    if (!formData.descricao.trim()) {
      toast.error('Informe uma descrição para a fatura');
      return;
    }
    
    const valor = parseFloat(formData.valor);
    if (isNaN(valor) || valor <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }
    
    // Validação de valor mínimo para ambiente de produção
    if (isProducao && valor < VALOR_MINIMO_PRODUCAO) {
      toast.error(`Ambiente de produção: O valor mínimo para faturas no Asaas é R$ ${VALOR_MINIMO_PRODUCAO.toFixed(2)}`, {
        duration: 6000,
      });
      return;
    }
    
    if (!formData.data_vencimento) {
      toast.error('Informe a data de vencimento');
      return;
    }
    
    createFatura.mutate({
      cliente_id: formData.cliente_id,
      descricao: formData.descricao,
      valor,
      data_vencimento: formData.data_vencimento,
      forma_pagamento: formData.forma_pagamento
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          cliente_id: "",
          descricao: "",
          valor: "",
          data_vencimento: "",
          forma_pagamento: "PIX"
        });
      }
    });
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditarCliente = () => {
    if (clienteSelecionado) {
      setClienteParaEditar(clienteSelecionado);
      setIsClienteEditOpen(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Fatura Manual</DialogTitle>
          <DialogDescription>
            Criar uma fatura pontual para cobrança avulsa. Para cobranças recorrentes (mensalidades), 
            use a aba <strong>Contratos</strong> para gerar faturas automaticamente.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
            <Select value={formData.cliente_id} onValueChange={(value) => updateField("cliente_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {(!clientes || clientes.length === 0) ? (
                  <SelectItem value="" disabled>
                    Nenhum cliente cadastrado
                  </SelectItem>
                ) : (
                  clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome} {!cliente.cpf_cnpj && "⚠️"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            
            {clienteSemCpfCnpj && (
              <Alert className="bg-yellow-500/10 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-700" />
                <AlertDescription className="text-yellow-700 text-sm">
                  <div className="space-y-2">
                    <p className="font-medium">
                      ⚠️ Este cliente não possui CPF/CNPJ cadastrado
                    </p>
                    <p>
                      A fatura será criada localmente, mas <strong>não poderá ser sincronizada com o Asaas</strong> para cobrança automática.
                    </p>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={handleEditarCliente}
                      className="gap-1 mt-2"
                    >
                      <Edit className="h-3 w-3" />
                      Completar Cadastro do Cliente
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {isProducao && (
            <Alert className="bg-blue-500/10 border-blue-200">
              <Info className="h-4 w-4 text-blue-700" />
              <AlertDescription className="text-blue-700 text-sm">
                <strong>Ambiente de Produção:</strong> O Asaas exige valor mínimo de <strong>R$ 5,00</strong> para cobranças.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min={isProducao ? "5.00" : "0.01"}
                placeholder={isProducao ? "5,00 (mínimo)" : "0,00"}
                value={formData.valor}
                onChange={(e) => updateField("valor", e.target.value)}
                required
              />
              {isProducao && formData.valor && parseFloat(formData.valor) < VALOR_MINIMO_PRODUCAO && (
                <p className="text-sm text-destructive">
                  ⚠️ Valor abaixo do mínimo permitido (R$ 5,00)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vencimento">Data de Vencimento *</Label>
              <Input
                id="vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => updateField("data_vencimento", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
            <Select value={formData.forma_pagamento} onValueChange={(value) => updateField("forma_pagamento", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="BOLETO">Boleto</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                <SelectItem value="UNDEFINED">A definir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              placeholder="Descrição dos serviços prestados..."
              value={formData.descricao}
              onChange={(e) => updateField("descricao", e.target.value)}
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createFatura.isPending}>
              {createFatura.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Fatura
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {clienteParaEditar && (
        <ClienteFormModal
          open={isClienteEditOpen}
          onOpenChange={setIsClienteEditOpen}
          clienteData={clienteParaEditar}
          onSuccess={() => {
            toast.success('Cliente atualizado com sucesso!');
            setIsClienteEditOpen(false);
          }}
        />
      )}
    </Dialog>
  );
}
