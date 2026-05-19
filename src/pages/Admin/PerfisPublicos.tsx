import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Search, TrendingUp, Users, MousePointerClick, Mail } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminPerfisPublicos() {
  const [searchTerm, setSearchTerm] = useState("");

  // Query para buscar todos os perfis públicos
  const { data: perfis, isLoading } = useQuery({
    queryKey: ["admin-perfis-publicos", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("perfis_publicos")
        .select(`
          *,
          perfil_publico_planos(nome, preco_mensal)
        `)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Query para stats consolidados
  const { data: stats } = useQuery({
    queryKey: ["admin-perfis-stats"],
    queryFn: async () => {
      const { data: perfisAtivos, error: error1 } = await supabase
        .from("perfis_publicos")
        .select("id", { count: "exact" })
        .eq("ativo", true);

      const { data: analytics, error: error2 } = await supabase
        .from("perfil_publico_analytics")
        .select("*");

      const { data: leads, error: error3 } = await supabase
        .from("perfil_publico_leads")
        .select("id", { count: "exact" });

      if (error1 || error2 || error3) throw error1 || error2 || error3;

      const totalVisualizacoes = analytics?.length || 0;
      const totalCliques = analytics?.filter(a => a.tipo_evento === 'cta_click').length || 0;

      return {
        perfisAtivos: perfisAtivos?.length || 0,
        totalVisualizacoes,
        totalCliques,
        totalLeads: leads?.length || 0,
      };
    },
  });

  const handleToggleAtivo = async (perfilId: string, ativo: boolean) => {
    const { error } = await supabase
      .from("perfis_publicos")
      .update({ ativo: !ativo })
      .eq("id", perfilId);

    if (error) {
      toast.error("Erro ao atualizar status do perfil");
    } else {
      toast.success(`Perfil ${!ativo ? "ativado" : "desativado"} com sucesso`);
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Perfis Públicos</h1>
            <p className="text-muted-foreground">Painel administrativo para gestão de perfis</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perfis Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.perfisAtivos || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visualizações</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalVisualizacoes || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cliques CTA</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCliques || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Tabela */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : !perfis || perfis.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum perfil encontrado</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perfis.map((perfil) => (
                    <TableRow key={perfil.id}>
                      <TableCell className="font-medium">{perfil.slug}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{perfil.slug}</code>
                      </TableCell>
                      <TableCell>
                        {perfil.plano_id ? (
                          <Badge variant="secondary">Premium</Badge>
                        ) : (
                          <Badge variant="outline">Gratuito</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {perfil.ativo ? (
                          <Badge variant="default">Ativo</Badge>
                        ) : (
                          <Badge variant="destructive">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(perfil.created_at), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/perfil/${perfil.slug}`, "_blank")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={perfil.ativo ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleAtivo(perfil.id, perfil.ativo)}
                        >
                          {perfil.ativo ? "Desativar" : "Ativar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
