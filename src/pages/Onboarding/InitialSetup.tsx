import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Target, Clock, Users, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const InitialSetup = () => {
  const navigate = useNavigate();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [frequency, setFrequency] = useState("");
  const [customGoals, setCustomGoals] = useState("");

  // Carregar dados salvos
  useEffect(() => {
    const savedData = localStorage.getItem("onboarding_goals");
    if (savedData) {
      const data = JSON.parse(savedData);
      setSelectedGoals(data.goals || []);
      setFrequency(data.frequency || "");
      setCustomGoals(data.customGoals || "");
    }
  }, []);

  const goals = [
    { id: "burnout", label: "Prevenir Burnout", icon: Target },
    { id: "clima", label: "Melhorar Clima Organizacional", icon: Users },
    { id: "rotatividade", label: "Reduzir Rotatividade", icon: BarChart3 },
    { id: "assedio", label: "Combater Assédio/Discriminação", icon: Target },
    { id: "produtividade", label: "Aumentar Produtividade", icon: BarChart3 },
    { id: "engajamento", label: "Melhorar Engajamento", icon: Users },
  ];

  const frequencies = [
    { id: "monthly", label: "Mensal", description: "Avaliações todos os meses" },
    { id: "quarterly", label: "Trimestral", description: "Avaliações a cada 3 meses" },
    { id: "biannual", label: "Semestral", description: "Avaliações a cada 6 meses" },
    { id: "annual", label: "Anual", description: "Avaliações anuais" },
  ];

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSubmit = () => {
    if (selectedGoals.length === 0) {
      toast.error("Selecione pelo menos um objetivo");
      return;
    }

    if (!frequency) {
      toast.error("Selecione a frequência das avaliações");
      return;
    }

    // Salvar dados no localStorage
    const data = {
      goals: selectedGoals,
      frequency,
      customGoals
    };
    localStorage.setItem("onboarding_goals", JSON.stringify(data));

    toast.success("Objetivos salvos com sucesso!");
    navigate("/onboarding/teams");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Objetivos e Configurações</CardTitle>
          <CardDescription>
            Defina os objetivos da sua empresa e a frequência das avaliações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Quais são os principais objetivos da sua empresa?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const Icon = goal.icon;
                return (
                  <div
                    key={goal.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedGoals.includes(goal.id)
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleGoalToggle(goal.id)}
                  >
                    <Checkbox
                      checked={selectedGoals.includes(goal.id)}
                      onChange={() => {}}
                    />
                    <Icon className="w-5 h-5 text-primary" />
                    <Label className="cursor-pointer">{goal.label}</Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="customGoals" className="text-lg font-semibold">
              Objetivos específicos (opcional)
            </Label>
            <Textarea
              id="customGoals"
              placeholder="Descreva outros objetivos específicos da sua empresa..."
              value={customGoals}
              onChange={(e) => setCustomGoals(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Com que frequência deseja realizar avaliações?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {frequencies.map((freq) => (
                <div
                  key={freq.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    frequency === freq.id
                      ? "border-primary bg-primary-soft"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setFrequency(freq.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                      {frequency === freq.id && (
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">{freq.label}</div>
                      <div className="text-sm text-muted-foreground">{freq.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={() => navigate("/onboarding/company")}>
              Voltar
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="bright" 
              className="px-8"
              disabled={selectedGoals.length === 0 || !frequency}
            >
              Configurar Equipes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitialSetup;