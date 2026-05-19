import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Plus, 
  Play, 
  Pause, 
  BarChart3, 
  Users, 
  Edit, 
  AlertCircle,
  Calendar,
  Loader2,
  Share2,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAvaliacoes } from "@/hooks/useAvaliacoes";
import { useAvaliacaoUpdate } from "@/hooks/useAvaliacaoUpdate";
import { useAvaliacaoDelete } from "@/hooks/useAvaliacaoDelete";
import { CompartilharAvaliacaoDialog } from "@/components/avaliacoes/CompartilharAvaliacaoDialog";
import { FeatureExplanation } from "@/components/shared/FeatureExplanation";

const Avaliacoes = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [avaliacaoCompartilhar, setAvaliacaoCompartilhar] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [avaliacaoToDelete, setAvaliacaoToDelete] = useState<any>(null);
  
  const { data: avaliacoes, isLoading } = useAvaliacoes();
  const { mutate: updateAvaliacao } = useAvaliacaoUpdate();
  const { mutate: deleteAvaliacao, isPending: isDeleting } = useAvaliacaoDelete();

  const avaliacoesFiltradas = useMemo(() => {
    if (!avaliacoes) return [];
    
    return avaliacoes.filter((avaliacao: any) => {
      const matchBusca = avaliacao.nome.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === "todos" || avaliacao.status === filtroStatus;
      const matchTipo = filtroTipo === "todos" || avaliacao.tipo === filtroTipo;
      return matchBusca && matchStatus && matchTipo;
    });
  }, [avaliacoes, busca, filtroStatus, filtroTipo]);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ativa' ? 'pausada' : 'ativa';
    updateAvaliacao({ id, status: newStatus as any });
  };

  const handleDeletarAvaliacao = (avaliacao: any) => {
    setAvaliacaoToDelete(avaliacao);
    setDeleteDialogOpen(true);
  };

  const confirmarDelecao = () => {
    if (!avaliacaoToDelete) return;
    deleteAvaliacao(avaliacaoToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setAvaliacaoToDelete(null);
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativa":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "rascunho":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "pausada":
        return "bg-orange-500/10 text-orange-700 border-orange-200";
      case "finalizada":
        return "bg-gray-500/10 text-gray-700 border-gray-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativa":
        return "Ativa";
      case "rascunho":
        return "Rascunho";
      case "pausada":
        return "Pausada";
      case "finalizada":
        return "Finalizada";
      default:
        return "Desconhecido";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gradient flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                Avaliações Internas
              </h1>
              <Badge variant="secondary">CLIENTES</Badge>
            </div>
            <p className="text-muted-foreground">
              Avalie clima, bem-estar e satisfação dos colaboradores dos seus clientes
            </p>
          </div>
          <Button onClick={() => navigate("/avaliacoes/criar")} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Avaliação
          </Button>
        </div>

        {/* Feature Explanation */}
        <FeatureExplanation type="pesquisas" />

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar avaliações..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="pausada">Pausada</SelectItem>
                  <SelectItem value="finalizada">Finalizada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Clima Organizacional">Clima Organizacional</SelectItem>
                  <SelectItem value="Estresse">Estresse</SelectItem>
                  <SelectItem value="Engagement">Engagement</SelectItem>
                  <SelectItem value="Burnout">Burnout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        )}

        {/* Avaliações List */}
        {!isLoading && (
          <div className="space-y-4">
            {avaliacoesFiltradas.map((avaliacao: any) => (
              <Card key={avaliacao.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{avaliacao.nome}</h3>
                        <Badge className={getStatusColor(avaliacao.status)}>
                          {getStatusLabel(avaliacao.status)}
                        </Badge>
                        <Badge variant="outline">{avaliacao.tipo}</Badge>
                        {avaliacao.cliente?.nome && (
                          <span className="text-sm text-muted-foreground">• {avaliacao.cliente.nome}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{avaliacao.participantes_responderam || 0}/{avaliacao.participantes_total || 0} responderam</span>
                        </div>
                        {avaliacao.data_inicio && avaliacao.data_fim && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(avaliacao.data_inicio).toLocaleDateString('pt-BR')} - {new Date(avaliacao.data_fim).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                      
                      {avaliacao.descricao && (
                        <p className="text-sm text-muted-foreground mt-2">{avaliacao.descricao}</p>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{avaliacao.progresso || 0}%</div>
                          <div className="text-sm text-muted-foreground">Progresso</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/avaliacoes/${avaliacao.id}/relatorio`)}
                          className="gap-1"
                        >
                          <BarChart3 className="h-4 w-4" />
                          Ver Relatório
                        </Button>
                        {avaliacao.status === 'ativa' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setAvaliacaoCompartilhar(avaliacao)}
                            className="gap-1"
                          >
                            <Share2 className="h-4 w-4" />
                            Compartilhar
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/avaliacoes/editar/${avaliacao.id}`)}
                          className="gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                        {(avaliacao.status === 'ativa' || avaliacao.status === 'pausada') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleStatus(avaliacao.id, avaliacao.status)}
                          >
                            {avaliacao.status === "ativa" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeletarAvaliacao(avaliacao)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && avaliacoesFiltradas.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {busca || (filtroStatus !== "todos") || (filtroTipo !== "todos")
                  ? "Não há avaliações que correspondam aos filtros selecionados."
                  : "Você ainda não criou nenhuma avaliação."}
              </p>
              <Button onClick={() => navigate("/avaliacoes/criar")}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Avaliação
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CompartilharAvaliacaoDialog
        avaliacao={avaliacaoCompartilhar}
        open={!!avaliacaoCompartilhar}
        onOpenChange={(open) => !open && setAvaliacaoCompartilhar(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Excluir Avaliação
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Você está prestes a excluir a avaliação <strong>"{avaliacaoToDelete?.nome}"</strong>.
              </p>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
                <p className="font-medium text-destructive mb-2">⚠️ Esta ação irá excluir permanentemente:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Todas as questões da avaliação</li>
                  <li>Todos os participantes convidados</li>
                  <li><strong>Todas as {avaliacaoToDelete?.participantes_responderam || 0} respostas recebidas</strong></li>
                </ul>
              </div>
              <p className="text-destructive font-medium">
                Esta ação NÃO pode ser desfeita.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarDelecao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sim, excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Avaliacoes;
