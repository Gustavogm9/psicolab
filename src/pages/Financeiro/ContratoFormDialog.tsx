import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useClientes } from "@/hooks/useClientes";
import { useContratoMutations } from "@/hooks/useContratoMutations";

const contratoSchema = z.object({
  cliente_id: z.string().min(1, "Selecione um cliente"),
  valor_mensal: z.string().min(1, "Informe o valor mensal"),
  dia_vencimento: z.string().min(1, "Informe o dia de vencimento"),
  forma_pagamento: z.string().min(1, "Selecione a forma de pagamento"),
  data_inicio: z.string().min(1, "Informe a data de início"),
  data_fim: z.string().optional(),
  observacoes: z.string().optional(),
});

type ContratoFormData = z.infer<typeof contratoSchema>;

interface ContratoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato?: any;
}

export function ContratoFormDialog({
  open,
  onOpenChange,
  contrato,
}: ContratoFormDialogProps) {
  const { data: clientes } = useClientes();
  const { createContrato, updateContrato, isCreating, isUpdating } = useContratoMutations();
  const [selectedCliente, setSelectedCliente] = useState<string>("");

  const form = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      cliente_id: "",
      valor_mensal: "",
      dia_vencimento: "10",
      forma_pagamento: "PIX",
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (contrato) {
      form.reset({
        cliente_id: contrato.cliente_id,
        valor_mensal: contrato.valor_mensal.toString(),
        dia_vencimento: contrato.dia_vencimento.toString(),
        forma_pagamento: contrato.forma_pagamento,
        data_inicio: contrato.data_inicio,
        data_fim: contrato.data_fim || "",
        observacoes: contrato.observacoes || "",
      });
      setSelectedCliente(contrato.cliente_id);
    } else {
      form.reset({
        cliente_id: "",
        valor_mensal: "",
        dia_vencimento: "10",
        forma_pagamento: "PIX",
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: "",
        observacoes: "",
      });
      setSelectedCliente("");
    }
  }, [contrato, form]);

  const onSubmit = (data: ContratoFormData) => {
    const payload = {
      ...data,
      valor_mensal: parseFloat(data.valor_mensal),
      dia_vencimento: parseInt(data.dia_vencimento),
      data_fim: data.data_fim || undefined,
    };

    if (contrato) {
      updateContrato(
        { id: contrato.id, ...payload },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      createContrato(payload, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contrato ? "Editar Contrato" : "Novo Contrato"}
          </DialogTitle>
          <DialogDescription>
            {contrato
              ? "Atualize as informações do contrato"
              : "Configure um novo contrato de mensalidade recorrente"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCliente(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientes?.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valor_mensal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Mensal (R$) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dia_vencimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia do Vencimento *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Dia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((dia) => (
                          <SelectItem key={dia} value={dia.toString()}>
                            Dia {dia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Faturas serão geradas neste dia de cada mês
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="forma_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="BOLETO">Boleto</SelectItem>
                      <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                      <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_fim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Término</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Deixe em branco para contrato sem prazo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre o contrato..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
