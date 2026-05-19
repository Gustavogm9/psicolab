import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

interface FirstAccessWizardProps {
  open: boolean;
  onComplete: (data: WizardData) => void;
  onSkip: () => void;
}

interface WizardData {
  titulo_profissional: string;
  biografia: string;
  titulo_hero: string;
  subtitulo_hero: string;
}

export function FirstAccessWizard({ open, onComplete, onSkip }: FirstAccessWizardProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  
  const [formData, setFormData] = useState<WizardData>({
    titulo_profissional: "",
    biografia: "",
    titulo_hero: "",
    subtitulo_hero: "",
  });

  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.titulo_profissional.trim().length > 0;
      case 2:
        return formData.biografia.trim().length >= 50;
      case 3:
        return formData.titulo_hero.trim().length > 0;
      default:
        return true;
    }
  };

  const getBiografiaCharCount = () => {
    return formData.biografia.trim().length;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>Bem-vindo! Vamos configurar seu perfil público</DialogTitle>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Passo {step} de {totalSteps}
          </p>
        </DialogHeader>

        <div className="py-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-sm mb-2">📋 Informações Básicas</h3>
                <p className="text-sm text-muted-foreground">
                  Vamos começar com suas informações profissionais básicas.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo_profissional">
                  Título Profissional <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="titulo_profissional"
                  placeholder="Ex: Psicólogo Organizacional | Coach Executivo"
                  value={formData.titulo_profissional}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo_profissional: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Como você quer ser apresentado aos visitantes?
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-sm mb-2">✍️ Sua História</h3>
                <p className="text-sm text-muted-foreground">
                  Conte um pouco sobre você e sua experiência profissional.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="biografia">
                  Biografia <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="biografia"
                  placeholder="Conte sobre sua experiência, especialidades e o que te motiva no seu trabalho..."
                  value={formData.biografia}
                  onChange={(e) =>
                    setFormData({ ...formData, biografia: e.target.value })
                  }
                  rows={6}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Dica: Fale sobre sua formação, anos de experiência e o que te diferencia.
                  </p>
                  <p className={`text-xs ${getBiografiaCharCount() >= 50 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {getBiografiaCharCount()}/50 caracteres
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-sm mb-2">🎯 Sua Mensagem Principal</h3>
                <p className="text-sm text-muted-foreground">
                  Esta será a primeira coisa que os visitantes verão.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo_hero">
                  Título Principal <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="titulo_hero"
                  placeholder="Ex: Transformando Organizações através das Pessoas"
                  value={formData.titulo_hero}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo_hero: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitulo_hero">Subtítulo (opcional)</Label>
                <Textarea
                  id="subtitulo_hero"
                  placeholder="Ex: Consultoria em Gestão de Pessoas e Desenvolvimento Organizacional"
                  value={formData.subtitulo_hero}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitulo_hero: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" onClick={onSkip} type="button">
            Pular por agora
          </Button>

          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} type="button">
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              type="button"
            >
              {step === totalSteps ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Concluir
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
