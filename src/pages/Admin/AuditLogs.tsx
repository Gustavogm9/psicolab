import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, Filter, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useImpersonationLogs, useAdminList, usePsychologistList } from "@/hooks/useImpersonationLogs";
import { toast } from "sonner";

export default function AuditLogs() {
  const [filters, setFilters] = useState({
    adminId: "",
    targetUserId: "",
    actionType: "all",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data: logsData, isLoading } = useImpersonationLogs({
    ...filters,
    page,
    pageSize: 50,
  });

  const { data: admins } = useAdminList();
  const { data: psychologists } = usePsychologistList();

  const handleExport = () => {
    if (!logsData?.logs || logsData.logs.length === 0) {
      toast.error("Nenhum log para exportar");
      return;
    }

    // Preparar dados CSV
    const headers = [
      "Data/Hora",
      "Admin",
      "Psicólogo Alvo",
      "Tipo de Ação",
      "IP",
      "Detalhes",
    ];

    const rows = logsData.logs.map((log) => [
      format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
      log.admin_name || "Admin",
      log.target_name || "Usuário",
      log.action_type,
      log.ip_address || "-",
      JSON.stringify(log.action_details || {}),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    toast.success("Logs exportados com sucesso");
  };

  const getActionTypeBadge = (actionType: string) => {
    switch (actionType) {
      case "start":
        return <Badge variant="default">Início</Badge>;
      case "stop":
        return <Badge variant="secondary">Término</Badge>;
      case "action":
        return <Badge variant="outline">Ação</Badge>;
      default:
        return <Badge>{actionType}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logs de Impersonificação</h1>
          <p className="text-muted-foreground">
            Auditoria completa de todas as sessões de impersonificação
          </p>
        </div>
        <Button onClick={handleExport} disabled={!logsData?.logs?.length}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Todos os acessos e ações realizadas durante impersonificação são
          registrados aqui para fins de auditoria e segurança.
        </AlertDescription>
      </Alert>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Administrador</Label>
              <Select
                value={filters.adminId}
                onValueChange={(value) =>
                  setFilters({ ...filters, adminId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {admins?.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Psicólogo Alvo</Label>
              <Select
                value={filters.targetUserId}
                onValueChange={(value) =>
                  setFilters({ ...filters, targetUserId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {psychologists?.map((psy) => (
                    <SelectItem key={psy.id} value={psy.id}>
                      {psy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Ação</Label>
              <Select
                value={filters.actionType}
                onValueChange={(value) =>
                  setFilters({ ...filters, actionType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="start">Início</SelectItem>
                  <SelectItem value="stop">Término</SelectItem>
                  <SelectItem value="action">Ação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <Input
                type="date"
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    startDate: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Logs ({logsData?.total || 0} registros)
            </CardTitle>
            {isLoading && (
              <div className="text-sm text-muted-foreground">Carregando...</div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Psicólogo Alvo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(logsData?.logs || []).map((log) => (
                <Collapsible
                  key={log.id}
                  open={expandedRow === log.id}
                  onOpenChange={(open) =>
                    setExpandedRow(open ? log.id : null)
                  }
                  asChild
                >
                  <>
                    <TableRow className="cursor-pointer">
                      <TableCell>
                        {format(
                          new Date(log.created_at),
                          "dd/MM/yyyy HH:mm:ss",
                          { locale: ptBR }
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {log.admin_name || "Admin"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {log.target_name || "Usuário"}
                        </div>
                      </TableCell>
                      <TableCell>{getActionTypeBadge(log.action_type)}</TableCell>
                      <TableCell>
                        <code className="text-xs">{log.ip_address || "-"}</code>
                      </TableCell>
                      <CollapsibleTrigger asChild>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            {expandedRow === log.id ? "Ocultar" : "Ver"}
                          </Button>
                        </TableCell>
                      </CollapsibleTrigger>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/50">
                          <div className="space-y-2 p-4">
                            <div>
                              <span className="font-semibold">User Agent:</span>
                              <p className="text-sm text-muted-foreground mt-1">
                                {log.user_agent || "-"}
                              </p>
                            </div>
                            <div>
                              <span className="font-semibold">Detalhes da Ação:</span>
                              <pre className="text-xs bg-background p-2 rounded mt-1 overflow-auto">
                                {JSON.stringify(log.action_details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}

               {!isLoading && (!logsData?.logs || logsData.logs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Nenhum log encontrado com os filtros aplicados
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Paginação */}
          {logsData && logsData.pages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, logsData.pages) }, (_, i) => i + 1).map(
                    (p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          onClick={() => setPage(p)}
                          isActive={page === p}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(logsData.pages, p + 1))}
                      className={
                        page === logsData.pages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
