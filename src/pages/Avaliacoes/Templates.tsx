import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Clock, 
  Users, 
  Copy, 
  Edit,
  Trash2,
  FileText,
  BarChart3,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTemplates, useTemplateDelete } from "@/hooks/useTemplates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface Template {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  questoes: number;
  tempoEstimado: string;
  usosRecentes: number;
  status: "ativo" | "rascunho" | "arquivado";
  criadoEm: string;
  ultimoUso: string;
}

const Templates = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<any | null>(null);
  
  const { data: templates, isLoading } = useTemplates();
  const { mutate: deleteTemplate, isPending: isDeleting } = useTemplateDelete();

  const templatesMock = [
    {
      id: "1",
      nome: "Questionário de Clima Organizacional",
      descricao: "Avaliação completa do ambiente de trabalho e satisfação dos colaboradores",
      categoria: "Clima Organizacional",
      questoes: 45,
      tempoEstimado: "15-20 min",
      usosRecentes: 12,
      status: "ativo",
      criadoEm: "2024-01-15",
      ultimoUso: "2024-03-15"
    },
    {
      id: "2",
      nome: "Avaliação de Estresse Ocupacional",
      descricao: "Identificação de fatores de estresse e riscos psicossociais no ambiente de trabalho",
      categoria: "Estresse",
      questoes: 32,
      tempoEstimado: "10-15 min",
      usosRecentes: 8,
      status: "ativo",
      criadoEm: "2024-02-01",
      ultimoUso: "2024-03-10"
    },
    {
      id: "3",
      nome: "Questionário de Engagement",
      descricao: "Medição do nível de engajamento e motivação dos colaboradores",
      categoria: "Engagement",
      questoes: 28,
      tempoEstimado: "8-12 min",
      usosRecentes: 15,
      status: "ativo",
      criadoEm: "2024-01-20",
      ultimoUso: "2024-03-14"
    },
    {
      id: "4",
      nome: "Avaliação de Liderança",
      descricao: "Template em desenvolvimento para avaliação de estilos de liderança",
      categoria: "Liderança",
      questoes: 22,
      tempoEstimado: "12-18 min",
      usosRecentes: 3,
      status: "rascunho",
      criadoEm: "2024-03-01",
      ultimoUso: "2024-03-05"
    }
  ];

  // Funções para implementar as funcionalidades dos botões
  const handleCriarTemplate = () => {
    navigate('/avaliacoes/templates/novo');
  };

  const handleUsarTemplate = (template: any) => {
    toast.success(`Nova avaliação criada baseada no template "${template.nome}"`);
    navigate('/avaliacoes/criar');
  };

  const handleEditarTemplate = (template: any) => {
    toast.success(`Abrindo editor para "${template.nome}"`);
    navigate(`/avaliacoes/templates/${template.id}/editar`);
  };

  const handleDeletarTemplate = (template: any) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmarDelecao = () => {
    if (!templateToDelete) return;
    deleteTemplate(templateToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setTemplateToDelete(null);
      }
    });
  };

  const categorias = ["Todas", "Clima Organizacional", "Estresse", "Engagement", "Liderança"];

  const templatesFiltrados = (templates || []).filter((template: any) => {
    const matchBusca = template.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      template.descricao.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = !filtroCategoria || filtroCategoria === "Todas" || template.categoria === filtroCategoria;
    return matchBusca && matchCategoria;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "rascunho":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "arquivado":
        return "bg-gray-500/10 text-gray-700 border-gray-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo";
      case "rascunho":
        return "Rascunho";
      case "arquivado":
        return "Arquivado";
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
            <h1 className="text-3xl font-bold">Templates de Avaliação</h1>
            <p className="text-muted-foreground">
              Gerencie e crie templates para suas avaliações psicossociais
            </p>
          </div>
          <Button onClick={handleCriarTemplate} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Template
          </Button>
        </div>

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
                    placeholder="Buscar templates..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {categorias.map((categoria) => (
                  <Button
                    key={categoria}
                    variant={filtroCategoria === categoria ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroCategoria(categoria === "Todas" ? "" : categoria)}
                  >
                    {categoria}
                  </Button>
                ))}
              </div>
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

        {/* Templates Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesFiltrados.map((template: any) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <Badge className={getStatusColor(template.status)}>
                      {getStatusLabel(template.status)}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{template.nome}</CardTitle>
                <CardDescription>{template.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    <span>{template.numero_questoes || 0} questões</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{template.tempo_estimado || 0} min</span>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Categoria: <span className="font-medium">{template.categoria}</span></p>
                  <p>Usos recentes: <span className="font-medium">{template.uso_recente || 0}</span></p>
                  {template.ultima_utilizacao && (
                    <p>Último uso: <span className="font-medium">{new Date(template.ultima_utilizacao).toLocaleDateString('pt-BR')}</span></p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-1"
                    onClick={() => handleUsarTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                    Usar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-1"
                    onClick={() => handleEditarTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeletarTemplate(template)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {!isLoading && templatesFiltrados.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Não encontramos templates que correspondam aos seus filtros.
              </p>
              <Button onClick={() => {setBusca(""); setFiltroCategoria("");}}>
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modal de confirmação de deleção */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o template "{templateToDelete?.nome}"? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmarDelecao}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Excluindo...
                  </>
                ) : (
                  'Excluir'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Templates;