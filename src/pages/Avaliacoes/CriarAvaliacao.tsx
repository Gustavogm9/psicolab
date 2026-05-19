import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Calendar, Users, Eye, FileText, Globe, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAvaliacaoCreate } from "@/hooks/useAvaliacaoCreate";
import { useClientes } from "@/hooks/useClientes";
import { QuestoesManager } from "@/components/avaliacoes/QuestoesManager";
import { TemplateSelector } from "@/components/avaliacoes/TemplateSelector";
import { AvaliacaoPreview } from "@/components/avaliacoes/AvaliacaoPreview";
import { CompartilharAvaliacaoDialog } from "@/components/avaliacoes/CompartilharAvaliacaoDialog";
import { COPSOQ_MEDIO_QUESTOES } from "@/lib/copsoq-questoes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PesoImpactPreview } from "@/components/shared/PesoImpactPreview";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart3 } from "lucide-react";

export default function CriarAvaliacao() {
  const navigate = useNavigate();
  const createAvaliacao = useAvaliacaoCreate();
  const { data: clientes } = useClientes();

  const [etapa, setEtapa] = useState(1);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "",
    instrumento: null as string | null,
    clienteId: "",
    dataInicio: "",
    dataFim: "",
    tipo_acesso: "restrito" as "publico" | "restrito",
    permite_auto_identificacao: false,
    equipeSelecionadas: [] as string[],
    configuracoes: {
      anonima: false,
      permitirEdicao: false,
      enviarLembrete: true,
    },
    questoes: [] as any[],
  });
  const [showPreview, setShowPreview] = useState(false);
  const [showImpactPreview, setShowImpactPreview] = useState(false);
  const [avaliacaoCriada, setAvaliacaoCriada] = useState<any>(null);
  const [mostrarCompartilhar, setMostrarCompartilhar] = useState(false);

  const tiposAvaliacao = [
    {
      id: "copsoq_medio",
      nome: "COPSOQ II — Riscos Psicossociais",
      descricao: "Instrumento padronizado de avaliação de riscos psicossociais no trabalho (Versão Média, 76 itens)",
      emoji: "🧠",
      instrumento: "copsoq_medio",
    },
    {
      id: "burnout",
      nome: "Burnout",
      descricao: "Avaliação de esgotamento profissional",
      emoji: "🔥",
      instrumento: null,
    },
    {
      id: "clima",
      nome: "Clima Organizacional",
      descricao: "Pesquisa de satisfação e ambiente de trabalho",
      emoji: "🌤️",
      instrumento: null,
    },
    {
      id: "assedio",
      nome: "Assédio e Discriminação",
      descricao: "Avaliação de situações de assédio no ambiente de trabalho",
      emoji: "🛡️",
      instrumento: null,
    },
    {
      id: "lideranca",
      nome: "Liderança",
      descricao: "Avaliação de práticas de liderança",
      emoji: "👔",
      instrumento: null,
    },
    {
      id: "personalizada",
      nome: "Personalizada",
      descricao: "Crie suas próprias perguntas",
      emoji: "⚙️",
      instrumento: null,
    },
  ];

  const equipes = [
    "Desenvolvimento",
    "Marketing",
    "Vendas",
    "Recursos Humanos",
    "Financeiro",
    "Operações",
    "Atendimento",
    "Jurídico",
  ];

  const handleSalvarRascunho = () => {
    if (formData.questoes.length === 0) {
      toast({
        title: "Questões necessárias",
        description: "Adicione pelo menos uma questão antes de salvar",
        variant: "destructive",
      });
      return;
    }

    // Validação de datas
    if (!formData.dataInicio || !formData.dataFim) {
      toast({
        title: "Datas obrigatórias",
        description: "Por favor, preencha as datas de início e término",
        variant: "destructive",
      });
      return;
    }

    const inicio = new Date(formData.dataInicio);
    const fim = new Date(formData.dataFim);

    if (fim <= inicio) {
      toast({
        title: "Datas inválidas",
        description: "A data de término deve ser posterior à data de início",
        variant: "destructive",
      });
      return;
    }

    createAvaliacao.mutate(
      {
        ...formData,
        status: 'rascunho',
        tipo_acesso: formData.tipo_acesso,
        permite_auto_identificacao: formData.tipo_acesso === 'restrito' ? formData.permite_auto_identificacao : false,
        data_inicio: formData.dataInicio,
        data_fim: formData.dataFim,
        cliente_id: formData.clienteId || undefined,
        questoes: formData.questoes,
        instrumento: formData.instrumento,
      },
      {
        onSuccess: () => {
          navigate('/avaliacoes');
        }
      }
    );
  };

  const handlePublicar = () => {
    if (formData.questoes.length === 0) {
      toast({
        title: "Questões necessárias",
        description: "Adicione pelo menos uma questão antes de publicar",
        variant: "destructive",
      });
      return;
    }

    // Validação de datas
    if (!formData.dataInicio || !formData.dataFim) {
      toast({
        title: "Datas obrigatórias",
        description: "Por favor, preencha as datas de início e término",
        variant: "destructive",
      });
      return;
    }

    const inicio = new Date(formData.dataInicio);
    const fim = new Date(formData.dataFim);

    if (fim <= inicio) {
      toast({
        title: "Datas inválidas",
        description: "A data de término deve ser posterior à data de início",
        variant: "destructive",
      });
      return;
    }

    // Validação detalhada de cada questão
    const problemas: string[] = [];

    formData.questoes.forEach((q, i) => {
      const numero = i + 1;

      if (!q.pergunta || !q.pergunta.trim()) {
        problemas.push(`Questão ${numero}: falta o texto da pergunta`);
      }

      if (q.tipo === 'multipla_escolha') {
        const opcoesValidas = q.opcoes?.filter((op: string) => op.trim() !== '') || [];
        if (opcoesValidas.length < 2) {
          problemas.push(`Questão ${numero}: precisa de pelo menos 2 opções válidas`);
        }
      }

      if (!q.categoria) {
        problemas.push(`Questão ${numero}: falta selecionar a categoria`);
      }

      if (!q.peso || q.peso < 1 || q.peso > 10) {
        problemas.push(`Questão ${numero}: peso deve estar entre 1 e 10`);
      }
    });

    if (problemas.length > 0) {
      toast({
        title: "Questões incompletas",
        description: problemas.slice(0, 3).join('\n') + (problemas.length > 3 ? `\n...e mais ${problemas.length - 3}` : ''),
        variant: "destructive",
      });
      return;
    }

    createAvaliacao.mutate(
      {
        ...formData,
        status: 'ativa',
        tipo_acesso: formData.tipo_acesso,
        permite_auto_identificacao: formData.tipo_acesso === 'restrito' ? formData.permite_auto_identificacao : false,
        data_inicio: formData.dataInicio,
        data_fim: formData.dataFim,
        cliente_id: formData.clienteId || undefined,
        questoes: formData.questoes,
        instrumento: formData.instrumento,
      },
      {
        onSuccess: (avaliacao) => {
          setAvaliacaoCriada(avaliacao);
          setMostrarCompartilhar(true);
        }
      }
    );
  };

  const handleFecharCompartilhar = () => {
    setMostrarCompartilhar(false);
    navigate('/avaliacoes');
  };

  const renderEtapa1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Informações Básicas</CardTitle>
        <CardDescription>
          Defina o nome, descrição e tipo da avaliação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Nome da Avaliação*</Label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Avaliação de Burnout Q1 2024"
          />
        </div>

        <div>
          <Label>Descrição</Label>
          <Textarea
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Descreva o objetivo desta avaliação..."
          />
        </div>

        <div>
          <Label>Cliente (Opcional)</Label>
          <Select
            value={formData.clienteId}
            onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
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

        <div>
          <Label>Tipo de Avaliação*</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {tiposAvaliacao.map((tipo) => (
              <div
                key={tipo.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${formData.tipo === tipo.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
                  }`}
                onClick={() => {
                  const instrumento = (tipo as any).instrumento ?? null;
                  if (tipo.id === "copsoq_medio") {
                    setFormData(prev => ({
                      ...prev,
                      tipo: tipo.id,
                      instrumento,
                      questoes: COPSOQ_MEDIO_QUESTOES.map((q, i) => ({
                        id: `copsoq-${q.ordem}`,
                        pergunta: q.pergunta,
                        tipo: q.tipo as any,
                        obrigatoria: q.obrigatoria,
                        categoria: q.categoria,
                        peso: q.peso,
                        ordem: q.ordem,
                        opcoes: [],
                      })),
                    }));
                  } else {
                    setFormData(prev => ({ ...prev, tipo: tipo.id, instrumento, questoes: [] }));
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{tipo.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-medium">{tipo.nome}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tipo.descricao}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Tipo de Acesso*</Label>
          <RadioGroup
            value={formData.tipo_acesso}
            onValueChange={(value: "publico" | "restrito") => setFormData({ ...formData, tipo_acesso: value, permite_auto_identificacao: false })}
            className="mt-2 space-y-3"
          >
            <div className={`flex items-start space-x-3 border rounded-lg p-4 ${formData.tipo_acesso === 'publico' ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <RadioGroupItem value="publico" id="publico" />
              <div className="flex-1">
                <Label htmlFor="publico" className="flex items-center gap-2 font-medium cursor-pointer">
                  <Globe className="h-4 w-4" />
                  Acesso Público
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Qualquer pessoa com o link pode responder. Ideal para pesquisas amplas e captação de leads.
                </p>
              </div>
            </div>

            <div className={`flex items-start space-x-3 border rounded-lg p-4 ${formData.tipo_acesso === 'restrito' ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <RadioGroupItem value="restrito" id="restrito" />
              <div className="flex-1">
                <Label htmlFor="restrito" className="flex items-center gap-2 font-medium cursor-pointer">
                  <Lock className="h-4 w-4" />
                  Acesso Restrito
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Apenas participantes cadastrados com link único podem responder. Maior controle e rastreabilidade.
                </p>
              </div>
            </div>
          </RadioGroup>

          {formData.tipo_acesso === 'restrito' && (
            <div className="flex items-center justify-between border rounded-lg p-4 mt-4 bg-muted/30">
              <div className="flex-1">
                <Label className="font-medium">Link Geral com Auto-identificação</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Gera um link único que pode ser compartilhado com todos. Os participantes informam nome e e-mail antes de responder,
                  garantindo que cada pessoa responda apenas uma vez.
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

        <div className="flex justify-end">
          <Button
            onClick={() => setEtapa(2)}
            disabled={!formData.nome || !formData.tipo}
          >
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapa2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Questões da Avaliação</CardTitle>
        <CardDescription>
          Crie as questões ou use um template pré-pronto. Configure o peso e categoria de cada questão.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="criar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="criar">
              <FileText className="h-4 w-4 mr-2" />
              Criar Questões
            </TabsTrigger>
            <TabsTrigger value="templates">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Usar Template
            </TabsTrigger>
          </TabsList>

          <TabsContent value="criar" className="space-y-4 pt-4">
            {formData.instrumento === "copsoq_medio" ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>🧠</span> COPSOQ II — 76 questões padronizadas
                  </CardTitle>
                  <CardDescription>
                    Instrumento validado. As questões não podem ser editadas para preservar a validade psicométrica.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {[
                    "Exigências Laborais (Q1–Q8)",
                    "Organização do Trabalho e Conteúdo (Q9–Q15)",
                    "Relações Sociais e Liderança (Q16–Q39)",
                    "Valores no Local de Trabalho (Q40–Q50)",
                    "Interface Trabalho–Indivíduo (Q51–Q60)",
                    "Saúde e Bem-Estar (Q61–Q72)",
                    "Comportamentos Ofensivos (Q73–Q76)",
                  ].map(dominio => (
                    <div key={dominio} className="flex items-center gap-2 py-2 border-b last:border-0 text-sm">
                      <span className="text-green-600">✓</span>
                      <span>{dominio}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <QuestoesManager
                questoes={formData.questoes}
                onChange={(questoes) => setFormData({ ...formData, questoes })}
              />
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 pt-4">
            <TemplateSelector
              onSelectTemplate={(questoes) => {
                setFormData({ ...formData, questoes });
                toast({
                  title: "Template aplicado",
                  description: `${questoes.length} questões foram carregadas. Você pode editá-las.`,
                });
              }}
            />
          </TabsContent>
        </Tabs>

        {formData.questoes.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">{formData.questoes.length} questões adicionadas</p>
              <p className="text-sm text-muted-foreground">
                Peso total: {formData.questoes.reduce((acc, q) => acc + q.peso, 0)} |
                Score máximo: {formData.questoes.reduce((acc, q) => acc + q.peso, 0).toFixed(1)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowImpactPreview(true)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Impacto
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setEtapa(1)}>
            Voltar
          </Button>
          <Button
            onClick={() => setEtapa(3)}
            disabled={formData.questoes.length === 0}
          >
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapa3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Período e Participantes
        </CardTitle>
        <CardDescription>
          Configure quando e quem participará da avaliação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Data de Início*</Label>
            <Input
              type="date"
              value={formData.dataInicio}
              onChange={(e) =>
                setFormData({ ...formData, dataInicio: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Data de Término*</Label>
            <Input
              type="date"
              value={formData.dataFim}
              onChange={(e) =>
                setFormData({ ...formData, dataFim: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <Label>Equipes Participantes (Opcional)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {equipes.map((equipe) => {
              const isSelected = formData.equipeSelecionadas.includes(equipe);
              return (
                <div
                  key={equipe}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                    }`}
                  onClick={() => {
                    const novasEquipes = isSelected
                      ? formData.equipeSelecionadas.filter((e) => e !== equipe)
                      : [...formData.equipeSelecionadas, equipe];
                    setFormData({ ...formData, equipeSelecionadas: novasEquipes });
                  }}
                >
                  <span className="text-sm">{equipe}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        <div>
          <Label>Configurações Avançadas</Label>
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="anonima">Respostas anônimas</Label>
              <Switch
                id="anonima"
                checked={formData.configuracoes.anonima}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    configuracoes: { ...formData.configuracoes, anonima: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lembrete">Enviar lembretes automáticos</Label>
              <Switch
                id="lembrete"
                checked={formData.configuracoes.enviarLembrete}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    configuracoes: { ...formData.configuracoes, enviarLembrete: checked },
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setEtapa(2)}>
            Voltar
          </Button>
          <Button
            onClick={() => setEtapa(4)}
            disabled={!formData.dataInicio || !formData.dataFim}
          >
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapa4 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Revisão e Publicação</CardTitle>
        <CardDescription>
          Revise as informações antes de salvar ou publicar a avaliação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações Básicas */}
        <div>
          <h3 className="font-semibold mb-2">Informações Básicas</h3>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Nome:</strong> {formData.nome}
            </p>
            {formData.descricao && (
              <p>
                <strong>Descrição:</strong> {formData.descricao}
              </p>
            )}
            <p>
              <strong>Tipo:</strong>{" "}
              {tiposAvaliacao.find((t) => t.id === formData.tipo)?.nome}
            </p>
          </div>
        </div>

        <Separator />

        {/* Questões */}
        <div>
          <h3 className="font-semibold mb-2">Questões</h3>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Total de questões: <strong>{formData.questoes.length}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Peso total: <strong>{formData.questoes.reduce((acc, q) => acc + q.peso, 0)}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Categorias: <strong>{[...new Set(formData.questoes.map(q => q.categoria))].join(", ")}</strong>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizar Questões
            </Button>
          </div>
        </div>

        <Separator />

        {/* Período */}
        <div>
          <h3 className="font-semibold mb-2">Período</h3>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Início:</strong>{" "}
              {formData.dataInicio
                ? new Date(formData.dataInicio).toLocaleDateString("pt-BR")
                : "-"}
            </p>
            <p>
              <strong>Término:</strong>{" "}
              {formData.dataFim
                ? new Date(formData.dataFim).toLocaleDateString("pt-BR")
                : "-"}
            </p>
          </div>
        </div>

        <Separator />

        {/* Participantes */}
        <div>
          <h3 className="font-semibold mb-2">Participantes</h3>
          {formData.equipeSelecionadas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.equipeSelecionadas.map((equipe) => (
                <Badge key={equipe} variant="secondary">
                  {equipe}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Todas as equipes</p>
          )}
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setEtapa(3)}>
            Voltar
          </Button>
          <Button variant="outline" onClick={handleSalvarRascunho} disabled={createAvaliacao.isPending}>
            Salvar Rascunho
          </Button>
          <Button onClick={handlePublicar} disabled={createAvaliacao.isPending}>
            Publicar Avaliação
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/avaliacoes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Criar Nova Avaliação</h1>
            <p className="text-muted-foreground">
              Configure sua avaliação em 4 etapas simples
            </p>
          </div>
        </div>

        <Progress value={(etapa / 4) * 100} className="mb-8" />

        {etapa === 1 && renderEtapa1()}
        {etapa === 2 && renderEtapa2()}
        {etapa === 3 && renderEtapa3()}
        {etapa === 4 && renderEtapa4()}

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

        <AvaliacaoPreview
          open={showPreview}
          onClose={() => setShowPreview(false)}
          nome={formData.nome}
          descricao={formData.descricao}
          questoes={formData.questoes}
        />

        {avaliacaoCriada && (
          <CompartilharAvaliacaoDialog
            avaliacao={avaliacaoCriada}
            open={mostrarCompartilhar}
            onOpenChange={(open) => {
              if (!open) handleFecharCompartilhar();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
