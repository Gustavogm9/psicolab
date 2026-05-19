import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Team {
  id: string;
  name: string;
  department: string;
  manager: string;
  size: string;
}

const TeamsSetup = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeam, setNewTeam] = useState({
    name: "",
    department: "",
    manager: "",
    size: ""
  });

  // Carregar equipes salvas
  useEffect(() => {
    const savedTeams = localStorage.getItem("onboarding_teams");
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    }
  }, []);

  // Salvar equipes quando mudarem
  useEffect(() => {
    if (teams.length > 0) {
      localStorage.setItem("onboarding_teams", JSON.stringify(teams));
    }
  }, [teams]);

  const departments = [
    "Tecnologia",
    "Recursos Humanos",
    "Financeiro",
    "Marketing",
    "Vendas",
    "Operações",
    "Jurídico",
    "Produto",
    "Atendimento"
  ];

  const addTeam = () => {
    if (!newTeam.name || !newTeam.department) {
      toast.error("Nome da equipe e departamento são obrigatórios");
      return;
    }

    const team: Team = {
      id: Date.now().toString(),
      ...newTeam
    };

    setTeams([...teams, team]);
    setNewTeam({ name: "", department: "", manager: "", size: "" });
    
    toast.success(`Equipe ${newTeam.name} foi adicionada com sucesso`);
  };

  const removeTeam = (teamId: string) => {
    setTeams(teams.filter(t => t.id !== teamId));
    toast.success("Equipe removida");
  };

  const handleFinish = () => {
    if (teams.length === 0) {
      toast.error("Adicione pelo menos uma equipe antes de continuar");
      return;
    }

    // Marcar onboarding como completo
    localStorage.setItem("onboarding_completed", "true");
    
    toast.success("Configuração concluída! Redirecionando para o dashboard...");
    
    setTimeout(() => {
      const dashboardPath = userRole === "gestor" ? "/dashboard/gestor" : "/dashboard/consultora";
      navigate(dashboardPath);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Configuração de Equipes</CardTitle>
          <CardDescription>
            Adicione as equipes e departamentos da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lista de Equipes Existentes */}
          {teams.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Equipes Configuradas</h3>
              <div className="space-y-3">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {team.department} • {team.manager && `${team.manager} • `}{team.size} pessoas
                        </div>
                      </div>
                      <Badge variant="secondary">{team.department}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeam(team.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulário Nova Equipe */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Adicionar Nova Equipe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Nome da Equipe *</Label>
                <Input
                  id="teamName"
                  placeholder="Ex: Desenvolvimento Frontend"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Departamento *</Label>
                <Select value={newTeam.department} onValueChange={(value) => setNewTeam({...newTeam, department: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">Gerente/Líder</Label>
                <Input
                  id="manager"
                  placeholder="Ex: Maria Santos"
                  value={newTeam.manager}
                  onChange={(e) => setNewTeam({...newTeam, manager: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamSize">Número de Pessoas</Label>
                <Input
                  id="teamSize"
                  type="number"
                  placeholder="Ex: 8"
                  value={newTeam.size}
                  onChange={(e) => setNewTeam({...newTeam, size: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={addTeam} variant="secondary" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Adicionar Equipe</span>
              </Button>
            </div>
          </div>

          {/* Botões de Navegação */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={() => navigate("/onboarding/setup")}>
              Voltar
            </Button>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost"
                onClick={() => {
                  localStorage.setItem("onboarding_completed", "true");
                  const dashboardPath = userRole === "gestor" ? "/dashboard/gestor" : "/dashboard/consultora";
                  navigate(dashboardPath);
                }}
              >
                Pular esta etapa
              </Button>
              <Button 
                onClick={handleFinish} 
                variant="bright" 
                className="px-8 flex items-center space-x-2"
                disabled={teams.length === 0}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Concluir Configuração</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamsSetup;