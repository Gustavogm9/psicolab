import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { ClipboardCheck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useAvaliacaoPublica } from '@/hooks/useAvaliacaoPublica';
import { useRespostaPublicaCreate, useRespostaTokenUpdate } from '@/hooks/useRespostaAvaliacaoPublica';
import { useParticipanteAutoCreate } from '@/hooks/useParticipanteAutoCreate';
import { PublicWhiteLabelProvider } from '@/components/layout/PublicWhiteLabelProvider';

const AvaliacaoPublicaContent = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [dadosContato, setDadosContato] = useState({
    nome: '',
    email: '',
    setor: '',
    cargo: '',
  });
  const [concluido, setConcluido] = useState(false);
  const [participanteAutoId, setParticipanteAutoId] = useState<any>(null);
  const [jaRespondeu, setJaRespondeu] = useState(false);

  const isToken = !!token;
  const identifier = token || slug || '';

  const { data: avaliacao, isLoading } = useAvaliacaoPublica(identifier, isToken);
  const { mutate: criarRespostaPublica } = useRespostaPublicaCreate();
  const { mutate: atualizarRespostaToken } = useRespostaTokenUpdate();
  const { mutate: autoCreateParticipante, isPending: criandoParticipante } = useParticipanteAutoCreate();

  // Efeito para carregar o rascunho do localStorage
  useEffect(() => {
    if (!avaliacao?.id) return;
    try {
      const savedDraft = localStorage.getItem(`draft_a_${avaliacao.id}`);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.respostas) setRespostas(draft.respostas);
        if (typeof draft.currentQuestion === 'number') setCurrentQuestion(draft.currentQuestion);
        if (draft.dadosContato) setDadosContato(draft.dadosContato);
        if (draft.participanteAutoId) setParticipanteAutoId(draft.participanteAutoId);
      }
    } catch (e) {
      console.error("Erro ao carregar rascunho:", e);
    }
  }, [avaliacao?.id]);

  // Efeito para salvar o rascunho no localStorage
  useEffect(() => {
    if (!avaliacao?.id) return;
    try {
      const draft = {
        respostas,
        currentQuestion,
        dadosContato,
        participanteAutoId
      };
      localStorage.setItem(`draft_a_${avaliacao.id}`, JSON.stringify(draft));
    } catch (e) {
      console.error("Erro ao salvar rascunho:", e);
    }
  }, [avaliacao?.id, respostas, currentQuestion, dadosContato, participanteAutoId]);

  const questoes = avaliacao?.questoes || [];
  const configuracoes = (avaliacao?.configuracoes as any) || {
    anonima: false,
    permitirEdicao: false
  };

  // Determinar se é modo auto-identificação
  const isAutoIdentificacao = avaliacao?.tipo_acesso === 'auto_identificacao';

  const handleResposta = (questaoId: string, valor: any) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: valor
    }));
  };

  const handleProximaQuestao = () => {
    if (currentQuestion === -1) {
      // Para auto-identificação ou público não-anônimo, validar dados
      if ((isAutoIdentificacao || !configuracoes.anonima) && (!dadosContato.nome || !dadosContato.email)) {
        toast({
          title: 'Dados incompletos',
          description: 'Por favor, preencha nome e e-mail para continuar.',
          variant: 'destructive'
        });
        return;
      }

      // Se é auto-identificação, criar participante primeiro
      if (isAutoIdentificacao && !participanteAutoId) {
        autoCreateParticipante({
          avaliacaoId: avaliacao!.id,
          nome: dadosContato.nome,
          email: dadosContato.email
        }, {
          onSuccess: (participante) => {
            if (participante.jaRespondeu) {
              setJaRespondeu(true);
            } else {
              setParticipanteAutoId(participante);
              setCurrentQuestion(0);
            }
          }
        });
        return;
      }

      setCurrentQuestion(0);
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
      finalizarAvaliacao();
    }
  };

  const handleVoltarQuestao = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const finalizarAvaliacao = () => {
    const respostasArray = Object.entries(respostas).map(([questaoId, valor]) => ({
      questao_id: questaoId,
      resposta: valor
    }));

    // Modo token (participante pré-cadastrado)
    if (isToken && avaliacao && 'participante' in avaliacao && avaliacao.participante) {
      atualizarRespostaToken({
        participanteId: avaliacao.participante.id,
        respostas: respostasArray
      }, {
        onSuccess: () => {
          setConcluido(true);
          if (avaliacao?.id) {
            localStorage.removeItem(`draft_a_${avaliacao.id}`);
          }
        }
      });
      return;
    }

    // Modo auto-identificação (participante criado durante o fluxo)
    if (isAutoIdentificacao && participanteAutoId) {
      atualizarRespostaToken({
        participanteId: participanteAutoId.id,
        respostas: respostasArray
      }, {
        onSuccess: () => {
          setConcluido(true);
          if (avaliacao?.id) {
            localStorage.removeItem(`draft_a_${avaliacao.id}`);
          }
        }
      });
      return;
    }

    // Modo público
    criarRespostaPublica({
      avaliacaoId: avaliacao!.id,
      nome: dadosContato.nome,
      email: dadosContato.email,
      setor: dadosContato.setor || undefined,
      cargo: dadosContato.cargo || undefined,
      respostas: respostasArray
    }, {
      onSuccess: () => {
        setConcluido(true);
        if (avaliacao?.id) {
          localStorage.removeItem(`draft_a_${avaliacao.id}`);
        }
      }
    });
  };

  const getCopsoqEscalaLabels = (categoria: string): string[] => {
    if (categoria === "Saúde Geral") {
      return ["Excelente", "Muito boa", "Boa", "Razoável", "Deficitária"];
    }
    if (
      categoria === "Significado do Trabalho" ||
      categoria === "Compromisso c/ Local de Trabalho" ||
      categoria === "Satisfação Laboral" ||
      categoria === "Insegurança Laboral" ||
      categoria === "Conflito Trabalho–Família"
    ) {
      return ["Nada/\nquase nada", "Um pouco", "Moderadamente", "Muito", "Extremamente"];
    }
    // Escala padrão COPSOQ — frequência
    return ["Nunca/\nQuase nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"];
  };

  const renderQuestao = (questao: any) => {
    const valor = respostas[questao.id] || '';

    switch (questao.tipo) {
      case 'escala': {
        const isCopsoq = (avaliacao as any)?.instrumento === "copsoq_medio";
        const copsoqLabels = isCopsoq ? getCopsoqEscalaLabels(questao.categoria || "") : null;

        return (
          <RadioGroup value={valor} onValueChange={(v) => handleResposta(questao.id, v)}>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex flex-col items-center gap-2 flex-1">
                  <RadioGroupItem value={num.toString()} id={`${questao.id}-${num}`} />
                  <Label
                    htmlFor={`${questao.id}-${num}`}
                    className={`text-center cursor-pointer ${isCopsoq ? "text-xs leading-tight text-muted-foreground" : "text-sm"}`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {isCopsoq && copsoqLabels ? copsoqLabels[num - 1] : num}
                  </Label>
                </div>
              ))}
            </div>
            {!isCopsoq && (
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Discordo totalmente</span>
                <span>Concordo totalmente</span>
              </div>
            )}
          </RadioGroup>
        );
      }

      case 'multipla_escolha':
        const opcoesRaw = questao.opcoes || [];
        const opcoes = Array.isArray(opcoesRaw) ? opcoesRaw : [];

        return (
          <RadioGroup value={valor} onValueChange={(v) => handleResposta(questao.id, v)}>
            <div className="space-y-3">
              {opcoes.map((opcao: string, index: number) => (
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

  if (!avaliacao || avaliacao.status !== 'ativa') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="text-center py-12">
            <ClipboardCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Avaliação não disponível</h2>
            <p className="text-muted-foreground">
              Esta avaliação não está mais ativa ou não foi encontrada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de "já respondeu" para auto-identificação
  if (jaRespondeu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="text-center py-12 space-y-6">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto" />
            <div>
              <h2 className="text-3xl font-bold mb-2">Você já respondeu!</h2>
              <p className="text-muted-foreground">
                Este e-mail já foi utilizado para responder esta avaliação.
                Cada participante pode responder apenas uma vez.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (concluido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="text-center py-12 space-y-6">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h2 className="text-3xl font-bold mb-2">Avaliação Concluída!</h2>
              <p className="text-muted-foreground">
                Obrigado por suas respostas! Entraremos em contato em breve.
              </p>
            </div>
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
              <ClipboardCheck className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-3xl">{avaliacao.nome}</CardTitle>
            <CardDescription className="text-base mt-2">
              {avaliacao.descricao}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tipo</span>
                <span className="font-semibold">{avaliacao.tipo}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total de questões</span>
                <span className="font-semibold">{questoes.length}</span>
              </div>
            </div>

            {/* Campos de identificação para auto-identificação ou público não-anônimo */}
            {(isAutoIdentificacao || !configuracoes.anonima) && (
              <div className="space-y-4">
                {isAutoIdentificacao && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-medium">Identificação necessária</p>
                    <p className="text-blue-600 mt-1">
                      Por favor, informe seus dados para iniciar. Cada pessoa pode responder apenas uma vez.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo *</Label>
                  <Input
                    id="nome"
                    value={dadosContato.nome}
                    onChange={(e) => setDadosContato(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={dadosContato.email}
                    onChange={(e) => setDadosContato(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setor">Setor</Label>
                  <Input
                    id="setor"
                    value={dadosContato.setor}
                    onChange={(e) => setDadosContato(prev => ({ ...prev, setor: e.target.value }))}
                    placeholder="Ex: Administrativo, Operações, TI..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={dadosContato.cargo}
                    onChange={(e) => setDadosContato(prev => ({ ...prev, cargo: e.target.value }))}
                    placeholder="Ex: Analista, Coordenador, Gerente..."
                  />
                </div>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleProximaQuestao}
              disabled={criandoParticipante}
            >
              {criandoParticipante ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Iniciar Avaliação'
              )}
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
          <CardTitle className="text-2xl mt-4">{questaoAtual.pergunta}</CardTitle>
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
const AvaliacaoPublica = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const isToken = !!token;
  const identifier = token || slug || '';

  const { data: avaliacao, isLoading: isAvaliacaoLoading } = useAvaliacaoPublica(identifier, isToken);

  // Tela de loading neutra enquanto avaliação está carregando
  if (isAvaliacaoLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
          <p className="text-sm text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Só renderiza com tema quando avaliação estiver pronta
  // O Provider cuida de aplicar as cores ANTES de renderizar o conteúdo
  return (
    <PublicWhiteLabelProvider userId={avaliacao?.consultora_id}>
      <AvaliacaoPublicaContent />
    </PublicWhiteLabelProvider>
  );
};

export default AvaliacaoPublica;
