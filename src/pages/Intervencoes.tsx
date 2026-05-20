import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Plus, BookOpen, Heart, Shield, Trash2, Calendar, Clock, Users, Target, TrendingUp, CalendarPlus, Paperclip } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Anexo } from "@/types/anexo";
import { AnexosUploader } from "@/components/intervencoes/AnexosUploader";
import { useIntervencoes } from "@/hooks/useIntervencoes";
import { useIntervencaoCreate } from "@/hooks/useIntervencaoCreate";
import { useIntervencaoUpdate } from "@/hooks/useIntervencaoUpdate";
import { useIntervencaoDelete } from "@/hooks/useIntervencaoDelete";
import { useBibliotecaIntervencoes } from "@/hooks/useBibliotecaIntervencoes";
import { useBibliotecaCreate } from "@/hooks/useBibliotecaCreate";
import { useBibliotecaUpdate } from "@/hooks/useBibliotecaUpdate";
import { useBibliotecaDelete } from "@/hooks/useBibliotecaDelete";
import { useClientes } from "@/hooks/useClientes";
import { useCategoriasPersonalizadas } from "@/hooks/useCategoriasPersonalizadas";
import { CategoriaSelector } from "@/components/shared/CategoriaSelector";
import { AgendarEventoIntervencaoDialog } from "@/components/intervencoes/AgendarEventoIntervencaoDialog";
import { useAuth } from "@/contexts/AuthContext";

