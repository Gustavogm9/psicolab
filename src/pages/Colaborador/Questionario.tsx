import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Heart, CheckCircle } from "lucide-react";

interface Pergunta {
  id: string;
  texto: string;
  tipo: "escala" | "multipla_escolha";
  opcoes?: string[];
}

const ColaboradorQuestionario = () => {
  const navigate = useNavigate();
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});

  // Mock de perguntas de burnout
  const perguntas: Pergunta[] = [
    {
      id: "1",
      texto: "Com que frequência você se sente emocionalmente esgotado pelo seu trabalho?",
      tipo: "escala"
    },
    {
      id: "2", 
      texto: "Com que frequência você se sente cansado quando acorda e tem que enfrentar outro dia de trabalho?",
      tipo: "escala"
    },
    {
      id: "3",
      texto: "Trabalhar com pessoas o dia todo me causa estresse?",
      tipo: "escala"
    },
    {
      id: "4",
      texto: "Você sente que está trabalhando demais?",
      tipo: "escala"
    },
    {
      id: "5",
      texto: "Qual dessas opções melhor descreve como você se sente sobre seu trabalho atualmente?",
      tipo: "multipla_escolha",
      opcoes: [
        "Muito satisfeito e energizado",
        "Satisfeito na maior parte do tempo",
        "Neutro, nem satisfeito nem insatisfeito",
        "Frequentemente insatisfeito",
        "Muito insatisfeito e desmotivado"
      ]
    },
    {
      id: "6",
      texto: "Com que frequência você consegue desconectar do trabalho após o expediente?",
      tipo: "escala"
    },
    {
      id: "7",
      texto: "Você sente que tem controle sobre como executa suas tarefas no trabalho?",
      tipo: "escala"
    },
    {
      id: "8",
      texto: "Com que frequência você sente que seu trabalho é reconhecido e valorizado?",
      tipo: "escala"
    }
  ];

  const opcoesEscala = [
    { valor: "1", label: "Nunca" },
    { valor: "2", label: "Raramente" },
    { valor: "3", label: "Às vezes" },
    { valor: "4", label: "Frequentemente" },
    { valor: "5", label: "Sempre" }
  ];

  const pergunta = perguntas[perguntaAtual];
  const progresso = ((perguntaAtual + 1) / perguntas.length) * 100;

  const handleResposta = (valor: string) => {
    setRespostas(prev => ({
      ...prev,
      [pergunta.id]: valor
    }));
  };

  const proximaPergunta = () => {
    if (perguntaAtual < perguntas.length - 1) {
      setPerguntaAtual(perguntaAtual + 1);
    } else {
      // Finalizar questionário
      navigate("/colaborador/obrigado");
    }
  };

  const perguntaAnterior = () => {
    if (perguntaAtual > 0) {
      setPerguntaAtual(perguntaAtual - 1);
    }
  };

  const respostaAtual = respostas[pergunta.id];

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Pesquisa de Bem-estar</h1>
          <p className="text-muted-foreground">
            Suas respostas são anônimas e nos ajudam a melhorar o ambiente de trabalho
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Pergunta {perguntaAtual + 1} de {perguntas.length}
            </span>
            <Badge variant="outline">
              {Math.round(progresso)}% completo
            </Badge>
          </div>
          <Progress value={progresso} className="h-2" />
        </div>

        {/* Pergunta */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{pergunta.texto}</CardTitle>
            {pergunta.tipo === "escala" && (
              <CardDescription>
                Selecione a opção que melhor representa sua experiência
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {pergunta.tipo === "escala" ? (
              <RadioGroup 
                value={respostaAtual || ""} 
                onValueChange={handleResposta}
                className="space-y-3"
              >
                {opcoesEscala.map((opcao) => (
                  <div key={opcao.valor} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <RadioGroupItem value={opcao.valor} id={opcao.valor} />
                    <Label htmlFor={opcao.valor} className="flex-1 cursor-pointer">
                      {opcao.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <RadioGroup 
                value={respostaAtual || ""} 
                onValueChange={handleResposta}
                className="space-y-3"
              >
                {pergunta.opcoes?.map((opcao, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <RadioGroupItem value={index.toString()} id={index.toString()} />
                    <Label htmlFor={index.toString()} className="flex-1 cursor-pointer text-sm">
                      {opcao}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={perguntaAnterior}
            disabled={perguntaAtual === 0}
          >
            Anterior
          </Button>
          
          <Button 
            onClick={proximaPergunta}
            disabled={!respostaAtual}
            variant={perguntaAtual === perguntas.length - 1 ? "bright" : "default"}
            className="flex items-center space-x-2"
          >
            {perguntaAtual === perguntas.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Finalizar</span>
              </>
            ) : (
              <span>Próxima</span>
            )}
          </Button>
        </div>

        {/* Info Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>🔒 Suas respostas são completamente anônimas e confidenciais</p>
        </div>
      </div>
    </div>
  );
};

export default ColaboradorQuestionario;