import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ExternalLink, Loader2, RefreshCw, Clock, Activity, CheckCircle, XCircle, Trash2, Info, CloudOff, Cloud } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useFaturaUpdate, useFaturaDelete } from "@/hooks/useFaturas";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";

interface Fatura {
  id: string;
  numero_fatura: string;
  cliente?: { nome: string; email: string } | null;
  descricao: string;
  valor: number;
  data_emissao: string;
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
  forma_pagamento: string;
  contrato_id?: string | null;
  asaas_invoice_url: string | null;
  asaas_bank_slip_url: string | null;
  asaas_pix_qr_code: string | null;
  asaas_pix_copy_paste: string | null;
  asaas_payment_id: string | null;
  webhook_logs: Array<{
    event: string;
    timestamp: string;
    payment_id: string;
    status_anterior?: string;
    status_novo?: string;
  }> | null;
}

interface FaturaDetalhesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fatura: Fatura | null;
}

export function FaturaDetalhesDialog({ open, onOpenChange, fatura }: FaturaDetalhesDialogProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isConfirmPagoOpen, setIsConfirmPagoOpen] = useState(false);
  const [isConfirmingPago, setIsConfirmingPago] = useState(false);
  const faturaUpdate = useFaturaUpdate();
  const faturaDelete = useFaturaDelete();
  
  if (!fatura) return null;

  const isActionable = fatura.status !== 'pago' && fatura.status !== 'cancelado';
  const canDelete = !fatura.asaas_payment_id;
  const hasAsaas = !!fatura.asaas_payment_id;
  
  const handleRetrySync = async () => {
    setIsRetrying(true);
    try {
      const { error } = await supabase.functions.invoke('asaas-create-payment', {
        body: { fatura_id: fatura.id }
      });
      
      if (error) throw error;
      
      toast.success('Fatura sincronizada com sucesso!');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao sincronizar:', error);
      toast.error(error.message || 'Erro ao sincronizar com Asaas');
    } finally {
      setIsRetrying(false);
    }
  };




  const handleMarcarPago = async () => {
    if (hasAsaas) {
      setIsConfirmingPago(true);
      try {
        const { error } = await supabase.functions.invoke('asaas-confirm-payment', {
          body: { fatura_id: fatura.id }
        });
        if (error) throw error;
        toast.success('Pagamento confirmado no Asaas e no sistema!');
        onOpenChange(false);
      } catch (error: any) {
        toast.error(error.message || 'Erro ao confirmar pagamento no Asaas');
      } finally {
        setIsConfirmingPago(false);
        setIsConfirmPagoOpen(false);
      }
    } else {
      faturaUpdate.mutate(
        { id: fatura.id, status: 'pago', data_pagamento: new Date().toISOString().split('T')[0] },
        { 
          onSuccess: () => {
            setIsConfirmPagoOpen(false);
            onOpenChange(false);
          }
        }
      );
    }
  };

  const handleCancelar = async () => {
    if (hasAsaas) {
      // Cancel in Asaas first, then locally
      setIsCancelling(true);
      try {
        const { error } = await supabase.functions.invoke('asaas-cancel-payment', {
          body: { fatura_id: fatura.id }
        });
        if (error) throw error;
        toast.success('Fatura cancelada no Asaas e no sistema!');
        onOpenChange(false);
      } catch (error: any) {
        console.error('Erro ao cancelar no Asaas:', error);
        toast.error(error.message || 'Erro ao cancelar fatura no Asaas');
      } finally {
        setIsCancelling(false);
      }
    } else {
      faturaUpdate.mutate(
        { id: fatura.id, status: 'cancelado' },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  const handleExcluir = () => {
    faturaDelete.mutate(fatura.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        onOpenChange(false);
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "pendente":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "atrasado":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "cancelado":
        return "bg-gray-500/10 text-gray-700 border-gray-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pago":
        return "Pago";
      case "pendente":
        return "Pendente";
      case "atrasado":
        return "Atrasado";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const isMutating = faturaUpdate.isPending || faturaDelete.isPending || isCancelling || isConfirmingPago;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Fatura {fatura.numero_fatura}</DialogTitle>
                <DialogDescription>Detalhes completos da fatura</DialogDescription>
              </div>
              <Badge className={getStatusColor(fatura.status)}>
                {getStatusLabel(fatura.status)}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Banner informativo sobre integração */}
            {hasAsaas ? (
              <Alert className="border-blue-200 bg-blue-50">
                <Cloud className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Sincronizada com Asaas.</strong> Alterações de status (cancelar, marcar como pago) serão refletidas automaticamente na plataforma Asaas.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-amber-200 bg-amber-50">
                <CloudOff className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  <strong>Fatura avulsa (sem Asaas).</strong> Criada manualmente no sistema. Você pode excluí-la, cancelá-la ou marcá-la como paga livremente.
                </AlertDescription>
              </Alert>
            )}

            {/* Ações da Fatura */}
            {isActionable && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ações</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsConfirmPagoOpen(true)}
                    disabled={isMutating}
                    className="gap-1"
                  >
                    {isConfirmingPago ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    Marcar como Pago
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelar}
                    disabled={isMutating}
                    className="gap-1"
                  >
                    {isCancelling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    {hasAsaas ? 'Cancelar (Asaas + Sistema)' : 'Cancelar Fatura'}
                  </Button>
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsDeleteOpen(true)}
                      disabled={isMutating}
                      className="gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir Fatura
                    </Button>
                  )}
                </div>
                {hasAsaas && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Faturas sincronizadas com o Asaas não podem ser excluídas, apenas canceladas.
                  </p>
                )}
              </div>
            )}

            {/* Status cancelado/pago info */}
            {fatura.status === 'cancelado' && (
              <Alert className="border-gray-200 bg-gray-50">
                <XCircle className="h-4 w-4 text-gray-500" />
                <AlertDescription className="text-gray-700 text-sm">
                  Esta fatura foi cancelada e não requer mais nenhuma ação.
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold">Informações da Fatura</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cliente:</span>
                  <p className="font-medium">{fatura.cliente?.nome || 'Cliente não encontrado'}</p>
                  {fatura.cliente?.email && (
                    <p className="text-xs text-muted-foreground">{fatura.cliente.email}</p>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Valor:</span>
                  <p className="font-bold text-lg">R$ {fatura.valor.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Data de Emissão:</span>
                  <p className="font-medium">
                    {format(new Date(fatura.data_emissao), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Data de Vencimento:</span>
                  <p className="font-medium">
                    {format(new Date(fatura.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                {fatura.data_pagamento && (
                  <div>
                    <span className="text-muted-foreground">Data de Pagamento:</span>
                    <p className="font-medium">
                      {format(new Date(fatura.data_pagamento), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Forma de Pagamento:</span>
                  <p className="font-medium">{fatura.forma_pagamento}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <p className="font-medium">{fatura.contrato_id ? '📋 Contrato recorrente' : '📝 Avulsa (manual)'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Descrição */}
            <div className="space-y-2">
              <h3 className="font-semibold">Descrição</h3>
              <p className="text-sm text-muted-foreground">{fatura.descricao}</p>
            </div>

            {/* Links de Pagamento (se houver) */}
            {(fatura.asaas_pix_copy_paste || fatura.asaas_bank_slip_url || fatura.asaas_invoice_url) ? (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold">Opções de Pagamento</h3>
                  
                  {fatura.asaas_pix_copy_paste && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">PIX Copia e Cola</p>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={fatura.asaas_pix_copy_paste}
                          className="flex-1 text-xs font-mono"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(fatura.asaas_pix_copy_paste!, "Código PIX")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {fatura.asaas_pix_qr_code && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">QR Code PIX</p>
                      <div className="flex justify-center p-4 bg-muted rounded-lg">
                        <img 
                          src={`data:image/png;base64,${fatura.asaas_pix_qr_code}`} 
                          alt="QR Code PIX"
                          className="w-48 h-48"
                        />
                      </div>
                    </div>
                  )}

                  {fatura.asaas_bank_slip_url && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(fatura.asaas_bank_slip_url!, "_blank")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver Boleto
                    </Button>
                  )}

                  {fatura.asaas_invoice_url && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(fatura.asaas_invoice_url!, "_blank")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver Fatura Completa
                    </Button>
                  )}
                </div>
              </>
            ) : (
              !fatura.asaas_payment_id && isActionable && (
                <>
                  <Separator />
                  <div className="p-4 bg-yellow-500/10 border border-yellow-200 rounded-lg space-y-3">
                    <p className="text-sm text-yellow-800">
                      Esta fatura não está sincronizada com o Asaas. Sincronize para gerar links de pagamento.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetrySync}
                      disabled={isRetrying}
                    >
                      {isRetrying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sincronizar com Asaas
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )
            )}

            {/* Histórico de Webhooks */}
            {fatura.webhook_logs && fatura.webhook_logs.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <h3 className="font-semibold">Histórico de Webhooks</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {fatura.webhook_logs.length} eventos
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Todos os eventos do Asaas recebidos para esta fatura
                  </p>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {fatura.webhook_logs
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((log, index) => (
                        <AccordionItem key={index} value={`log-${index}`}>
                          <AccordionTrigger className="text-sm py-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {log.event.replace('PAYMENT_', '').replace(/_/g, ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(log.timestamp), "dd/MM/yyyy 'às' HH:mm:ss")}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 text-sm pl-4">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-muted-foreground">Evento:</span>
                                  <p className="font-mono text-xs">{log.event}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Payment ID:</span>
                                  <p className="font-mono text-xs truncate">{log.payment_id}</p>
                                </div>
                              </div>
                              {log.status_anterior && log.status_novo && (
                                <div>
                                  <span className="text-muted-foreground">Mudança de Status:</span>
                                  <p className="text-xs">
                                    <span className="text-red-600 font-medium">{log.status_anterior}</span>
                                    {' → '}
                                    <span className="text-green-600 font-medium">{log.status_novo}</span>
                                  </p>
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {format(new Date(log.timestamp), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: ptBR })}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Excluir Fatura"
        description={`Tem certeza que deseja excluir a fatura ${fatura.numero_fatura} de R$ ${fatura.valor.toFixed(2)}?`}
        warningItems={[
          "A fatura será removida permanentemente do sistema",
          "Dados financeiros e relatórios serão afetados",
        ]}
        onConfirm={handleExcluir}
        isPending={faturaDelete.isPending}
      />

      <DeleteConfirmationDialog
        open={isConfirmPagoOpen}
        onOpenChange={setIsConfirmPagoOpen}
        title="Confirmar Pagamento"
        description={`Deseja marcar a fatura ${fatura.numero_fatura} de R$ ${fatura.valor.toFixed(2)} como paga?${hasAsaas ? ' O status será atualizado também no Asaas.' : ''}`}
        onConfirm={handleMarcarPago}
        isPending={isConfirmingPago}
        confirmText="Confirmar Pagamento"
        cancelText="Cancelar"
      />
    </>
  );
}
