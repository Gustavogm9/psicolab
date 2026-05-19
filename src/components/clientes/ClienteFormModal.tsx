import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useClienteMutation } from "@/hooks/useClienteMutation";
import { useClienteUpdate } from "@/hooks/useClienteUpdate";
import { ContatosManager } from "./ContatosManager";
import { useEffect, useState } from "react";
import { isValidCpfCnpj, formatCpfCnpj, cleanCpfCnpj } from "@/lib/cpf-cnpj-validator";

interface ClienteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  clienteData?: any;
}

const clienteSchema = z.object({
  nome: z.string().trim().min(1, "Nome da empresa é obrigatório").max(200, "Nome muito longo"),
  responsavel: z.string().trim().min(1, "Nome do responsável é obrigatório").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  telefone: z.string().trim().min(1, "Telefone é obrigatório").max(50, "Telefone muito longo"),
  cpf_cnpj: z.string().trim().optional().refine((val) => !val || isValidCpfCnpj(val), {
    message: "CPF ou CNPJ inválido",
  }),
  endereco: z.string().trim().min(1, "Endereço é obrigatório").max(300, "Endereço muito longo"),
  colaboradores: z.coerce.number().min(0, "Número de colaboradores não pode ser negativo"),
  tipo: z.string().min(1, "Tipo de empresa é obrigatório"),
  status: z.string().optional(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

export function ClienteFormModal({ open, onOpenChange, onSuccess, clienteData }: ClienteFormModalProps) {
  const { createCliente, isCreating } = useClienteMutation();
  const { updateCliente, isUpdating } = useClienteUpdate();
  const isEditMode = !!clienteData;

  // Track newly created client ID to show contacts manager after creation
  const [createdClienteId, setCreatedClienteId] = useState<string | null>(null);

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    mode: "onChange",
    defaultValues: {
      nome: '',
      responsavel: '',
      email: '',
      telefone: '',
      cpf_cnpj: '',
      endereco: '',
      colaboradores: 0,
      tipo: '',
      status: 'Ativo',
    },
  });

  // Reset createdClienteId when modal closes or clienteData changes
  useEffect(() => {
    if (!open) {
      setCreatedClienteId(null);
    }
  }, [open]);

  // Update form when clienteData changes
  useEffect(() => {
    if (clienteData) {
      form.reset({
        nome: clienteData.nome || "",
        responsavel: clienteData.responsavel || "",
        email: clienteData.email || "",
        telefone: clienteData.telefone || "",
        cpf_cnpj: clienteData.cpf_cnpj || "",
        endereco: clienteData.endereco || "",
        colaboradores: clienteData.colaboradores || 0,
        tipo: clienteData.tipo || "",
        status: clienteData.status || "Ativo",
      });
    } else {
      form.reset({
        nome: '',
        responsavel: '',
        email: '',
        telefone: '',
        cpf_cnpj: '',
        endereco: '',
        colaboradores: 0,
        tipo: '',
        status: 'Ativo',
      });
    }
  }, [clienteData, form]);

  const onSubmit = async (data: ClienteFormData) => {
    try {
      console.log('🔄 Iniciando operação de cliente...', { isEditMode, clienteId: clienteData?.id });

      // Limpar CPF/CNPJ antes de salvar (remover formatação) se preenchido
      const cleanedData = {
        ...data,
        cpf_cnpj: data.cpf_cnpj ? cleanCpfCnpj(data.cpf_cnpj) : undefined,
        status: isEditMode ? data.status : 'Ativo',
      };

      console.log('📤 Dados preparados para envio:', { ...cleanedData, cpf_cnpj: cleanedData.cpf_cnpj ? '***' : 'não informado' });

      if (isEditMode) {
        console.log('✏️ Atualizando cliente...', { id: clienteData.id });
        await updateCliente({
          id: clienteData.id,
          ...cleanedData,
        });
        console.log('✅ Cliente atualizado com sucesso!');
        form.reset();
        setTimeout(() => {
          onOpenChange(false);
        }, 100);
        onSuccess?.();
      } else {
        console.log('➕ Criando novo cliente...');
        const novoCliente = await createCliente({
          ...cleanedData,
          status: 'Ativo',
        });
        console.log('✅ Cliente criado com sucesso!', novoCliente);
        // Instead of closing, switch to "add contacts" mode
        setCreatedClienteId(novoCliente.id);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('❌ Erro ao salvar cliente:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      console.error('Dados do formulário:', data);

      // Verificar se é erro de email duplicado
      if (error?.code === '23505' && error?.message?.includes('idx_clientes_email_consultora')) {
        toast.error(
          'Este email já está cadastrado para outro cliente. Por favor, use um email diferente.',
          { duration: 5000 }
        );
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(
        isEditMode
          ? `Erro ao atualizar cliente: ${errorMessage}`
          : `Erro ao criar cliente: ${errorMessage}`
      );
    }
  };

  const isLoading = isCreating || isUpdating;

  // Determine the effective client ID for contacts
  const effectiveClienteId = clienteData?.id || createdClienteId;
  const showContacts = !!effectiveClienteId;

  const handleClose = () => {
    setCreatedClienteId(null);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleClose();
      } else {
        onOpenChange(true);
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {createdClienteId ? 'Cliente Criado — Adicionar Contatos' : isEditMode ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {createdClienteId
              ? 'Cliente criado com sucesso! Agora você pode adicionar os contatos das pessoas responsáveis.'
              : isEditMode ? 'Atualize as informações do cliente' : 'Cadastre um novo cliente para gerenciar suas avaliações'}
          </DialogDescription>
        </DialogHeader>

        {createdClienteId && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              Cliente criado com sucesso! Adicione os contatos abaixo ou clique em "Concluir" para finalizar.
            </AlertDescription>
          </Alert>
        )}

        {!createdClienteId && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(
              onSubmit,
              (errors) => {
                console.error('❌ Erros de validação do formulário:', errors);
                const firstError = Object.values(errors)[0];
                toast.error(
                  firstError?.message || 'Corrija os erros do formulário antes de continuar'
                );
              }
            )} className="grid gap-4 py-4">

              {Object.keys(form.formState.errors).length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Há {Object.keys(form.formState.errors).length} erro(s) no formulário. Corrija-os antes de continuar.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nome da Empresa <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: TechCorp Solutions" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="responsavel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Responsável <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do responsável" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        E-mail <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contato@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Telefone <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="cpf_cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      CPF ou CNPJ
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const formatted = formatCpfCnpj(e.target.value);
                          field.onChange(formatted);
                        }}
                        maxLength={18}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Obrigatório para emitir cobranças via Asaas
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Endereço <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número, bairro, cidade - UF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="colaboradores"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Número de Colaboradores <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tipo de Empresa <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                          <SelectItem value="Serviços">Serviços</SelectItem>
                          <SelectItem value="Consultoria">Consultoria</SelectItem>
                          <SelectItem value="Governo">Governo</SelectItem>
                          <SelectItem value="ONG">ONG</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {isEditMode && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Status do Cliente
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose()}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Atualizando...' : 'Criando...'}
                    </>
                  ) : (
                    isEditMode ? 'Atualizar Cliente' : 'Criar Cliente'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {showContacts && (
          <div className="border-t pt-6">
            <ContatosManager clienteId={effectiveClienteId} />
          </div>
        )}

        {createdClienteId && (
          <DialogFooter className="border-t pt-4">
            <Button onClick={handleClose}>
              Concluir
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}