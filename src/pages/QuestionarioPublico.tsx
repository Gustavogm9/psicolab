import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Brain, CheckCircle2, Loader2 } from 'lucide-react';
import { useQuestionarioDetalhes } from '@/hooks/useQuestionarioDetalhes';
import { useRespostaCreate, useRespostaUpdate } from '@/hooks/useRespostaPublica';
import { PublicWhiteLabelProvider } from '@/components/layout/PublicWhiteLabelProvider';

const QuestionarioPublicoContent = () => {
  const { slug } = useParams<{ slug: string }>();
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [dadosContato, setDadosContato] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  const [respostaId, setRespostaId] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);
  const [dataInicio] = useState(new Date());

  const { data: questionario, isLoading } = useQuestionarioDetalhes(slug || '');
  const { mutate: criarResposta } = useRespostaCreate();
  const { mutate: atualizarResposta } = useRespostaUpdate();

  // Efeito para carregar o rascunho do localStorage
  useEffect(() => {
    if (!questionario?.id) return;
    try {
      const savedDraft = localStorage.getItem(`draft_q_${questionario.id}`);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.respostas) setRespostas(draft.respostas);
        if (typeof draft.currentQuestion === 'number') setCurrentQuestion(draft.currentQuestion);
        if (draft.dadosContato) setDadosContato(draft.dadosContato);
        if (draft.respostaId) setRespostaId(draft.respostaId);
      }
    } catch (e) {
      console.error("Erro ao carregar rascunho:", e);
    }
  }, [questionario?.id]);

  // Efeito para salvar o rascunho no localStorage
  useEffect(() => {
    if (!questionario?.id) return;
    try {
      const draft = {
        respostas,
        currentQuestion,
        dadosContato,
        respostaId
      };
      localStorage.setItem(`draft_q_${questionario.id}`, JSON.stringify(draft));
    } catch (e) {
      console.error("Erro ao salvar rascunho:", e);
    }
  }, [questionario?.id, respostas, currentQuestion, dadosContato, respostaId]);

  const questoes = questionario?.questoes || [];
  const configuracoes = (questionario?.configuracoes as any) || {
    coletarEmail: true,
    coletarNome: true,
    coletarTelefone: true,
    mensagemAgradecimento: 'Obrigado por suas respostas!'
  };

  const handleResposta = (questaoId: string, valor: any) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: valor
    }));
  };

  const calcularScore = () => {
    let score = 0;
    let maxScore = 0;

    questoes.forEach((questao: any) => {
      maxScore += (questao.peso || 1) * 20;
      const resposta = respostas[questao.id];

      if (questao.tipo === 'escala' && resposta) {
        score += parseInt(resposta) * (questao.peso || 1) * 4;
      } else if (questao.tipo === 'sim_nao' && resposta === 'sim') {
        score += (questao.peso || 1) * 20;
      } else if (questao.tipo === 'multipla_escolha' && resposta) {
        const opcaoIndex = questao.opcoes?.indexOf(resposta) || 0;
        const valorOpcao = ((questao.opcoes?.length - opcaoIndex) / questao.opcoes?.length) * 100;
        score += (valorOpcao / 100) * (questao.peso || 1) * 20;
      }
    });

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  };

  const categorizarResultado = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Médio';
    return 'Necessita Atenção';
  };

  const handleProximaQuestao = () => {
    if (currentQuestion === -1) {
      const camposFaltantes = [];

      if (configuracoes.coletarNome && !dadosContato.nome) {
        camposFaltantes.push('nome');
      }
      if (configuracoes.coletarEmail && !dadosContato.email) {
        camposFaltantes.push('e-mail');
      }
      if (configuracoes.coletarTelefone && !dadosContato.telefone) {
        camposFaltantes.push('telefone');
      }

      if (camposFaltantes.length > 0) {
        toast({
          title: 'Dados incompletos',
          description: `Por favor, preencha: ${camposFaltantes.join(', ')}`,
          variant: 'destructive'
        });
        return;
      }

      criarResposta({
        questionarioId: questionario!.id,
        nome: dadosContato.nome,
        email: dadosContato.email,
        telefone: dadosContato.telefone,
        respostas: [],
        origem: 'link'
      }, {
        onSuccess: (data) => {
          setRespostaId(data.id);
          setCurrentQuestion(0);
        }
      });
      return;
    }

    const questaoAtual = questoes[currentQuestion];
    
    if (questaoAtual.obrigatoria && !respostas[questaoAtual.id]) {
      toast({
        title: 'Resposta obrigatória',
        description: 'Por favor, responda esta questão antes de continuar.',
        variant: 'destructive'
      });
      return;
    }

    if (currentQuestion < questoes.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      finalizarQuestionario();
    }
  };

  const handleVoltarQuestao = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const finalizarQuestionario = () => {
    if (!respostaId) return;

    const score = calcularScore();
    const categoria = categorizarResultado(score);
    const tempoResposta = Math.floor((new Date().getTime() - dataInicio.getTime()) / 1000);

    const respostasArray = Object.entries(respostas).map(([questaoId, valor]) => ({
      questao_id: questaoId,
      resposta: valor
    }));

    atualizarResposta({
      id: respostaId,
      respostas: respostasArray,
      status: 'concluida',
      scoreTotal: score,
      categoria,
      dataFim: new Date(),
      tempoResposta
    }, {
      onSuccess: () => {
        setConcluido(true);
        if (questionario?.id) {
          localStorage.removeItem(`draft_q_${questionario.id}`);
        }
      }
    });
  };

  const renderQuestao = (questao: any) => {
    const valor = respostas[questao.id] || '';

    switch (questao.tipo) {
      case 'escala':
        return (
          <RadioGroup value={valor} onValueChange={(v) => handleResposta(questao.id, v)}>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex flex-col items-center gap-2">
                  <RadioGroupItem value={num.toString()} id={`${questao.id}-${num}`} />
                  <Label htmlFor={`${questao.id}-${num}`} className="text-sm">{num}</Label>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Discordo totalmente</span>
              <span>Concordo totalmente</span>
            </div>
          </RadioGroup>
        );

      case 'multipla_escolha':
        return (
          <RadioGroup value={valor} onValueChange={(v) => handleResposta(questao.id, v)}>
            <div className="space-y-3">
              {questao.opcoes?.map((opcao: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={opcao} id={`${questao.id}-${index}`} />
                  <Label htmlFor={`${questao.id}-${index}`} className="font-normal cursor-pointer">
                    {opcao}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'sim_nao':
        return (
          <RadioGroup value={valor} onValueChange={(v) => handleResposta(questao.id, v)}>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sim" id={`${questao.id}-sim`} />
                <Label htmlFor={`${questao.id}-sim`} className="font-normal cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nao" id={`${questao.id}-nao`} />
                <Label htmlFor={`${questao.id}-nao`} className="font-normal cursor-pointer">Não</Label>
              </div>
            </div>
          </RadioGroup>
        );

      case 'texto_livre':
        return (
          <Textarea
            value={valor || ''}
            onChange={(e) => handleResposta(questao.id, e.target.value)}
            placeholder="Digite sua resposta..."
            rows={4}
          />
        );

      default:
        return null;
    }
  };

  // Loading interno usa cores neutras - cores da marca já devem estar aplicadas pelo Provider
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questionario || !questionario.ativo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="text-center py-12">
            <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Questionário não disponível</h2>
            <p className="text-muted-foreground">
              Este questionário não está mais ativo ou não foi encontrado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (concluido) {
    const score = calcularScore();
    const categoria = categorizarResultado(score);

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="text-center py-12 space-y-6">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h2 className="text-3xl font-bold mb-2">Questionário Concluído!</h2>
              <p className="text-muted-foreground">
                {configuracoes.mensagemAgradecimento || 'Obrigado por suas respostas!'}
              </p>
            </div>

            <div className="bg-primary/10 rounded-lg p-6 space-y-4">
              <div>
                <div className="text-5xl font-bold text-primary mb-2">{score}</div>
                <div className="text-sm text-muted-foreground">Pontuação Total</div>
              </div>
              <div>
                <div className="text-xl font-semibold">{categoria}</div>
                <div className="text-sm text-muted-foreground">Categoria</div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Entraremos em contato em breve através do e-mail fornecido.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentQuestion === -1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Brain className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-3xl">{questionario.titulo}</CardTitle>
            <CardDescription className="text-base mt-2">
              {questionario.descricao}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tempo estimado</span>
                <span className="font-semibold">{questionario.tempo_estimado} minutos</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total de questões</span>
                <span className="font-semibold">{questoes.length}</span>
              </div>
            </div>

            <div className="space-y-4">
              {configuracoes.coletarNome && (
                <div className="space-y-2">
                  <Label htmlFor="nome">
                    Nome completo {configuracoes.coletarNome && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="nome"
                    value={dadosContato.nome}
                    onChange={(e) => setDadosContato(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Seu nome"
                  />
                </div>
              )}

              {configuracoes.coletarEmail && (
                <div className="space-y-2">
                  <Label htmlFor="email">
                    E-mail {configuracoes.coletarEmail && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={dadosContato.email}
                    onChange={(e) => setDadosContato(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                </div>
              )}

              {configuracoes.coletarTelefone && (
                <div className="space-y-2">
                  <Label htmlFor="telefone">
                    Telefone {configuracoes.coletarTelefone && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={dadosContato.telefone}
                    onChange={(e) => setDadosContato(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleProximaQuestao}
            >
              Iniciar Questionário
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questaoAtual = questoes[currentQuestion];
  const progresso = ((currentQuestion + 1) / questoes.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Questão {currentQuestion + 1} de {questoes.length}</span>
            <span>{Math.round(progresso)}% concluído</span>
          </div>
          <Progress value={progresso} className="h-2" />
          <CardTitle className="text-2xl mt-4">{questaoAtual.texto}</CardTitle>
          {questaoAtual.obrigatoria && (
            <CardDescription>* Resposta obrigatória</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {renderQuestao(questaoAtual)}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleVoltarQuestao}
              disabled={currentQuestion === 0}
              className="flex-1"
            >
              Anterior
            </Button>
            <Button
              onClick={handleProximaQuestao}
              className="flex-1"
            >
              {currentQuestion === questoes.length - 1 ? 'Finalizar' : 'Próxima'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Wrapper component que aplica o tema do psicólogo SEM redirect
const QuestionarioPublico = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: questionario, isLoading: isQuestionarioLoading } = useQuestionarioDetalhes(slug || '');

  // Tela de loading neutra enquanto questionário está carregando
  if (isQuestionarioLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
          <p className="text-sm text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Só renderiza com tema quando questionário estiver pronto
  // O Provider cuida de aplicar as cores ANTES de renderizar o conteúdo
  return (
    <PublicWhiteLabelProvider userId={questionario?.consultora_id}>
      <QuestionarioPublicoContent />
    </PublicWhiteLabelProvider>
  );
};

export default QuestionarioPublico;
