import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  Eye,
  Play,
  Clock,
  Users,
  BarChart3,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { useState } from "react";
import { useAvaliacaoDetalhes } from "@/hooks/useAvaliacaoDetalhes";
import { useAvaliacaoUpdate } from "@/hooks/useAvaliacaoUpdate";
import { useEnviarConvites } from "@/hooks/useEnviarConvites";
import { toast } from "@/hooks/use-toast";
import { CompartilharAvaliacao } from "@/components/avaliacoes/CompartilharAvaliacao";

const PreviewAvaliacao = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const { data: avaliacaoData, isLoading } = useAvaliacaoDetalhes(id);
  const { mutate: updateAvaliacao } = useAvaliacaoUpdate();
  const { mutate: enviarConvites, isPending: enviandoConvites } = useEnviarConvites();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando preview...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!avaliacaoData || !avaliacaoData.questoes || avaliacaoData.questoes.length === 0) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {!avaliacaoData ? "Avaliação não encontrada" : "Nenhuma questão cadastrada"}
          </p>
          <Button onClick={() => navigate(`/avaliacoes/editar/${id}`)} className="mt-4">
            {!avaliacaoData ? "Voltar" : "Adicionar Questões"}
          </Button>
        </div>
      </MainLayout>
    );
  }

  const avaliacao = avaliacaoData;
  const currentQ = avaliacao.questoes[currentQuestion];
  const progress = ((currentQuestion + 1) / avaliacao.questoes.length) * 100;

  const handleResponse = (value: any) => {
    setResponses({
      ...responses,
      [currentQ.id]: value
    });
  };

  const handlePublish = () => {
    if (!id) return;
    
    updateAvaliacao(
      { id, status: 'ativa' as any },
      {
        onSuccess: () => {
          toast({
            title: 'Avaliação publicada',
            description: 'Enviando convites aos participantes...',
          });
          
          // Enviar convites aos participantes
          enviarConvites(
            { avaliacaoId: id },
            {
              onSuccess: () => {
                navigate('/avaliacoes');
              },
            }
          );
        },
      }
    );
  };

  const nextQuestion = () => {
    if (currentQuestion < avaliacao.questoes.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const renderQuestion = () => {
    const response = responses[currentQ.id];

    switch (currentQ.tipo) {
      case "escala":
        const opcoes = currentQ.opcoes as { max?: number; min?: number } | null;
        const max = opcoes?.max || 10;
        const min = opcoes?.min || 1;
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Avalie de {min} (muito ruim) a {max} (excelente)
              </p>
              <div className="flex justify-center items-center space-x-2">
                {[...Array(max - min + 1)].map((_, i) => {
                  const value = min + i;
                  return (
                    <button
                      key={value}
                      onClick={() => handleResponse(value)}
                      className={`w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        response === value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-muted-foreground/30 hover:border-primary'
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Muito ruim</span>
                <span>Excelente</span>
              </div>
            </div>
          </div>
        );

      case "multipla_escolha":
        const opcoesMultipla = (currentQ.opcoes as string[]) || [];
        return (
          <div className="space-y-3 animate-fade-in">
            {opcoesMultipla.map((opcao: string, index: number) => (
              <button
                key={index}
                onClick={() => handleResponse(opcao)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  response === opcao
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-muted-foreground/20 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    response === opcao ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                  }`}></div>
                  <span>{opcao}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case "sim_nao":
        return (
          <div className="flex space-x-4 justify-center animate-fade-in">
            <button
              onClick={() => handleResponse(true)}
              className={`flex items-center space-x-2 px-6 py-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                response === true
                  ? 'bg-green-500/10 border-green-500 text-green-700'
                  : 'border-muted-foreground/20 hover:border-green-500/50'
              }`}
            >
              <ThumbsUp className="h-5 w-5" />
              <span>Sim</span>
            </button>
            <button
              onClick={() => handleResponse(false)}
              className={`flex items-center space-x-2 px-6 py-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                response === false
                  ? 'bg-red-500/10 border-red-500 text-red-700'
                  : 'border-muted-foreground/20 hover:border-red-500/50'
              }`}
            >
              <ThumbsDown className="h-5 w-5" />
              <span>Não</span>
            </button>
          </div>
        );

      case "texto_livre":
        return (
          <div className="animate-fade-in">
            <textarea
              value={response || ''}
              onChange={(e) => handleResponse(e.target.value)}
              placeholder="Digite sua resposta aqui..."
              className="w-full p-4 border-2 border-muted-foreground/20 rounded-lg focus:border-primary focus:outline-none resize-none"
              rows={4}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/avaliacoes/editar/${id}`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Edição
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Preview da Avaliação</h1>
              <p className="text-muted-foreground">Visualize como os participantes verão a avaliação</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Eye className="h-3 w-3" />
            Modo Preview
          </Badge>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{avaliacao.nome}</CardTitle>
                <CardDescription className="mt-2">{avaliacao.descricao}</CardDescription>
              </div>
              <Badge className="bg-blue-500/10 text-blue-700 border-blue-200">
                {avaliacao.tipo}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{(avaliacao.configuracoes as any)?.tempo_estimado || 15} min</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span>{avaliacao.questoes.length} questões</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Anônima: {(avaliacao.configuracoes as any)?.anonima ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex items-center gap-2">
                {currentQ.obrigatoria ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <span>{currentQ.obrigatoria ? 'Obrigatória' : 'Opcional'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Progresso da Avaliação</span>
                <span>{currentQuestion + 1} de {avaliacao.questoes.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="min-h-[400px]">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {currentQ.categoria && (
                    <Badge variant="outline" className="text-xs">
                      {currentQ.categoria}
                    </Badge>
                  )}
                  {currentQ.obrigatoria && (
                    <Badge variant="destructive" className="text-xs">
                      Obrigatória
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg leading-relaxed">
                  {currentQuestion + 1}. {currentQ.pergunta}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderQuestion()}

            <Separator />

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-2">
                {avaliacao.questoes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentQuestion
                        ? 'bg-primary'
                        : responses[avaliacao.questoes[index].id]
                        ? 'bg-green-500'
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              {currentQuestion === avaliacao.questoes.length - 1 ? (
                <Button className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Finalizar
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  disabled={currentQ.obrigatoria && !responses[currentQ.id]}
                  className="gap-2"
                >
                  Próxima
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compartilhar */}
        {avaliacao.status === 'ativa' && (
          <CompartilharAvaliacao 
            avaliacao={avaliacao} 
            participantes={avaliacaoData.participantes || []}
          />
        )}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate(`/avaliacoes/editar/${id}`)}>
                Voltar para Edição
              </Button>
              <Button 
                onClick={handlePublish} 
                className="gap-2"
                disabled={enviandoConvites}
              >
                <Play className="h-4 w-4" />
                {enviandoConvites ? 'Publicando...' : 'Publicar Avaliação'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PreviewAvaliacao;