const Intervencoes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCliente, setSelectedCliente] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAgendarEventoOpen, setIsAgendarEventoOpen] = useState(false);
  const [isBibliotecaModalOpen, setIsBibliotecaModalOpen] = useState(false);
  const [isBibliotecaEditModalOpen, setIsBibliotecaEditModalOpen] = useState(false);
  const [isBibliotecaDeleteOpen, setIsBibliotecaDeleteOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<any>(null);
  const [selectedBibliotecaItem, setSelectedBibliotecaItem] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [bibliotecaSearch, setBibliotecaSearch] = useState("");
  const [bibliotecaCategory, setBibliotecaCategory] = useState("");
  const [isImplementing, setIsImplementing] = useState<{[key: string]: boolean}>({});
  
  // Form state
  const [formData, setFormData] = useState({
    titulo: "",
    categoria: "",
    descricao: "",
    status: "planejada",
    prioridade: "media",
    data_inicio: "",
    data_fim: "",
    duracao_estimada: "",
    responsavel: "",
    participantes: "",
    resultados_esperados: "",
    cliente_id: "",
    anexos: [] as Anexo[]
  });

  // Biblioteca form state
  const [bibliotecaFormData, setbibliotecaFormData] = useState({
    titulo: "",
    categoria: "",
    descricao: "",
    impacto: "medio",
    esforco: "medio",
    duracao_estimada: "",
    custo_estimado: "",
  });

  // Data fetching
  const { data: intervencoes, isLoading } = useIntervencoes({
    busca: searchTerm,
    categoria: selectedCategory || undefined,
    status: selectedStatus || undefined,
    cliente: selectedCliente || undefined
  });

  const { data: biblioteca } = useBibliotecaIntervencoes({
    busca: bibliotecaSearch,
    categoria: bibliotecaCategory || undefined
  });

  const { data: clientes } = useClientes();
  const { data: categoriasRaw = [] } = useCategoriasPersonalizadas({ tipo: 'intervencao' });
  const categorias = categoriasRaw.reduce<any[]>((acc, current) => {
    const isDuplicated = acc.some(
      (item) => item.nome.toLowerCase() === current.nome.toLowerCase()
    );
    return isDuplicated ? acc : [...acc, current];
  }, []);

  // Mutations
  const createMutation = useIntervencaoCreate();
  const updateMutation = useIntervencaoUpdate();
  const deleteMutation = useIntervencaoDelete();
  const bibliotecaCreateMutation = useBibliotecaCreate();
  const bibliotecaUpdateMutation = useBibliotecaUpdate();
  const bibliotecaDeleteMutation = useBibliotecaDelete();

  const { effectiveUserId } = useAuth();

  // Set current user ID for progresso entries
  useEffect(() => {
    if (effectiveUserId) {
      setCurrentUserId(effectiveUserId);
    }
  }, [effectiveUserId]);

  const resetForm = () => {
    setFormData({
      titulo: "",
      categoria: "",
      descricao: "",
      status: "planejada",
      prioridade: "media",
      data_inicio: "",
      data_fim: "",
      duracao_estimada: "",
      responsavel: "",
      participantes: "",
      resultados_esperados: "",
      cliente_id: "",
      anexos: [] as Anexo[]
    });
  };

  const handleCreateIntervention = async () => {
    if (!formData.titulo.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    if (!formData.categoria) {
      toast.error('Categoria é obrigatória');
      return;
    }
    if (!formData.cliente_id) {
      toast.error('Cliente é obrigatório');
      return;
    }

    const data = {
      titulo: formData.titulo,
      categoria: formData.categoria,
      descricao: formData.descricao || undefined,
      status: formData.status,
      prioridade: formData.prioridade,
      data_inicio: formData.data_inicio || undefined,
      data_fim: formData.data_fim || undefined,
      duracao_estimada: formData.duracao_estimada ? parseInt(formData.duracao_estimada) : undefined,
      responsavel: formData.responsavel || undefined,
      participantes: formData.participantes ? formData.participantes.split(',').map(p => p.trim()) : undefined,
      resultados_esperados: formData.resultados_esperados || undefined,
      cliente_id: formData.cliente_id || undefined,
      anexos: formData.anexos.length > 0 ? formData.anexos : undefined
    };

    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEditIntervention = () => {
    if (!selectedIntervention) return;
    
    setFormData({
      titulo: selectedIntervention.titulo,
      categoria: selectedIntervention.categoria,
      descricao: selectedIntervention.descricao || "",
      status: selectedIntervention.status,
      prioridade: selectedIntervention.prioridade,
      data_inicio: selectedIntervention.data_inicio || "",
      data_fim: selectedIntervention.data_fim || "",
      duracao_estimada: selectedIntervention.duracao_estimada?.toString() || "",
      responsavel: selectedIntervention.responsavel || "",
      participantes: selectedIntervention.participantes?.join(', ') || "",
      resultados_esperados: selectedIntervention.resultados_esperados || "",
      cliente_id: selectedIntervention.cliente_id || "",
      anexos: (selectedIntervention.anexos && Array.isArray(selectedIntervention.anexos) 
        ? selectedIntervention.anexos as Anexo[] 
        : [])
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateIntervention = async () => {
    if (!selectedIntervention) return;
    if (!formData.titulo.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    if (!formData.cliente_id) {
      toast.error('Cliente é obrigatório');
      return;
    }

    const data = {
      titulo: formData.titulo,
      categoria: formData.categoria,
      descricao: formData.descricao || undefined,
      status: formData.status,
      prioridade: formData.prioridade,
      data_inicio: formData.data_inicio || undefined,
      data_fim: formData.data_fim || undefined,
      duracao_estimada: formData.duracao_estimada ? parseInt(formData.duracao_estimada) : undefined,
      responsavel: formData.responsavel || undefined,
      participantes: formData.participantes ? formData.participantes.split(',').map(p => p.trim()) : undefined,
      resultados_esperados: formData.resultados_esperados || undefined,
      cliente_id: formData.cliente_id || undefined,
      anexos: formData.anexos.length > 0 ? formData.anexos : undefined
    };

    await updateMutation.mutateAsync({ id: selectedIntervention.id, data });
    setIsEditModalOpen(false);
    setSelectedIntervention(null);
    resetForm();
  };

  const handleDeleteIntervention = async () => {
    if (!selectedIntervention) return;
    await deleteMutation.mutateAsync(selectedIntervention.id);
    setIsDeleteDialogOpen(false);
    setSelectedIntervention(null);
  };

  const handleViewDetails = (intervencao: any) => {
    setSelectedIntervention(intervencao);
    setIsDetailsModalOpen(true);
  };

  const handleImplementAction = async (acao: any) => {
    setIsImplementing(prev => ({ ...prev, [acao.id]: true }));
    
    try {
      const data = {
        titulo: acao.titulo,
        categoria: acao.categoria,
        descricao: acao.descricao,
        duracao_estimada: acao.duracao_estimada,
        resultados_esperados: acao.descricao
      };

      await createMutation.mutateAsync(data);
    } catch (error) {
      toast.error("Erro ao implementar ação. Tente novamente.");
    } finally {
      setIsImplementing(prev => ({ ...prev, [acao.id]: false }));
    }
  };

  const handleCreateBiblioteca = async () => {
    if (!bibliotecaFormData.titulo.trim() || !bibliotecaFormData.categoria) {
      toast.error('Título e categoria são obrigatórios');
      return;
    }

    await bibliotecaCreateMutation.mutateAsync({
      titulo: bibliotecaFormData.titulo,
      categoria: bibliotecaFormData.categoria,
      descricao: bibliotecaFormData.descricao || undefined,
      impacto: bibliotecaFormData.impacto,
      esforco: bibliotecaFormData.esforco,
      duracao_estimada: bibliotecaFormData.duracao_estimada ? parseInt(bibliotecaFormData.duracao_estimada) : undefined,
      custo_estimado: bibliotecaFormData.custo_estimado ? parseFloat(bibliotecaFormData.custo_estimado) : undefined,
    });
    
    setIsBibliotecaModalOpen(false);
    setbibliotecaFormData({
      titulo: "",
      categoria: "",
      descricao: "",
      impacto: "medio",
      esforco: "medio",
      duracao_estimada: "",
      custo_estimado: "",
    });
  };

  const handleEditBiblioteca = (item: any) => {
    setSelectedBibliotecaItem(item);
    setbibliotecaFormData({
      titulo: item.titulo,
      categoria: item.categoria,
      descricao: item.descricao || "",
      impacto: item.impacto || "medio",
      esforco: item.esforco || "medio",
      duracao_estimada: item.duracao_estimada?.toString() || "",
      custo_estimado: item.custo_estimado?.toString() || "",
    });
    setIsBibliotecaEditModalOpen(true);
  };

  const handleUpdateBiblioteca = async () => {
    if (!selectedBibliotecaItem) return;
    if (!bibliotecaFormData.titulo.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    await bibliotecaUpdateMutation.mutateAsync({
      id: selectedBibliotecaItem.id,
      titulo: bibliotecaFormData.titulo,
      categoria: bibliotecaFormData.categoria,
      descricao: bibliotecaFormData.descricao || undefined,
      impacto: bibliotecaFormData.impacto,
      esforco: bibliotecaFormData.esforco,
      duracao_estimada: bibliotecaFormData.duracao_estimada ? parseInt(bibliotecaFormData.duracao_estimada) : undefined,
      custo_estimado: bibliotecaFormData.custo_estimado ? parseFloat(bibliotecaFormData.custo_estimado) : undefined,
    });

    setIsBibliotecaEditModalOpen(false);
    setSelectedBibliotecaItem(null);
  };

  const handleDeleteBiblioteca = async () => {
    if (!selectedBibliotecaItem) return;
    await bibliotecaDeleteMutation.mutateAsync(selectedBibliotecaItem.id);
    setIsBibliotecaDeleteOpen(false);
    setSelectedBibliotecaItem(null);
  };

  const statusColors: Record<string, string> = {
    "planejada": "bg-yellow-100 text-yellow-800",
    "em_andamento": "bg-blue-100 text-blue-800",
    "concluida": "bg-green-100 text-green-800",
    "cancelada": "bg-gray-100 text-gray-800"
  };

  const prioridadeColors: Record<string, string> = {
    "baixa": "bg-gray-100 text-gray-800",
    "media": "bg-blue-100 text-blue-800",
    "alta": "bg-orange-100 text-orange-800",
    "critica": "bg-red-100 text-red-800"
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Central de Intervenções</h1>
            <p className="text-muted-foreground">Gerencie ações para melhorar o clima organizacional</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="bright" className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Intervenção
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Intervenção</DialogTitle>
                <DialogDescription>
                  Configure uma nova ação para melhorar o ambiente de trabalho
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input 
                      id="titulo" 
                      placeholder="Nome da intervenção" 
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <CategoriaSelector
                      tipo="intervencao"
                      value={formData.categoria}
                      onChange={(value) => setFormData({ ...formData, categoria: value })}
                      allowCreate={true}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea 
                    id="descricao" 
                    placeholder="Descreva os objetivos e metodologia" 
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planejada">Planejada</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select value={formData.prioridade} onValueChange={(value) => setFormData({ ...formData, prioridade: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duracao_estimada">Duração (dias)</Label>
                    <Input 
                      id="duracao_estimada" 
                      type="number"
                      placeholder="30" 
                      value={formData.duracao_estimada}
                      onChange={(e) => setFormData({ ...formData, duracao_estimada: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_inicio">Data de Início</Label>
                    <Input 
                      id="data_inicio" 
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_fim">Data de Fim</Label>
                    <Input 
                      id="data_fim" 
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cliente_id">Cliente *</Label>
                    <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes?.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Input 
                      id="responsavel" 
                      placeholder="Nome do responsável" 
                      value={formData.responsavel}
                      onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participantes">Participantes (separados por vírgula)</Label>
                  <Input 
                    id="participantes" 
                    placeholder="João, Maria, Pedro" 
                    value={formData.participantes}
                    onChange={(e) => setFormData({ ...formData, participantes: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resultados_esperados">Resultados Esperados</Label>
                  <Textarea 
                    id="resultados_esperados" 
                    placeholder="Descreva os resultados esperados" 
                    value={formData.resultados_esperados}
                    onChange={(e) => setFormData({ ...formData, resultados_esperados: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Anexos</Label>
                  <AnexosUploader
                    anexos={formData.anexos}
                    onChange={(anexos) => setFormData({ ...formData, anexos })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="bright" 
                    onClick={handleCreateIntervention}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Criando..." : "Criar Intervenção"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="minhas-intervencoes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="minhas-intervencoes">Minhas Intervenções</TabsTrigger>
            <TabsTrigger value="biblioteca">Biblioteca de Ações</TabsTrigger>
          </TabsList>

          {/* Minhas Intervenções */}
          <TabsContent value="minhas-intervencoes" className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar intervenções..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory || "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? "" : val)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categorias?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus || "all"} onValueChange={(val) => setSelectedStatus(val === "all" ? "" : val)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="planejada">Planejada</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cards de Intervenções */}
            {isLoading ? (
              <div className="text-center py-12">Carregando...</div>
            ) : !intervencoes || intervencoes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhuma intervenção encontrada. Crie sua primeira intervenção!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {intervencoes.map((intervencao) => (
                  <Card key={intervencao.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">{intervencao.titulo}</CardTitle>
                          <CardDescription className="line-clamp-2">{intervencao.descricao}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge className={statusColors[intervencao.status]}>
                          {intervencao.status}
                        </Badge>
                        {/* Overdue indicator */}
                        {(intervencao.status === 'em_andamento' || intervencao.status === 'planejada') && 
                         intervencao.data_fim && 
                         new Date(intervencao.data_fim) < new Date() && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            ⚠️ Atrasada
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {intervencao.categoria}
                        </Badge>
                        {intervencao.clientes && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            🏢 {intervencao.clientes.nome}
                          </Badge>
                        )}
                        {intervencao.anexos && Array.isArray(intervencao.anexos) && intervencao.anexos.length > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <Paperclip className="w-3 h-3" />
                            {intervencao.anexos.length}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {intervencao.duracao_estimada && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{intervencao.duracao_estimada} dias</span>
                          </div>
                        )}
                        {intervencao.participantes && intervencao.participantes.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{intervencao.participantes.length} pessoas</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewDetails(intervencao)}
                        >
                          Ver Detalhes
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedIntervention(intervencao);
                            handleEditIntervention();
                          }}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setSelectedIntervention(intervencao);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => {
                          setSelectedIntervention(intervencao);
                          setIsAgendarEventoOpen(true);
                        }}
                      >
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Agendar Evento
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Biblioteca de Ações */}
          <TabsContent value="biblioteca" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar ações..."
                  value={bibliotecaSearch}
                  onChange={(e) => setBibliotecaSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={bibliotecaCategory || "all"} onValueChange={(val) => setBibliotecaCategory(val === "all" ? "" : val)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categorias?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setIsBibliotecaModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Ação
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {biblioteca?.map((acao) => {
                const Icon = BookOpen;
                const isCustom = acao.consultora_id === currentUserId;
                return (
                  <Card key={acao.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{acao.titulo}</CardTitle>
                          <CardDescription className="line-clamp-2">{acao.descricao}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">
                          {acao.categoria}
                        </Badge>
                        {isCustom && (
                          <Badge variant="secondary" className="text-xs">
                            Customizada
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {acao.esforco && (
                          <div>
                            <span className="text-muted-foreground">Esforço:</span>
                            <span className="font-medium ml-1 capitalize">{acao.esforco}</span>
                          </div>
                        )}
                        {acao.impacto && (
                          <div>
                            <span className="text-muted-foreground">Impacto:</span>
                            <span className="font-medium ml-1 capitalize">{acao.impacto}</span>
                          </div>
                        )}
                        {acao.duracao_estimada && (
                          <div>
                            <span className="text-muted-foreground">Duração:</span>
                            <span className="font-medium ml-1">{acao.duracao_estimada}h</span>
                          </div>
                        )}
                        {acao.custo_estimado && (
                          <div>
                            <span className="text-muted-foreground">Custo:</span>
                            <span className="font-medium ml-1">R$ {Number(acao.custo_estimado).toFixed(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Button 
                          variant="bright" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleImplementAction(acao)}
                          disabled={isImplementing[acao.id]}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {isImplementing[acao.id] ? "Implementando..." : "Implementar"}
                        </Button>
                        {isCustom && (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleEditBiblioteca(acao)}
                            >
                              Editar
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                setSelectedBibliotecaItem(acao);
                                setIsBibliotecaDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de Detalhes */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Intervenção</DialogTitle>
            </DialogHeader>
            {selectedIntervention && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{selectedIntervention.titulo}</h3>
                  <div className="flex gap-2">
                    <Badge className={statusColors[selectedIntervention.status]}>
                      {selectedIntervention.status}
                    </Badge>
                    <Badge className={prioridadeColors[selectedIntervention.prioridade]}>
                      {selectedIntervention.prioridade}
                    </Badge>
                    <Badge variant="outline">
                      {selectedIntervention.categoria}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {selectedIntervention.descricao && (
                    <div>
                      <h4 className="font-medium mb-2">Descrição</h4>
                      <p className="text-muted-foreground">{selectedIntervention.descricao}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    {selectedIntervention.duracao_estimada && (
                      <div>
                        <h4 className="font-medium mb-1">Duração Estimada</h4>
                        <p className="text-muted-foreground">{selectedIntervention.duracao_estimada} dias</p>
                      </div>
                    )}
                    {selectedIntervention.responsavel && (
                      <div>
                        <h4 className="font-medium mb-1">Responsável</h4>
                        <p className="text-muted-foreground">{selectedIntervention.responsavel}</p>
                      </div>
                    )}
                  </div>

                  {selectedIntervention.clientes && (
                    <div>
                      <h4 className="font-medium mb-1">Cliente</h4>
                      <p className="text-muted-foreground">{selectedIntervention.clientes.nome}</p>
                    </div>
                  )}
                  
                  {selectedIntervention.participantes && selectedIntervention.participantes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Participantes</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedIntervention.participantes.map((p: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedIntervention.resultados_esperados && (
                    <div>
                      <h4 className="font-medium mb-2">Resultados Esperados</h4>
                      <p className="text-muted-foreground">{selectedIntervention.resultados_esperados}</p>
                    </div>
                  )}

                  {selectedIntervention.anexos && Array.isArray(selectedIntervention.anexos) && selectedIntervention.anexos.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Anexos</h4>
                      <AnexosUploader
                        anexos={selectedIntervention.anexos as Anexo[]}
                        onChange={() => {}}
                        intervencaoId={selectedIntervention.id}
                        readOnly={true}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                    Fechar
                  </Button>
                  <Button onClick={() => {
                    setIsDetailsModalOpen(false);
                    handleEditIntervention();
                  }}>
                    Editar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Edição */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Intervenção</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Same form fields as create modal */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-titulo">Título *</Label>
                  <Input 
                    id="edit-titulo" 
                    placeholder="Nome da intervenção" 
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-categoria">Categoria *</Label>
                  <CategoriaSelector
                    tipo="intervencao"
                    value={formData.categoria}
                    onChange={(value) => setFormData({ ...formData, categoria: value })}
                    allowCreate={true}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-descricao">Descrição</Label>
                <Textarea 
                  id="edit-descricao" 
                  placeholder="Descreva os objetivos e metodologia" 
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planejada">Planejada</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-prioridade">Prioridade</Label>
                  <Select value={formData.prioridade} onValueChange={(value) => setFormData({ ...formData, prioridade: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-duracao">Duração (dias)</Label>
                  <Input 
                    id="edit-duracao" 
                    type="number"
                    placeholder="30" 
                    value={formData.duracao_estimada}
                    onChange={(e) => setFormData({ ...formData, duracao_estimada: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-data_inicio">Data de Início</Label>
                  <Input 
                    id="edit-data_inicio" 
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-data_fim">Data de Fim</Label>
                  <Input 
                    id="edit-data_fim" 
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cliente_id">Cliente *</Label>
                  <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes?.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-responsavel">Responsável</Label>
                  <Input 
                    id="edit-responsavel" 
                    placeholder="Nome do responsável" 
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-participantes">Participantes (separados por vírgula)</Label>
                <Input 
                  id="edit-participantes" 
                  placeholder="João, Maria, Pedro" 
                  value={formData.participantes}
                  onChange={(e) => setFormData({ ...formData, participantes: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-resultados_esperados">Resultados Esperados</Label>
                <Textarea 
                  id="edit-resultados_esperados" 
                  placeholder="Descreva os resultados esperados" 
                  value={formData.resultados_esperados}
                  onChange={(e) => setFormData({ ...formData, resultados_esperados: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Anexos</Label>
                <AnexosUploader
                  anexos={formData.anexos}
                  onChange={(anexos) => setFormData({ ...formData, anexos })}
                  intervencaoId={selectedIntervention?.id}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setIsEditModalOpen(false); 
                    setSelectedIntervention(null); 
                    resetForm(); 
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdateIntervention}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alert Dialog de Delete */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A intervenção será permanentemente excluída.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedIntervention(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteIntervention}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de Agendar Evento */}
        {selectedIntervention && (
          <AgendarEventoIntervencaoDialog
            intervencao={selectedIntervention}
            open={isAgendarEventoOpen}
            onOpenChange={setIsAgendarEventoOpen}
          />
        )}

        {/* Dialog de Criar Ação na Biblioteca */}
        <Dialog open={isBibliotecaModalOpen} onOpenChange={setIsBibliotecaModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Ação Customizada</DialogTitle>
              <DialogDescription>
                Crie uma ação reutilizável para sua biblioteca pessoal
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bib-titulo">Título *</Label>
                  <Input
                    id="bib-titulo"
                    value={bibliotecaFormData.titulo}
                    onChange={(e) => setbibliotecaFormData({ ...bibliotecaFormData, titulo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bib-categoria">Categoria *</Label>
                  <CategoriaSelector
                    tipo="intervencao"
                    value={bibliotecaFormData.categoria}
                    onChange={(value) => setbibliotecaFormData({ ...bibliotecaFormData, categoria: value })}
                    allowCreate={true}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bib-descricao">Descrição</Label>
                <Textarea
                  id="bib-descricao"
                  value={bibliotecaFormData.descricao}
                  onChange={(e) => setbibliotecaFormData({ ...bibliotecaFormData, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bib-impacto">Impacto</Label>
                  <Select value={bibliotecaFormData.impacto} onValueChange={(value) => setbibliotecaFormData({ ...bibliotecaFormData, impacto: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixo">Baixo</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bib-esforco">Esforço</Label>
                  <Select value={bibliotecaFormData.esforco} onValueChange={(value) => setbibliotecaFormData({ ...bibliotecaFormData, esforco: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixo">Baixo</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bib-duracao">Duração (horas)</Label>
                  <Input
                    id="bib-duracao"
                    type="number"
                    placeholder="Ex: 40"
                    value={bibliotecaFormData.duracao_estimada}
                    onChange={(e) => setbibliotecaFormData({ ...bibliotecaFormData, duracao_estimada: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bib-custo">Custo Estimado (R$)</Label>
                  <Input
                    id="bib-custo"
                    type="number"
                    placeholder="Ex: 5000"
                    value={bibliotecaFormData.custo_estimado}
                    onChange={(e) => setbibliotecaFormData({ ...bibliotecaFormData, custo_estimado: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBibliotecaModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateBiblioteca} disabled={bibliotecaCreateMutation.isPending}>
                {bibliotecaCreateMutation.isPending ? "Criando..." : "Criar Ação"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Editar Ação da Biblioteca */}
        <Dialog open={isBibliotecaEditModalOpen} onOpenChange={setIsBibliotecaEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Ação Customizada</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-bib-titulo">Título *</Label>
                  <Input
                    id="edit-bib-titulo"
                    value={bibliotecaFormData.titulo}
                    onChange={(e) => setbibliotecaFormData({ ...bibliotecaFormData, titulo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-bib-categoria">Categoria *</Label>
                  <CategoriaSelector
                    tipo="intervencao"
                    value={bibliotecaFormData.categoria}
                    onChange={(value) => setbibliotecaFormData({ ...bibliotecaFormData, categoria: value })}
                    allowCreate={true}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bib-descricao">Descrição</Label>
                <Textarea
                  id="edit-bib-descricao"
                  value={bibliotecaFormData.descricao}
                  onChange={(e) => setbibliotecaFormData({ ...bibliotecaFormData, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-bib-impacto">Impacto</Label>
                  <Select value={bibliotecaFormData.impacto} onValueChange={(value) => setbibliotecaFormData({ ...bibliotecaFormData, impacto: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixo">Baixo</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-bib-esforco">Esforço</Label>
                  <Select value={bibliotecaFormData.esforco} onValueChange={(value) => setbibliotecaFormData({ ...bibliotecaFormData, esforco: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixo">Baixo</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-bib-duracao">Duração (horas)</Label>
                  <Input
                    id="edit-bib-duracao"
                    type="number"
                    value={bibliotecaFormData.duracao_estimada}
                    onChange={(e) => setbibliotecaFormData({ ...bibliotecaFormData, duracao_estimada: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-bib-custo">Custo Estimado (R$)</Label>
                  <Input
                    id="edit-bib-custo"
                    type="number"
                    value={bibliotecaFormData.custo_estimado}
                    onChange={(e) => setbibliotecaFormData({ ...bibliotecaFormData, custo_estimado: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBibliotecaEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateBiblioteca} disabled={bibliotecaUpdateMutation.isPending}>
                {bibliotecaUpdateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alert Dialog de Delete Biblioteca */}
        <AlertDialog open={isBibliotecaDeleteOpen} onOpenChange={setIsBibliotecaDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A ação customizada será permanentemente removida da sua biblioteca.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedBibliotecaItem(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteBiblioteca}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Intervencoes;
