import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContratos } from "@/hooks/useContratos";
import { useContratoMutations } from "@/hooks/useContratoMutations";
import { ContratoFormDialog } from "./ContratoFormDialog";
import {
  Plus,
  MoreVertical,
  Edit,
  Power,
  Ban,
  FileText,
  Calendar,
} from "lucide-react";

export function ContratosManager() {
  const { contratos, isLoading } = useContratos();
  const { toggleContratoStatus, deleteContrato } = useContratoMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<any>(null);

  const handleEdit = (contrato: any) => {
    setSelectedContrato(contrato);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedContrato(null);
    setDialogOpen(true);
  };

  const handleToggleStatus = (contrato: any) => {
    const novoStatus = contrato.status === 'ativo' ? 'inativo' : 'ativo';
    toggleContratoStatus({ id: contrato.id, novoStatus });
  };

  const calcularProximaFatura = (diaVencimento: number) => {
    const hoje = new Date();
    const proximaData = new Date(hoje.getFullYear(), hoje.getMonth(), diaVencimento);
    
    if (proximaData < hoje) {
      proximaData.setMonth(proximaData.getMonth() + 1);
    }
    
    return proximaData;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando contratos...</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contratos de Mensalidade</CardTitle>
              <CardDescription>
                Gerencie contratos recorrentes e automatize a geração de faturas
              </CardDescription>
            </div>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Contrato
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!contratos || contratos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum contrato cadastrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Crie contratos recorrentes para automatizar a geração de faturas mensais
              </p>
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Contrato
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-lg border bg-muted/50 p-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    Geração Automática:
                  </span>
                  <span className="text-muted-foreground">
                    Faturas são geradas automaticamente no dia 1º de cada mês às 8h
                  </span>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor Mensal</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Próxima Fatura</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contratos.map((contrato) => {
                    const proximaFatura = calcularProximaFatura(contrato.dia_vencimento);
                    
                    return (
                      <TableRow key={contrato.id}>
                        <TableCell className="font-medium">
                          {contrato.cliente?.nome}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(contrato.valor_mensal)}
                        </TableCell>
                        <TableCell>Dia {contrato.dia_vencimento}</TableCell>
                        <TableCell>
                          {format(proximaFatura, "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              contrato.status === 'ativo'
                                ? 'default'
                                : contrato.status === 'inativo'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {contrato.status === 'ativo'
                              ? 'Ativo'
                              : contrato.status === 'inativo'
                              ? 'Inativo'
                              : 'Cancelado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(contrato)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(contrato)}
                              >
                                <Power className="h-4 w-4 mr-2" />
                                {contrato.status === 'ativo' ? 'Desativar' : 'Ativar'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteContrato(contrato.id)}
                                className="text-destructive"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Cancelar Contrato
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <ContratoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contrato={selectedContrato}
      />
    </>
  );
}
