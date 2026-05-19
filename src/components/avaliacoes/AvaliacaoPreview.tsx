import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Questao } from "./QuestaoEditor";

interface AvaliacaoPreviewProps {
  open: boolean;
  onClose: () => void;
  nome: string;
  descricao: string;
  questoes: Questao[];
}

export const AvaliacaoPreview = ({ open, onClose, nome, descricao, questoes }: AvaliacaoPreviewProps) => {
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestao = questoes[currentIndex];
  const progress = ((currentIndex + 1) / questoes.length) * 100;

  const handleNext = () => {
    if (currentIndex < questoes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleResposta = (valor: any) => {
    setRespostas({ ...respostas, [currentQuestao.id]: valor });
  };

  const renderQuestao = () => {
    if (!currentQuestao) return null;

    switch (currentQuestao.tipo) {
      case 'escala':
        return (
          <RadioGroup
            value={respostas[currentQuestao.id]?.toString()}
            onValueChange={(v) => handleResposta(parseInt(v))}
          >
            <div className="flex justify-between gap-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex flex-col items-center gap-2">
                  <RadioGroupItem value={num.toString()} id={`opt-${num}`} />
                  <Label htmlFor={`opt-${num}`}>{num}</Label>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Discordo totalmente</span>
              <span>Concordo totalmente</span>
            </div>
          </RadioGroup>
        );

      case 'multipla_escolha':
        return (
          <RadioGroup
            value={respostas[currentQuestao.id]}
            onValueChange={handleResposta}
          >
            {currentQuestao.opcoes?.map((opcao, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={opcao} id={`opt-${index}`} />
                <Label htmlFor={`opt-${index}`}>{opcao}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'sim_nao':
        return (
          <RadioGroup
            value={respostas[currentQuestao.id]}
            onValueChange={handleResposta}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sim" id="sim" />
              <Label htmlFor="sim">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nao" id="nao" />
              <Label htmlFor="nao">Não</Label>
            </div>
          </RadioGroup>
        );

      case 'texto_livre':
        return (
          <Textarea
            value={respostas[currentQuestao.id] || ""}
            onChange={(e) => handleResposta(e.target.value)}
            placeholder="Digite sua resposta..."
            className="min-h-[120px]"
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{nome}</DialogTitle>
          {descricao && (
            <p className="text-sm text-muted-foreground">{descricao}</p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Questão {currentIndex + 1} de {questoes.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Questão */}
          {currentQuestao && (
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-medium">
                    {currentQuestao.pergunta}
                    {currentQuestao.obrigatoria && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{currentQuestao.categoria}</Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-help">
                      ⚖️ Peso: {currentQuestao.peso}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      <strong>Peso {currentQuestao.peso}/10:</strong> Esta questão tem{' '}
                      {currentQuestao.peso <= 3 && 'baixa importância'}
                      {currentQuestao.peso >= 4 && currentQuestao.peso <= 6 && 'importância moderada'}
                      {currentQuestao.peso >= 7 && 'alta importância'}
                      {' '}no cálculo do score final.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
                </div>
              </div>

              <div className="pt-4">
                {renderQuestao()}
              </div>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Anterior
            </Button>
            <Button onClick={onClose} variant="secondary">
              Fechar Preview
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex === questoes.length - 1}
            >
              Próxima
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
