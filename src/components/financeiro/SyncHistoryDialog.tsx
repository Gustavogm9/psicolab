import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { useAsaasSyncLogs } from "@/hooks/useAsaasSyncLogs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SyncHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SyncHistoryDialog({ open, onOpenChange }: SyncHistoryDialogProps) {
  const { logs, isLoading } = useAsaasSyncLogs(50);
  const [filtroTipo, setFiltroTipo] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const logsFiltrados = logs.filter(log => {
    if (filtroTipo === "all") return true;
    return log.tipo === filtroTipo;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Sincronizações</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="manual">Manuais</SelectItem>
                <SelectItem value="automatica">Automáticas</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground">
              {logsFiltrados.length} sincronização(ões) encontrada(s)
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando histórico...
            </div>
          ) : logsFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma sincronização encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Faturas</TableHead>
                  <TableHead className="text-right">Atualizadas</TableHead>
                  <TableHead className="text-right">Erros</TableHead>
                  <TableHead className="text-right">Duração</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsFiltrados.map((log) => {
                  const isExpanded = expandedRows.has(log.id);
                  const temErros = log.erros > 0;

                  return (
                    <Collapsible key={log.id} open={isExpanded} onOpenChange={() => toggleRow(log.id)}>
                      <TableRow>
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {format(new Date(log.timestamp), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(log.timestamp), "HH:mm:ss", { locale: ptBR })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.tipo === 'automatica' ? 'secondary' : 'outline'}>
                            {log.tipo === 'automatica' ? '🤖 Automática' : '👤 Manual'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{log.total_faturas}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">{log.atualizadas}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium">{log.erros}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {log.duracao_ms ? `${(log.duracao_ms / 1000).toFixed(2)}s` : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {temErros ? (
                            <XCircle className="h-5 w-5 text-red-500 inline" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-green-500 inline" />
                          )}
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={8} className="bg-muted/50">
                            <div className="p-4 space-y-2">
                              <h4 className="font-semibold text-sm">Detalhes da Sincronização</h4>
                              <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                                {JSON.stringify(log.detalhes, null, 2)}
                              </pre>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
