import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Eye, 
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  GripVertical,
  Copy
} from "lucide-react";
import { useActiveDomain } from "@/hooks/useActiveDomain";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from "@/hooks/use-toast";
import { useAvaliacaoDetalhes } from "@/hooks/useAvaliacaoDetalhes";
import { useAvaliacaoUpdate } from "@/hooks/useAvaliacaoUpdate";
import { useClientes } from "@/hooks/useClientes";
import { CompartilharAvaliacao } from "@/components/avaliacoes/CompartilharAvaliacao";
import { ParticipantesManager } from "@/components/avaliacoes/ParticipantesManager";
import { CategoriaSelector } from "@/components/shared/CategoriaSelector";
import { PesoImpactPreview } from "@/components/shared/PesoImpactPreview";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, BarChart3 } from "lucide-react";

// Componente auxiliar para questões sortable e collapsible
const SortableQuestao = ({ questao, index, atualizarQuestao, removerQuestao, isCollapsed, toggleCollapse }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: questao.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Validação visual
  const isQuestaoValida = () => {
    if (!questao.pergunta?.trim()) return false;
    if (!questao.categoria) return false;
    if (!questao.peso || questao.peso < 1 || questao.peso > 10) return false;
    
    if (questao.tipo === 'multipla_escolha') {
      const opcoesValidas = questao.opcoes?.filter((op: string) => op.trim() !== '') || [];
      if (opcoesValidas.length < 2) return false;
    }
    
    return true;
  };

  const valida = isQuestaoValida();

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'multipla_escolha': return 'Múltipla Escolha';
      case 'escala': return 'Escala (1-10)';
      case 'sim_nao': return 'Sim/Não';
      case 'texto_livre': return 'Texto Livre';
      default: return tipo;
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-4 relative">
        {/* Indicador de validação */}
        <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full ${
          valida ? 'bg-green-500' : 'bg-yellow-500'
        }`} />

        <div className="space-y-4">
          {/* HEADER DA QUESTÃO (sempre visível) */}
          <div className="flex items-start gap-2">
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing pt-2 shrink-0">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Botão de Collapse */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => toggleCollapse(questao.id)}
              className="shrink-0"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
            </Button>

            {/* Preview da Questão quando colapsada */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleCollapse(questao.id)}>
              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground">Questão {index + 1}</span>
              </div>
              <p className="font-medium truncate mt-1">
                {questao.pergunta || "Nova pergunta"}
              </p>
              {isCollapsed && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {getTipoLabel(questao.tipo)}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {questao.categoria || "Sem categoria"}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Peso: {questao.peso || 5}
                  </Badge>
                  {questao.obrigatoria && (
                    <Badge variant="default" className="text-xs">
                      Obrigatória
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Botão Remover */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removerQuestao(questao.id)}
              className="text-destructive shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* CONTEÚDO DA QUESTÃO (colapsável) */}
          {!isCollapsed && (
            <div className="pl-11 space-y-4 animate-accordion-down">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pergunta</Label>
                  <Textarea
                    value={questao.pergunta}
                    onChange={(e) => atualizarQuestao(questao.id, 'pergunta', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Resposta</Label>
                  <Select 
                    value={questao.tipo} 
                    onValueChange={(value) => atualizarQuestao(questao.id, 'tipo', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multipla_escolha">Múltipla Escolha</SelectItem>
                      <SelectItem value="escala">Escala (1-10)</SelectItem>
                      <SelectItem value="sim_nao">Sim/Não</SelectItem>
                      <SelectItem value="texto_livre">Texto Livre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <CategoriaSelector
                    tipo="avaliacao"
                    value={questao.categoria}
                    onChange={(value) => atualizarQuestao(questao.id, 'categoria', value)}
                  />
                </div>
                <div className="space-y-2">
                  <TooltipProvider>
                    <div className="flex items-center gap-2">
                      <Label>Peso (1-10)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium mb-2">O peso define a importância da questão no cálculo final</p>
                          <div className="space-y-1 text-xs">
                            <p><strong>Peso 1-3:</strong> Baixa importância</p>
                            <p className="text-muted-foreground ml-2">Questões contextuais, pouco impacto</p>
                            <p><strong>Peso 4-7:</strong> Importância moderada</p>
                            <p className="text-muted-foreground ml-2">Questões relevantes para a análise</p>
                            <p><strong>Peso 8-10:</strong> Alta importância</p>
                            <p className="text-muted-foreground ml-2">Questões críticas, alto impacto</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={questao.peso || 5}
                    onChange={(e) => atualizarQuestao(questao.id, 'peso', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(questao.peso || 5) <= 3 && "📊 Baixa importância"}
                    {(questao.peso || 5) >= 4 && (questao.peso || 5) <= 7 && "📊 Importância moderada"}
                    {(questao.peso || 5) >= 8 && "📊 Alta importância - questão crítica"}
                  </p>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    checked={questao.obrigatoria}
                    onCheckedChange={(checked) => atualizarQuestao(questao.id, 'obrigatoria', checked)}
                  />
                  <Label>Questão Obrigatória</Label>
                </div>
              </div>

              {questao.tipo === "multipla_escolha" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Opções de Resposta</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const novasOpcoes = [...(questao.opcoes || []), ""];
                        atualizarQuestao(questao.id, 'opcoes', novasOpcoes);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Opção
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(!questao.opcoes || questao.opcoes.length === 0) ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma opção adicionada. Clique em "Adicionar Opção".
                      </p>
                    ) : (
                      questao.opcoes.map((opcao: string, opcaoIndex: number) => (
                        <div key={opcaoIndex} className="flex gap-2">
                          <Input
                            placeholder={`Opção ${opcaoIndex + 1}`}
                            value={opcao}
                            onChange={(e) => {
                              const novasOpcoes = [...(questao.opcoes || [])];
                              novasOpcoes[opcaoIndex] = e.target.value;
                              atualizarQuestao(questao.id, 'opcoes', novasOpcoes);
                            }}
                          />
                          {questao.opcoes && questao.opcoes.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const novasOpcoes = questao.opcoes?.filter((_: any, i: number) => i !== opcaoIndex) || [];
                                atualizarQuestao(questao.id, 'opcoes', novasOpcoes);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const EditarAvaliacao = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: activeDomain } = useActiveDomain();
  
  const activeTab = searchParams.get('tab') || 'informacoes';
  
  const { data: avaliacaoData, isLoading: loading } = useAvaliacaoDetalhes(id);
  const { mutate: updateAvaliacao, isPending: saving } = useAvaliacaoUpdate();
  const { data: clientes } = useClientes();

  // Lógica para link de compartilhamento
  const baseUrl = activeDomain?.isCustomDomain 
    ? `https://${activeDomain.domain}` 
    : window.location.origin;

  const linkGeral = avaliacaoData?.slug 
    ? `${baseUrl}/avaliacao/${avaliacaoData.slug}` 
    : null;

  const podeExibirBotaoCopiar = avaliacaoData?.status === 'ativa' && linkGeral;

  const copiarLink = async () => {
    if (!linkGeral) return;
    try {
      await navigator.clipboard.writeText(linkGeral);
      toast({
        title: 'Link copiado!',
        description: 'O link da avaliação foi copiado para a área de transferência',
      });
    } catch (err) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link',
        variant: 'destructive',
      });
    }
  };
  
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "",
    tipo_acesso: "restrito" as "publico" | "restrito",
    permite_auto_identificacao: false,
    cliente_id: "",
    data_inicio: "",
    data_fim: "",
    configuracoes: {
      anonima: true,
      tempo_limite: 30,
    } as any,
    questoes: [] as any[]
  });

  const [questoesCollapsed, setQuestoesCollapsed] = useState<Record<string, boolean>>({});
  const [showImpactPreview, setShowImpactPreview] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Só popula o estado na primeira vez que os dados chegam
  useEffect(() => {
    if (avaliacaoData && !isInitialized) {
      setFormData({
        nome: avaliacaoData.nome || "",
        descricao: avaliacaoData.descricao || "",
        tipo: avaliacaoData.tipo || "",
        tipo_acesso: (avaliacaoData.tipo_acesso as "publico" | "restrito") || "restrito",
        permite_auto_identificacao: avaliacaoData.permite_auto_identificacao || false,
        cliente_id: avaliacaoData.cliente_id || "",
        data_inicio: avaliacaoData.data_inicio || "",
        data_fim: avaliacaoData.data_fim || "",
        configuracoes: (avaliacaoData.configuracoes || { anonima: true, tempo_limite: 30 }) as any,
        questoes: avaliacaoData.questoes || []
      });
      setIsInitialized(true);
    }
  }, [avaliacaoData, isInitialized]);

  const salvarAvaliacao = () => {
    if (!id) return;
    
    updateAvaliacao({
      id,
      nome: formData.nome,
      descricao: formData.descricao,
      tipo: formData.tipo,
      tipo_acesso: formData.tipo_acesso,
      permite_auto_identificacao: formData.tipo_acesso === 'restrito' ? formData.permite_auto_identificacao : false,
      cliente_id: formData.cliente_id || undefined,
      data_inicio: formData.data_inicio,
      data_fim: formData.data_fim,
      configuracoes: formData.configuracoes,
      questoes: formData.questoes.map((q, index) => ({
        pergunta: q.pergunta,
        tipo: q.tipo,
        opcoes: q.opcoes,
        obrigatoria: q.obrigatoria !== false,
        categoria: q.categoria || "Geral",
        peso: q.peso || 5,
        ordem: index
      }))
    });
  };

  const publicarAvaliacao = () => {
    if (!id) return;
    
    updateAvaliacao({
      id,
      status: 'ativa',
      nome: formData.nome,
      descricao: formData.descricao,
      tipo: formData.tipo,
      tipo_acesso: formData.tipo_acesso,
      permite_auto_identificacao: formData.tipo_acesso === 'restrito' ? formData.permite_auto_identificacao : false,
      cliente_id: formData.cliente_id || undefined,
      data_inicio: formData.data_inicio,
      data_fim: formData.data_fim,
      configuracoes: formData.configuracoes,
      questoes: formData.questoes.map((q, index) => ({
        pergunta: q.pergunta,
        tipo: q.tipo,
        opcoes: q.opcoes,
        obrigatoria: q.obrigatoria !== false,
        categoria: q.categoria || "Geral",
        peso: q.peso || 5,
        ordem: index
      }))
    });
  };

  const adicionarQuestao = () => {
    const novaQuestao = {
      id: Date.now().toString(),
      pergunta: "",
      tipo: "escala",
      obrigatoria: true,
      categoria: "Geral",
      peso: 5,
      opcoes: []
    };
    
    setFormData({
      ...formData,
      questoes: [...formData.questoes, novaQuestao]
    });
  };

  const removerQuestao = (questaoId: string) => {
    setFormData({
      ...formData,
      questoes: formData.questoes.filter(q => q.id !== questaoId)
    });
  };

  const atualizarQuestao = (questaoId: string, campo: string, valor: any) => {
    setFormData({
      ...formData,
      questoes: formData.questoes.map(q => {
        if (q.id === questaoId) {
          const questaoAtualizada = { ...q, [campo]: valor };
          
          // Se mudou para múltipla escolha e não tem opções, inicializar com 2
          if (campo === 'tipo' && valor === 'multipla_escolha' && (!q.opcoes || q.opcoes.length === 0)) {
            questaoAtualizada.opcoes = ["Opção 1", "Opção 2"];
          }
          
          return questaoAtualizada;
        }
        return q;
      })
    });
  };

  const toggleCollapse = (questaoId: string) => {
    setQuestoesCollapsed(prev => ({
      ...prev,
      [questaoId]: !prev[questaoId]
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = formData.questoes.findIndex(q => q.id === active.id);
      const newIndex = formData.questoes.findIndex(q => q.id === over.id);
      
      const reordered = arrayMove(formData.questoes, oldIndex, newIndex);
      
      setFormData({
        ...formData,
        questoes: reordered
      });
    }
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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!avaliacaoData) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Avaliação não encontrada</h3>
          <p className="text-muted-foreground mb-4">
            A avaliação que você está tentando editar não foi encontrada.
          </p>
          <Button onClick={() => navigate('/avaliacoes')}>
            Voltar para Avaliações
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/avaliacoes')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Editar Avaliação</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(avaliacaoData.status)}>
                  {getStatusLabel(avaliacaoData.status)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/avaliacoes/preview/${id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            {podeExibirBotaoCopiar && (
              <Button variant="outline" onClick={copiarLink} className="gap-2">
                <Copy className="h-4 w-4" />
                Copiar Link
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={salvarAvaliacao} 
              disabled={saving}
              className="gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            {avaliacaoData.status === "rascunho" && (
              <Button onClick={publicarAvaliacao} disabled={saving}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Publicar
              </Button>
            )}
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setSearchParams({ tab: value })}
          className="space-y-6"
        >
          <TabsList className={`grid w-full ${formData.tipo_acesso === 'restrito' ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="informacoes">Informações</TabsTrigger>
            <TabsTrigger value="questoes">Questões ({formData.questoes.length})</TabsTrigger>
            {formData.tipo_acesso === 'restrito' && (
              <TabsTrigger value="participantes">Participantes</TabsTrigger>
            )}
            <TabsTrigger value="compartilhar">Compartilhar</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="informacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Avaliação</CardTitle>
                <CardDescription>
                  Configure os dados básicos da avaliação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Avaliação</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Avaliação</Label>
                    <Select 
                      value={formData.tipo} 
                      onValueChange={(value) => setFormData({...formData, tipo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Clima Organizacional">Clima Organizacional</SelectItem>
                        <SelectItem value="Estresse">Estresse Ocupacional</SelectItem>
                        <SelectItem value="Engagement">Engagement</SelectItem>
                        <SelectItem value="Burnout">Burnout</SelectItem>
                        <SelectItem value="Personalizada">Personalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    rows={4}
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente (Opcional)</Label>
                  <Select 
                    value={formData.cliente_id} 
                    onValueChange={(value) => setFormData({...formData, cliente_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes?.map((cliente: any) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data de Início</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Data de Fim</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Acesso</Label>
                  <RadioGroup 
                    value={formData.tipo_acesso} 
                    onValueChange={(value: "publico" | "restrito") => setFormData({...formData, tipo_acesso: value, permite_auto_identificacao: false})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="publico" id="publico" />
                      <Label htmlFor="publico" className="font-normal cursor-pointer">
                        Público - Qualquer pessoa com o link pode responder
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="restrito" id="restrito" />
                      <Label htmlFor="restrito" className="font-normal cursor-pointer">
                        Restrito - Apenas participantes convidados podem responder
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.tipo_acesso === 'restrito' && (
                    <div className="flex items-center justify-between border rounded-lg p-4 mt-4 bg-muted/30">
                      <div className="flex-1">
                        <Label className="font-medium">Link Geral com Auto-identificação</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Gera um link único para compartilhar. Participantes informam nome e e-mail antes de responder.
                        </p>
                      </div>
                      <Switch
                        checked={formData.permite_auto_identificacao}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, permite_auto_identificacao: checked })
                        }
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

{formData.tipo_acesso === 'restrito' && (
            <TabsContent value="participantes" className="space-y-6">
              <ParticipantesManager avaliacaoId={id!} />
            </TabsContent>
          )}

          <TabsContent value="compartilhar" className="space-y-6">
            {avaliacaoData.status === 'ativa' ? (
              <CompartilharAvaliacao 
                avaliacao={{
                  ...avaliacaoData,
                  permite_auto_identificacao: formData.permite_auto_identificacao
                }} 
                participantes={avaliacaoData.participantes || []}
                onNavigateToParticipantes={() => setSearchParams({ tab: 'participantes' })}
                onNavigateToInformacoes={() => setSearchParams({ tab: 'informacoes' })}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Avaliação não publicada</h3>
                  <p className="text-muted-foreground">
                    Publique a avaliação para gerar links de compartilhamento.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="questoes" className="space-y-6">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Questões da Avaliação</CardTitle>
                  <CardDescription>
                    Adicione e configure as questões da avaliação
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {formData.questoes.length} {formData.questoes.length === 1 ? 'questão' : 'questões'} • 
                      Peso total: {formData.questoes.reduce((acc, q) => acc + (q.peso || 5), 0)} •
                      Score máximo: {formData.questoes.reduce((acc, q) => acc + (q.peso || 5), 0).toFixed(1)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowImpactPreview(true)} 
                      variant="outline"
                      size="sm"
                      disabled={formData.questoes.length === 0}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ver Impacto
                    </Button>
                    <Button onClick={adicionarQuestao} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {formData.questoes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma questão adicionada. Clique em "Adicionar Questão" para começar.
                  </div>
                )}
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={formData.questoes.map(q => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {formData.questoes.map((questao, index) => (
                      <SortableQuestao
                        key={questao.id}
                        questao={questao}
                        index={index}
                        atualizarQuestao={atualizarQuestao}
                        removerQuestao={removerQuestao}
                        isCollapsed={questoesCollapsed[questao.id] || false}
                        toggleCollapse={toggleCollapse}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={adicionarQuestao} 
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Questão
                </Button>
              </CardContent>
            </Card>

            {/* Impact Preview Modal */}
            <Dialog open={showImpactPreview} onOpenChange={setShowImpactPreview}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Impacto dos Pesos na Análise</DialogTitle>
                  <DialogDescription>
                    Veja como os pesos das questões influenciam o cálculo final da avaliação
                  </DialogDescription>
                </DialogHeader>
                <PesoImpactPreview questoes={formData.questoes} escala={10} />
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
                <CardDescription>
                  Configure opções adicionais da avaliação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.configuracoes?.anonima}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      configuracoes: { ...formData.configuracoes, anonima: !!checked }
                    })}
                  />
                  <Label>Respostas Anônimas</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tempoLimite">Tempo Limite (minutos)</Label>
                  <Input
                    id="tempoLimite"
                    type="number"
                    value={formData.configuracoes?.tempo_limite || 30}
                    onChange={(e) => setFormData({
                      ...formData,
                      configuracoes: { ...formData.configuracoes, tempo_limite: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default EditarAvaliacao;
