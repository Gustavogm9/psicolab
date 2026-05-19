import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PesoImpactPreview } from "@/components/shared/PesoImpactPreview";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoriaSelector } from "@/components/shared/CategoriaSelector";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Save, 
  Eye, 
  GripVertical,
  Settings,
  Brain,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Info,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useQuestionarioDetalhes } from '@/hooks/useQuestionarioDetalhes';
import { useQuestionarioUpdate } from '@/hooks/useQuestionarioUpdate';
import { useClientes } from '@/hooks/useClientes';
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

interface Questao {
  id: string;
  texto: string;
  tipo: 'escala' | 'multipla_escolha' | 'sim_nao' | 'texto_livre';
  opcoes?: string[];
  obrigatoria: boolean;
  peso: number;
}

interface QuestionarioForm {
  titulo: string;
  descricao: string;
  categoria: string;
  ativo: boolean;
  tempoEstimado: number;
  clienteId?: string;
  questoes: Questao[];
  configuracoes: {
    coletarEmail: boolean;
    coletarTelefone: boolean;
    coletarNome: boolean;
    redirecionarAposResposta: string;
    mensagemAgradecimento: string;
  };
}

// Componente para questão ordenável com validação visual
const SortableQuestao = ({ 
  questao, 
  index,
  isExpanded,
  onToggle,
  onUpdate, 
  onRemove,
  onAdicionarOpcao,
  onRemoverOpcao,
  onAtualizarOpcao
}: {
  questao: Questao;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (campo: keyof Questao, valor: any) => void;
  onRemove: () => void;
  onAdicionarOpcao: () => void;
  onRemoverOpcao: (opcaoIndex: number) => void;
  onAtualizarOpcao: (opcaoIndex: number, valor: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: questao.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Validação visual
  const isValida = questao.texto.trim() && 
    questao.peso >= 1 && questao.peso <= 5 &&
    (questao.tipo !== 'multipla_escolha' || 
     (questao.opcoes && questao.opcoes.filter(op => op.trim()).length >= 2));

  const tiposQuestao = [
    { value: "multipla_escolha", label: "Múltipla Escolha" },
    { value: "escala", label: "Escala (1-5)" },
    { value: "texto_livre", label: "Texto Livre" },
    { value: "sim_nao", label: "Sim/Não" }
  ];

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Indicador de validação */}
      <div className={`absolute -left-3 top-4 w-1 h-16 rounded-full transition-colors ${
        isValida ? 'bg-green-500' : 'bg-yellow-500'
      }`} />
      
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <div className="border rounded-lg bg-card overflow-hidden">
          {/* HEADER SEMPRE VISÍVEL */}
          <CollapsibleTrigger asChild>
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div 
                  {...attributes} 
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </div>
                
                <Badge variant="outline" className="flex items-center gap-1 flex-shrink-0">
                  {isValida ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                  )}
                  Questão {index + 1}
                </Badge>
                
                <span className="text-sm text-muted-foreground truncate flex-1">
                  {questao.texto || "Nova questão..."}
                </span>
                
                <Badge variant="secondary" className="flex-shrink-0">
                  {tiposQuestao.find(t => t.value === questao.tipo)?.label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`} />
              </div>
            </div>
          </CollapsibleTrigger>
          
          {/* CONTEÚDO COLAPSÁVEL */}
          <CollapsibleContent>
            <div className="p-4 pt-0 space-y-4 border-t">
              <div className="space-y-2">
                <Label>Texto da Questão</Label>
                <Textarea
                  placeholder="Digite sua questão aqui..."
                  value={questao.texto}
                  onChange={(e) => onUpdate('texto', e.target.value)}
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Questão</Label>
                  <Select 
                    value={questao.tipo} 
                    onValueChange={(value) => onUpdate('tipo', value as Questao['tipo'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposQuestao.map(tipo => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <TooltipProvider>
                    <div className="flex items-center gap-2">
                      <Label>Peso (1-5)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium mb-2">O peso define a importância da questão no cálculo final</p>
                          <div className="space-y-1 text-xs">
                            <p><strong>Peso 1-2:</strong> Baixa importância - questões de contexto</p>
                            <p className="text-muted-foreground ml-2">Ex: "Qual seu nome?" ou "Em que cidade trabalha?"</p>
                            <p><strong>Peso 3:</strong> Importância moderada - questões relevantes</p>
                            <p className="text-muted-foreground ml-2">Ex: "Quantos funcionários?" ou "Há quanto tempo?"</p>
                            <p><strong>Peso 4-5:</strong> Alta importância - questões críticas</p>
                            <p className="text-muted-foreground ml-2">Ex: "Tem orçamento aprovado?" ou "Quando precisa?"</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={questao.peso}
                    onChange={(e) => onUpdate('peso', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {questao.peso <= 2 && "📊 Baixa importância - questão de contexto"}
                    {questao.peso === 3 && "📊 Importância moderada - questão relevante"}
                    {questao.peso >= 4 && "📊 Alta importância - questão crítica"}
                  </p>
                </div>
              </div>
              
              {questao.tipo === "multipla_escolha" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Opções de Resposta</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onAdicionarOpcao}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {questao.opcoes?.map((opcao, opcaoIndex) => (
                      <div key={opcaoIndex} className="flex gap-2">
                        <Input
                          placeholder={`Opção ${opcaoIndex + 1}`}
                          value={opcao}
                          onChange={(e) => onAtualizarOpcao(opcaoIndex, e.target.value)}
                        />
                        {questao.opcoes && questao.opcoes.length > 2 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onRemoverOpcao(opcaoIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={questao.obrigatoria}
                  onCheckedChange={(checked) => onUpdate('obrigatoria', checked)}
                />
                <Label>Questão obrigatória</Label>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

const EditarQuestionario = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: questionarioOriginal, isLoading: isLoadingQuestionario, error } = useQuestionarioDetalhes(id!);
  const { mutate: updateQuestionario, isPending } = useQuestionarioUpdate();
  const { data: clientes = [] } = useClientes();
  
  const [questionario, setQuestionario] = useState<QuestionarioForm>({
    titulo: "",
    descricao: "",
    categoria: "",
    ativo: true,
    tempoEstimado: 5,
    clienteId: undefined,
    questoes: [],
    configuracoes: {
      coletarEmail: true,
      coletarTelefone: true,
      coletarNome: true,
      redirecionarAposResposta: "",
      mensagemAgradecimento: "Obrigado por responder nosso questionário! Entraremos em contato em breve."
    }
  });

  // Estado para controlar quais questões estão expandidas
  const [questoesExpandidas, setQuestoesExpandidas] = useState<Set<string>>(new Set());
  
  // Estado para controlar o modal de preview
  const [previewAberto, setPreviewAberto] = useState(false);
  const [showImpactPreview, setShowImpactPreview] = useState(false);

  // Carregar dados do questionário quando disponível
  useEffect(() => {
    if (questionarioOriginal) {
      const questoesFormatadas = questionarioOriginal.questoes?.map((q: any) => ({
        id: q.id,
        texto: q.texto,
        tipo: q.tipo,
        opcoes: q.opcoes || undefined,
        obrigatoria: q.obrigatoria,
        peso: q.peso || 1
      })) || [];

      const config = questionarioOriginal.configuracoes as any;
      
      setQuestionario({
        titulo: questionarioOriginal.titulo,
        descricao: questionarioOriginal.descricao || "",
        categoria: questionarioOriginal.categoria,
        ativo: questionarioOriginal.ativo,
        tempoEstimado: questionarioOriginal.tempo_estimado || 5,
        clienteId: questionarioOriginal.cliente_id || undefined,
        questoes: questoesFormatadas,
        configuracoes: {
          coletarEmail: config?.coletarEmail ?? true,
          coletarTelefone: config?.coletarTelefone ?? true,
          coletarNome: config?.coletarNome ?? true,
          redirecionarAposResposta: config?.redirecionarAposResposta || "",
          mensagemAgradecimento: config?.mensagemAgradecimento || "Obrigado por responder nosso questionário! Entraremos em contato em breve."
        }
      });
    }
  }, [questionarioOriginal]);

  const toggleQuestao = (id: string) => {
    setQuestoesExpandidas(prev => {
      const novo = new Set(prev);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  };

  const adicionarQuestao = () => {
    const novaQuestao: Questao = {
      id: `questao-${Date.now()}`,
      texto: "",
      tipo: "multipla_escolha",
      opcoes: ["", ""],
      obrigatoria: true,
      peso: 1
    };
    setQuestionario(prev => ({
      ...prev,
      questoes: [...prev.questoes, novaQuestao]
    }));
    setQuestoesExpandidas(prev => new Set([...prev, novaQuestao.id]));
  };

  const removerQuestao = (id: string) => {
    setQuestionario(prev => ({
      ...prev,
      questoes: prev.questoes.filter(q => q.id !== id)
    }));
  };

  const atualizarQuestao = (id: string, campo: keyof Questao, valor: any) => {
    setQuestionario(prev => ({
      ...prev,
      questoes: prev.questoes.map(q => {
        if (q.id !== id) return q;
        
        if (campo === 'tipo') {
          if (valor === 'multipla_escolha') {
            return { ...q, tipo: valor, opcoes: q.opcoes || ["", ""] };
          } else {
            const { opcoes, ...questaoSemOpcoes } = q;
            return { ...questaoSemOpcoes, tipo: valor };
          }
        }
        
        return { ...q, [campo]: valor };
      })
    }));
  };

  const adicionarOpcao = (questaoId: string) => {
    setQuestionario(prev => ({
      ...prev,
      questoes: prev.questoes.map(q => 
        q.id === questaoId ? { ...q, opcoes: [...(q.opcoes || []), ""] } : q
      )
    }));
  };

  const removerOpcao = (questaoId: string, opcaoIndex: number) => {
    setQuestionario(prev => ({
      ...prev,
      questoes: prev.questoes.map(q => 
        q.id === questaoId ? { 
          ...q, 
          opcoes: q.opcoes?.filter((_, index) => index !== opcaoIndex) 
        } : q
      )
    }));
  };

  const atualizarOpcao = (questaoId: string, opcaoIndex: number, valor: string) => {
    setQuestionario(prev => ({
      ...prev,
      questoes: prev.questoes.map(q => 
        q.id === questaoId ? { 
          ...q, 
          opcoes: q.opcoes?.map((opcao, index) => 
            index === opcaoIndex ? valor : opcao
          ) 
        } : q
      )
    }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questionario.questoes.findIndex(q => q.id === active.id);
      const newIndex = questionario.questoes.findIndex(q => q.id === over.id);
      
      setQuestionario(prev => ({
        ...prev,
        questoes: arrayMove(prev.questoes, oldIndex, newIndex)
      }));
    }
  };

  const visualizarQuestionario = () => {
    if (!questionario.titulo.trim()) {
      toast.error('Adicione um título para visualizar o questionário');
      return;
    }
    
    if (questionario.questoes.length === 0) {
      toast.error('Adicione pelo menos uma questão para visualizar');
      return;
    }
    
    setPreviewAberto(true);
  };

  const questionarioSchema = z.object({
    titulo: z.string().trim().min(1, "O título é obrigatório").max(200, "Título muito longo"),
    descricao: z.string().trim().max(500, "Descrição muito longa").optional(),
    categoria: z.string().min(1, "Selecione uma categoria"),
    tempoEstimado: z.number().min(1, "Tempo mínimo: 1 minuto").max(120, "Tempo máximo: 120 minutos"),
    questoes: z.array(z.object({
      texto: z.string().trim().min(1, "O texto da questão é obrigatório"),
      tipo: z.enum(["multipla_escolha", "escala", "texto_livre", "sim_nao"]),
      opcoes: z.array(z.string()).optional(),
      peso: z.number().min(1).max(5)
    })).min(1, "Adicione pelo menos uma questão"),
    configuracoes: z.object({
      mensagemAgradecimento: z.string().max(300, "Mensagem muito longa")
    }).passthrough()
  });

  const atualizarQuestionario = () => {
    try {
      const validatedData = questionarioSchema.parse(questionario);
      
      for (let i = 0; i < validatedData.questoes.length; i++) {
        const questao = validatedData.questoes[i];
        if (questao.tipo === 'multipla_escolha') {
          if (!questao.opcoes || questao.opcoes.filter(op => op.trim()).length < 2) {
            toast.error(`A questão ${i + 1} precisa ter pelo menos 2 opções válidas`);
            return;
          }
        }
      }

      updateQuestionario({
        id: id!,
        titulo: questionario.titulo,
        descricao: questionario.descricao,
        categoria: questionario.categoria,
        clienteId: questionario.clienteId,
        ativo: questionario.ativo,
        tempoEstimado: questionario.tempoEstimado,
        configuracoes: questionario.configuracoes,
        questoes: questionario.questoes.map((q) => ({
          texto: q.texto,
          tipo: q.tipo,
          opcoes: q.opcoes,
          obrigatoria: q.obrigatoria,
          peso: q.peso
        }))
      }, {
        onSuccess: () => {
          navigate('/diagnosticos');
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
      toast.error('Erro ao validar questionário');
    }
  };

  const questoesValidas = questionario.questoes.filter(q => {
    const baseValida = q.texto.trim() && q.peso >= 1 && q.peso <= 5;
    if (q.tipo === 'multipla_escolha') {
      return baseValida && q.opcoes && q.opcoes.filter(op => op.trim()).length >= 2;
    }
    return baseValida;
  }).length;
  
  const progressoValidacao = questionario.questoes.length > 0 
    ? (questoesValidas / questionario.questoes.length) * 100 
    : 0;

  if (isLoadingQuestionario) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 flex-1" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar questionário</h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os dados do questionário.
            </p>
            <Link to="/diagnosticos">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/diagnosticos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              Editar Questionário
            </h1>
            <p className="text-muted-foreground mt-1">
              Atualize as configurações do seu questionário de diagnóstico
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowImpactPreview(true)}
            disabled={questionario.questoes.length === 0}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Impacto
          </Button>
          <Button variant="outline" onClick={visualizarQuestionario}>
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          <Button 
            onClick={atualizarQuestionario}
            disabled={isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {isPending ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações Básicas */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Configure as informações principais do questionário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título do Questionário</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Diagnóstico de Bem-estar Organizacional"
                  value={questionario.titulo}
                  onChange={(e) => setQuestionario(prev => ({ ...prev, titulo: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o objetivo e benefícios deste questionário..."
                  value={questionario.descricao}
                  onChange={(e) => setQuestionario(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <CategoriaSelector
                    tipo="questionario"
                    value={questionario.categoria}
                    onChange={(value) => setQuestionario(prev => ({ ...prev, categoria: value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente (Opcional)</Label>
                  <Select 
                    value={questionario.clienteId || "none"} 
                    onValueChange={(value) => setQuestionario(prev => ({ ...prev, clienteId: value === "none" ? undefined : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem cliente específico</SelectItem>
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tempo">Tempo Estimado (min)</Label>
                  <Input
                    id="tempo"
                    type="number"
                    min="1"
                    max="60"
                    value={questionario.tempoEstimado}
                    onChange={(e) => setQuestionario(prev => ({ ...prev, tempoEstimado: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="ativo"
                    checked={questionario.ativo}
                    onCheckedChange={(checked) => setQuestionario(prev => ({ ...prev, ativo: checked }))}
                  />
                  <Label htmlFor="ativo">Questionário ativo</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questões */}
          <Card>
            <CardHeader>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Questões ({questionario.questoes.length})</CardTitle>
                </div>
                <CardDescription>
                  Adicione e configure as questões do seu diagnóstico. Arraste para reordenar.
                </CardDescription>
                {questionario.questoes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso de validação</span>
                      <span className="font-medium">
                        {questoesValidas} de {questionario.questoes.length} válidas
                      </span>
                    </div>
                    <Progress value={progressoValidacao} className="h-2" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {questionario.questoes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground space-y-2">
                  <p className="text-lg font-medium">Nenhuma questão adicionada ainda</p>
                  <p className="text-sm">Comece criando sua primeira questão</p>
                  <Button onClick={adicionarQuestao} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Questão
                  </Button>
                </div>
              ) : (
                <>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={questionario.questoes.map(q => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {questionario.questoes.map((questao, index) => (
                          <SortableQuestao
                            key={questao.id}
                            questao={questao}
                            index={index}
                            isExpanded={questoesExpandidas.has(questao.id)}
                            onToggle={() => toggleQuestao(questao.id)}
                            onUpdate={(campo, valor) => atualizarQuestao(questao.id, campo, valor)}
                            onRemove={() => removerQuestao(questao.id)}
                            onAdicionarOpcao={() => adicionarOpcao(questao.id)}
                            onRemoverOpcao={(opcaoIndex) => removerOpcao(questao.id, opcaoIndex)}
                            onAtualizarOpcao={(opcaoIndex, valor) => atualizarOpcao(questao.id, opcaoIndex, valor)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  
                  <Button 
                    onClick={adicionarQuestao} 
                    variant="outline" 
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Questão
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configurações Avançadas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>
                Configure coleta de dados e comportamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Dados a Coletar</Label>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={questionario.configuracoes.coletarNome}
                    onCheckedChange={(checked) => 
                      setQuestionario(prev => ({
                        ...prev,
                        configuracoes: { ...prev.configuracoes, coletarNome: checked }
                      }))
                    }
                  />
                  <Label>Nome completo</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={questionario.configuracoes.coletarEmail}
                    onCheckedChange={(checked) => 
                      setQuestionario(prev => ({
                        ...prev,
                        configuracoes: { ...prev.configuracoes, coletarEmail: checked }
                      }))
                    }
                  />
                  <Label>E-mail</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={questionario.configuracoes.coletarTelefone}
                    onCheckedChange={(checked) => 
                      setQuestionario(prev => ({
                        ...prev,
                        configuracoes: { ...prev.configuracoes, coletarTelefone: checked }
                      }))
                    }
                  />
                  <Label>Telefone</Label>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Mensagem de Agradecimento</Label>
                <Textarea
                  placeholder="Mensagem exibida após completar o questionário"
                  value={questionario.configuracoes.mensagemAgradecimento}
                  onChange={(e) => 
                    setQuestionario(prev => ({
                      ...prev,
                      configuracoes: { ...prev.configuracoes, mensagemAgradecimento: e.target.value }
                    }))
                  }
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>URL de Redirecionamento (opcional)</Label>
                <Input
                  placeholder="https://exemplo.com/obrigado"
                  value={questionario.configuracoes.redirecionarAposResposta}
                  onChange={(e) => 
                    setQuestionario(prev => ({
                      ...prev,
                      configuracoes: { ...prev.configuracoes, redirecionarAposResposta: e.target.value }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botão flutuante fixo */}
      {questionario.questoes.length > 3 && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom duration-300">
          <Button 
            onClick={adicionarQuestao}
            size="lg"
            className="shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Questão
          </Button>
        </div>
      )}

      {/* Impact Preview Modal */}
      <Dialog open={showImpactPreview} onOpenChange={setShowImpactPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Impacto dos Pesos na Análise</DialogTitle>
            <DialogDescription>
              Veja como os pesos das questões influenciam o cálculo final do diagnóstico
            </DialogDescription>
          </DialogHeader>
          <PesoImpactPreview questoes={questionario.questoes} escala={5} />
        </DialogContent>
      </Dialog>

      {/* Modal de Preview */}
      <Dialog open={previewAberto} onOpenChange={setPreviewAberto}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{questionario.titulo || "Preview do Questionário"}</DialogTitle>
            <DialogDescription>
              {questionario.descricao || "Visualização de como o questionário será exibido aos respondentes"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary">{questionario.categoria || "Categoria"}</Badge>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {questionario.tempoEstimado} minutos
              </div>
              <span>•</span>
              <span>{questionario.questoes.length} questões</span>
            </div>

            {(questionario.configuracoes.coletarNome || 
              questionario.configuracoes.coletarEmail || 
              questionario.configuracoes.coletarTelefone) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados do Respondente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questionario.configuracoes.coletarNome && (
                    <div className="space-y-2">
                      <Label>Nome Completo *</Label>
                      <Input placeholder="Digite seu nome" disabled />
                    </div>
                  )}
                  {questionario.configuracoes.coletarEmail && (
                    <div className="space-y-2">
                      <Label>E-mail *</Label>
                      <Input type="email" placeholder="seu@email.com" disabled />
                    </div>
                  )}
                  {questionario.configuracoes.coletarTelefone && (
                    <div className="space-y-2">
                      <Label>Telefone *</Label>
                      <Input placeholder="(00) 00000-0000" disabled />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Separator />

            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Questões</h3>
              {questionario.questoes.map((questao, index) => (
                <Card key={questao.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                        <span className="flex-1">{questao.texto}</span>
                      </CardTitle>
                      {questao.obrigatoria && (
                        <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {questao.tipo === 'multipla_escolha' && (
                      <div className="space-y-2">
                        {questao.opcoes?.map((opcao, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input type="radio" disabled />
                            <span>{opcao}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {questao.tipo === 'escala' && (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Button key={n} variant="outline" size="sm" disabled>
                            {n}
                          </Button>
                        ))}
                      </div>
                    )}
                    {questao.tipo === 'sim_nao' && (
                      <div className="flex gap-2">
                        <Button variant="outline" disabled>Sim</Button>
                        <Button variant="outline" disabled>Não</Button>
                      </div>
                    )}
                    {questao.tipo === 'texto_livre' && (
                      <Textarea placeholder="Digite sua resposta..." disabled rows={3} />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm text-center">
                  {questionario.configuracoes.mensagemAgradecimento}
                </p>
                {questionario.configuracoes.redirecionarAposResposta && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Você será redirecionado para: {questionario.configuracoes.redirecionarAposResposta}
                  </p>
                )}
              </CardContent>
            </Card>

            <Button onClick={() => setPreviewAberto(false)} className="w-full">
              Fechar Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditarQuestionario;
