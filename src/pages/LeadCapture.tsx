import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { 
  Building, 
  Users, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Calculator,
  Download,
  Star,
  Award
} from "lucide-react";

interface LeadData {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
  setor: string;
  numFuncionarios: string;
  principaisDesafios: string[];
  urgencia: string;
}

const leadDataSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  telefone: z.string().trim().min(1, "Telefone é obrigatório").max(50, "Telefone muito longo"),
  empresa: z.string().trim().min(1, "Nome da empresa é obrigatório").max(200, "Nome da empresa muito longo"),
  cargo: z.string().trim().min(1, "Cargo é obrigatório").max(100, "Cargo muito longo"),
  setor: z.string().min(1, "Setor é obrigatório"),
  numFuncionarios: z.string().min(1, "Número de funcionários é obrigatório"),
  principaisDesafios: z.array(z.string()).min(1, "Selecione pelo menos um desafio"),
  urgencia: z.string().min(1, "Urgência é obrigatória")
});

export default function LeadCapture() {
  const [currentStep, setCurrentStep] = useState(1);
  const [leadData, setLeadData] = useState<LeadData>({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    cargo: "",
    setor: "",
    numFuncionarios: "",
    principaisDesafios: [],
    urgencia: ""
  });
  const [leadScore, setLeadScore] = useState(0);
  const { toast } = useToast();

  const setores = [
    "Tecnologia",
    "Saúde",
    "Educação", 
    "Indústria",
    "Serviços Financeiros",
    "Varejo",
    "Construção",
    "Outros"
  ];

  const desafios = [
    "Alto turnover",
    "Absenteísmo elevado",
    "Burnout da equipe", 
    "Conflitos interpessoais",
    "Baixa produtividade",
    "Clima organizacional ruim",
    "Gestão de estresse",
    "Comunicação ineficaz"
  ];

  const calculateLeadScore = () => {
    let score = 0;
    
    // Tamanho da empresa (peso 30%)
    const numFunc = parseInt(leadData.numFuncionarios);
    if (numFunc >= 100) score += 30;
    else if (numFunc >= 50) score += 20;
    else if (numFunc >= 20) score += 15;
    else score += 10;

    // Número de desafios selecionados (peso 25%)
    score += Math.min(leadData.principaisDesafios.length * 5, 25);

    // Urgência (peso 25%)
    switch(leadData.urgencia) {
      case "imediata": score += 25; break;
      case "1-3-meses": score += 20; break;
      case "3-6-meses": score += 15; break;
      case "6-12-meses": score += 10; break;
      default: score += 5;
    }

    // Cargo (peso 20%)
    const cargoLower = leadData.cargo.toLowerCase();
    if (cargoLower.includes("diretor") || cargoLower.includes("ceo") || cargoLower.includes("presidente")) {
      score += 20;
    } else if (cargoLower.includes("gerente") || cargoLower.includes("coordenador")) {
      score += 15;
    } else if (cargoLower.includes("rh") || cargoLower.includes("recursos humanos")) {
      score += 18;
    } else {
      score += 10;
    }

    setLeadScore(score);
    return score;
  };

  const handleDesafioToggle = (desafio: string) => {
    setLeadData(prev => ({
      ...prev,
      principaisDesafios: prev.principaisDesafios.includes(desafio)
        ? prev.principaisDesafios.filter(d => d !== desafio)
        : [...prev.principaisDesafios, desafio]
    }));
  };

  const handleSubmit = () => {
    // Validar dados com zod
    try {
      leadDataSchema.parse(leadData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.issues[0].message,
        });
        return;
      }
    }
    
    const score = calculateLeadScore();
    
    // Simular salvamento do lead
    toast({
      title: "Lead Capturado com Sucesso!",
      description: `Score: ${score}/100. Você receberá o diagnóstico por email em breve.`,
    });

    // Reset form
    setCurrentStep(4); // Página de obrigado
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-muted-foreground";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Lead Quente 🔥";
    if (score >= 60) return "Lead Morno 🌡️";
    return "Lead Frio ❄️";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary to-secondary text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Diagnóstico Gratuito de<br />
            <span className="text-gradient bg-gradient-to-r from-white to-primary-foreground bg-clip-text text-transparent">
              Saúde Mental Corporativa
            </span>
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            Descubra os riscos psicossociais na sua empresa e receba um plano personalizado 
            para melhorar o bem-estar da sua equipe
          </p>
          
          <div className="flex justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>100% Gratuito</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Dados Seguros</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Resultado Imediato</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm text-muted-foreground">{currentStep}/3</span>
          </div>
          <Progress value={(currentStep / 3) * 100} className="h-2" />
        </div>

        <div className="max-w-2xl mx-auto">
          {currentStep === 1 && (
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-6 w-6 text-primary" />
                  <span>Informações da Empresa</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={leadData.nome}
                      onChange={(e) => setLeadData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Corporativo *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={leadData.email}
                      onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu.email@empresa.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={leadData.telefone}
                      onChange={(e) => setLeadData(prev => ({ ...prev, telefone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo *</Label>
                    <Input
                      id="cargo"
                      value={leadData.cargo}
                      onChange={(e) => setLeadData(prev => ({ ...prev, cargo: e.target.value }))}
                      placeholder="Diretor de RH, CEO, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresa">Nome da Empresa *</Label>
                  <Input
                    id="empresa"
                    value={leadData.empresa}
                    onChange={(e) => setLeadData(prev => ({ ...prev, empresa: e.target.value }))}
                    placeholder="Nome da sua empresa"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Setor de Atuação *</Label>
                    <Select value={leadData.setor} onValueChange={(value) => 
                      setLeadData(prev => ({ ...prev, setor: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {setores.map(setor => (
                          <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Funcionários *</Label>
                    <Select value={leadData.numFuncionarios} onValueChange={(value) => 
                      setLeadData(prev => ({ ...prev, numFuncionarios: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 funcionários</SelectItem>
                        <SelectItem value="11-50">11-50 funcionários</SelectItem>
                        <SelectItem value="51-100">51-100 funcionários</SelectItem>
                        <SelectItem value="101-500">101-500 funcionários</SelectItem>
                        <SelectItem value="500+">Mais de 500 funcionários</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={() => setCurrentStep(2)} 
                  className="w-full"
                  disabled={!leadData.nome || !leadData.email || !leadData.empresa || !leadData.setor || !leadData.numFuncionarios}
                >
                  Continuar
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                  <span>Principais Desafios</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Selecione os principais desafios de saúde mental que sua empresa enfrenta:
                </p>

                <div className="grid md:grid-cols-2 gap-3">
                  {desafios.map(desafio => (
                    <Button
                      key={desafio}
                      variant={leadData.principaisDesafios.includes(desafio) ? "default" : "outline"}
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => handleDesafioToggle(desafio)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          leadData.principaisDesafios.includes(desafio) 
                            ? "bg-primary border-primary" 
                            : "border-muted-foreground"
                        }`}>
                          {leadData.principaisDesafios.includes(desafio) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span>{desafio}</span>
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Qual a urgência para resolver esses desafios?</Label>
                  <Select value={leadData.urgencia} onValueChange={(value) => 
                    setLeadData(prev => ({ ...prev, urgencia: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a urgência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imediata">Imediata (este mês)</SelectItem>
                      <SelectItem value="1-3-meses">1-3 meses</SelectItem>
                      <SelectItem value="3-6-meses">3-6 meses</SelectItem>
                      <SelectItem value="6-12-meses">6-12 meses</SelectItem>
                      <SelectItem value="sem-pressa">Sem pressa específica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Voltar
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(3)} 
                    className="flex-1"
                    disabled={leadData.principaisDesafios.length === 0 || !leadData.urgencia}
                  >
                    Gerar Diagnóstico
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-6 w-6 text-success" />
                  <span>Seu Diagnóstico Está Pronto!</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Lead Score Display */}
                <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                  <div className="text-4xl font-bold mb-2 text-primary">
                    {leadScore}/100
                  </div>
                  <Badge className={`${getScoreColor(leadScore)} text-lg px-4 py-2`}>
                    {getScoreLabel(leadScore)}
                  </Badge>
                </div>

                {/* Insights */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Insights Personalizados:</h3>
                  
                  <div className="grid gap-4">
                    <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Tamanho da Equipe</h4>
                        <p className="text-sm text-muted-foreground">
                          Empresas com {leadData.numFuncionarios} funcionários típicamente enfrentam 
                          desafios específicos de {leadData.principaisDesafios[0]?.toLowerCase()}.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <h4 className="font-medium">Potencial de ROI</h4>
                        <p className="text-sm text-muted-foreground">
                          Baseado no seu perfil, estima-se uma economia de R$ 150-300k anualmente 
                          com um programa de saúde mental bem estruturado.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                      <Award className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <h4 className="font-medium">Prioridade de Ação</h4>
                        <p className="text-sm text-muted-foreground">
                          Com urgência {leadData.urgencia}, recomendamos iniciar com 
                          {leadData.principaisDesafios.slice(0, 2).join(" e ")}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <Download className="h-5 w-5 text-primary" />
                    <span>Próximos Passos</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enviaremos por email um relatório completo com:
                  </p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Análise detalhada dos riscos identificados</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Plano de ação personalizado</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Calculadora de ROI detalhada</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Agendamento de consultoria gratuita</span>
                    </li>
                  </ul>
                </div>

                <Button onClick={handleSubmit} className="w-full" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Receber Diagnóstico Completo
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="card-premium text-center">
              <CardContent className="pt-8 pb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-success" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-4">Obrigado, {leadData.nome}!</h2>
                <p className="text-muted-foreground mb-6">
                  Seu diagnóstico foi enviado para <strong>{leadData.email}</strong>
                </p>
                
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold mb-2">🎯 Seu Lead Score: {leadScore}/100</h3>
                  <p className="text-sm text-muted-foreground">
                    Nossa equipe entrará em contato em até 24h para agendar uma 
                    consultoria gratuita personalizada.
                  </p>
                </div>

                <Button asChild>
                  <a href="/">Voltar ao Início</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}