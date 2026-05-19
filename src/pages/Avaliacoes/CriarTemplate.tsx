import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTemplateCreate } from "@/hooks/useTemplates";
import { QuestoesManager } from "@/components/avaliacoes/QuestoesManager";
import { AvaliacaoPreview } from "@/components/avaliacoes/AvaliacaoPreview";
import { Questao } from "@/components/avaliacoes/QuestaoEditor";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function CriarTemplate() {
  const navigate = useNavigate();
  const createTemplate = useTemplateCreate();

  const [etapa, setEtapa] = useState(1);
  const [formData, setFormData] = useState<{
    nome: string;
    descricao: string;
    tipo: string;
    categoria: string;
    questoes: Questao[];
  }>({
    nome: "",
    descricao: "",
    tipo: "",
    categoria: "",
    questoes: [],
  });
  const [showPreview, setShowPreview] = useState(false);

  const tiposAvaliacao = [
    {
      id: "burnout",
      nome: "Burnout",
      descricao: "Avaliação de esgotamento profissional",
      emoji: "🔥",
    },
    {
      id: "clima",
      nome: "Clima Organizacional",
      descricao: "Pesquisa de satisfação e ambiente de trabalho",
      emoji: "🌤️",
    },
    {
      id: "assedio",
      nome: "Assédio e Discriminação",
      descricao: "Avaliação de situações de assédio no ambiente de trabalho",
      emoji: "🛡️",
    },
    {
      id: "lideranca",
      nome: "Liderança",
      descricao: "Avaliação de práticas de liderança",
      emoji: "👔",
    },
    {
      id: "personalizada",
      nome: "Personalizada",
      descricao: "Crie suas próprias perguntas",
      emoji: "⚙️",
    },
  ];

  const categorias = [
    "Saúde Mental",
    "Clima Organizacional",
    "Liderança",
    "Assédio",
    "Diversidade",
    "Desenvolvimento",
  ];

  const handleSalvar = () => {
    if (formData.questoes.length === 0) {
      toast({
        title: "Questões necessárias",
        description: "Adicione pelo menos uma questão antes de salvar",
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

    const tempoEstimado = Math.ceil(formData.questoes.length * 1.5); // 1.5 min por questão

    createTemplate.mutate(
      {
        nome: formData.nome,
        descricao: formData.descricao,
        categoria: formData.categoria,
        tipo: formData.tipo,
        questoes: formData.questoes,
        numero_questoes: formData.questoes.length,
        tempo_estimado: tempoEstimado,
      },
      {
        onSuccess: () => {
          navigate("/avaliacoes/templates");
        },
      }
    );
  };

  const renderEtapa1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Template</CardTitle>
        <CardDescription>
          Defina o nome, categoria e tipo do template
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Nome do Template*</Label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Template de Burnout Completo"
          />
        </div>

        <div>
          <Label>Descrição</Label>
          <Textarea
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Descreva para que serve este template..."
          />
        </div>

        <div>
          <Label>Categoria*</Label>
          <Select
            value={formData.categoria}
            onValueChange={(value) => setFormData({ ...formData, categoria: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
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
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.tipo === tipo.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setFormData({ ...formData, tipo: tipo.id })}
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

        <div className="flex justify-end">
          <Button
            onClick={() => setEtapa(2)}
            disabled={!formData.nome || !formData.tipo || !formData.categoria}
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
        <CardTitle>Questões do Template</CardTitle>
        <CardDescription>
          Crie as questões que farão parte deste template reutilizável
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <QuestoesManager
          questoes={formData.questoes}
          onChange={(questoes) => setFormData({ ...formData, questoes })}
        />

        {formData.questoes.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">{formData.questoes.length} questões adicionadas</p>
              <p className="text-sm text-muted-foreground">
                Peso total: {formData.questoes.reduce((acc, q) => acc + (Number(q.peso) || 0), 0)}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
          </div>
        )}

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setEtapa(1)}>
            Voltar
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={formData.questoes.length === 0 || createTemplate.isPending}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {createTemplate.isPending ? "Salvando..." : "Salvar Template"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/avaliacoes">Avaliações</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/avaliacoes/templates">Templates</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Novo Template</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/avaliacoes/templates")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Criar Template</h1>
            <p className="text-muted-foreground">
              Crie um template reutilizável para suas avaliações
            </p>
          </div>
        </div>

        {/* Indicador de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Etapa {etapa} de 2</span>
            <span>{Math.round((etapa / 2) * 100)}%</span>
          </div>
          <Progress value={(etapa / 2) * 100} />
        </div>

        {/* Etapas */}
        {etapa === 1 && renderEtapa1()}
        {etapa === 2 && renderEtapa2()}

        {/* Preview Modal */}
        <AvaliacaoPreview
          open={showPreview}
          onClose={() => setShowPreview(false)}
          nome={formData.nome}
          descricao={formData.descricao || ""}
          questoes={formData.questoes}
        />
      </div>
    </MainLayout>
  );
}
