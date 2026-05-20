import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Award,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

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
  const [animatedScore, setAnimatedScore] = useState(0);
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
    const numFunc = leadData.numFuncionarios;
    if (numFunc === "500+") score += 30;
    else if (numFunc === "101-500") score += 25;
    else if (numFunc === "51-100") score += 20;
    else if (numFunc === "11-50") score += 15;
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
    if (cargoLower.includes("diretor") || cargoLower.includes("ceo") || cargoLower.includes("presidente") || cargoLower.includes("c-level")) {
      score += 20;
    } else if (cargoLower.includes("gerente") || cargoLower.includes("coordenador") || cargoLower.includes("head")) {
      score += 15;
    } else if (cargoLower.includes("rh") || cargoLower.includes("recursos humanos") || cargoLower.includes("people")) {
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

  // Efeito para animar o score de zero até o score calculado no passo 3
  useEffect(() => {
    if (currentStep === 3) {
      const targetScore = calculateLeadScore();
      setAnimatedScore(0);
      const duration = 1200; // ms
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Easing out quad
        const easeProgress = progress * (2 - progress);
        
        setAnimatedScore(Math.round(easeProgress * targetScore));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [currentStep]);

  const handleGoToStep3 = () => {
    if (leadData.principaisDesafios.length === 0 || !leadData.urgencia) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione pelo menos um desafio e a urgência para continuar.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep(3);
  };

  const handleSubmit = () => {
    try {
      leadDataSchema.parse(leadData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.issues[0].message,
          variant: "destructive"
        });
        return;
      }
    }
    
    // Simular salvamento
    toast({
      title: "Diagnóstico Enviado!",
      description: "Um relatório detalhado em PDF foi enviado para seu e-mail corporativo.",
    });

    setCurrentStep(4); // Obrigado
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-emerald-500 stroke-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]";
    if (score >= 60) return "text-amber-500 stroke-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]";
    return "text-blue-500 stroke-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (score >= 60) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Prioridade Estratégica Alta 🔥";
    if (score >= 60) return "Ação Recomendada em Médio Prazo 🌡️";
    return "Monitoramento Preventivo Ativo ❄️";
  };

  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * animatedScore) / 100;

  return (
    <MainLayout>
      <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glows orgânicos ao fundo */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        
        {/* Grid de fundo sofisticada estilo Linear */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto w-full z-10">
          
          {/* Header minimalista imersivo */}
          {currentStep < 4 && (
            <div className="text-center mb-10 space-y-3">
              <Badge variant="outline" className="px-3 py-1 bg-white/5 border-white/10 text-slate-300 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
                MenteMetrics Onboarding
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Diagnóstico de Saúde Mental Corporativa
              </h1>
              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
                Avalie instantaneamente a maturidade de riscos psicossociais da sua empresa e receba um roteiro científico de intervenção baseado no COPSOQ.
              </p>
            </div>
          )}

          {/* Progresso Minimalista */}
          {currentStep < 4 && (
            <div className="max-w-xl mx-auto mb-10 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span>Passo {currentStep} de 3</span>
                <span>{Math.round((currentStep / 3) * 100)}% Concluído</span>
              </div>
              <Progress value={(currentStep / 3) * 100} className="h-1.5 bg-slate-900 overflow-hidden" />
            </div>
          )}

          {/* Bloco de Vidro Principal */}
          <div className="max-w-2xl mx-auto">
            {currentStep === 1 && (
              <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/15">
                <CardContent className="p-8 sm:p-10 space-y-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2.5 bg-primary/10 rounded-2xl border border-primary/20">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">Dados Corporativos</h3>
                      <p className="text-xs text-slate-400">Identificação básica da empresa e do responsável administrativo.</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-xs font-semibold tracking-wide text-slate-300">Seu Nome Completo *</Label>
                      <Input
                        id="nome"
                        value={leadData.nome}
                        onChange={(e) => setLeadData(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Ex: Roberto Ramos"
                        className="bg-slate-950/60 border-white/5 rounded-2xl focus-visible:ring-primary/50 text-slate-100 placeholder:text-slate-600 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-semibold tracking-wide text-slate-300">E-mail Corporativo *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={leadData.email}
                        onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="nome@empresa.com"
                        className="bg-slate-950/60 border-white/5 rounded-2xl focus-visible:ring-primary/50 text-slate-100 placeholder:text-slate-600 h-11"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="text-xs font-semibold tracking-wide text-slate-300">WhatsApp / Telefone *</Label>
                      <Input
                        id="telefone"
                        value={leadData.telefone}
                        onChange={(e) => setLeadData(prev => ({ ...prev, telefone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                        className="bg-slate-950/60 border-white/5 rounded-2xl focus-visible:ring-primary/50 text-slate-100 placeholder:text-slate-600 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cargo" className="text-xs font-semibold tracking-wide text-slate-300">Cargo de Atuação *</Label>
                      <Input
                        id="cargo"
                        value={leadData.cargo}
                        onChange={(e) => setLeadData(prev => ({ ...prev, cargo: e.target.value }))}
                        placeholder="Diretor de Gestão de Pessoas, CEO, etc."
                        className="bg-slate-950/60 border-white/5 rounded-2xl focus-visible:ring-primary/50 text-slate-100 placeholder:text-slate-600 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresa" className="text-xs font-semibold tracking-wide text-slate-300">Nome Oficial da Organização *</Label>
                    <Input
                      id="empresa"
                      value={leadData.empresa}
                      onChange={(e) => setLeadData(prev => ({ ...prev, empresa: e.target.value }))}
                      placeholder="Ex: MenteMetrics Soluções Ltda"
                      className="bg-slate-950/60 border-white/5 rounded-2xl focus-visible:ring-primary/50 text-slate-100 placeholder:text-slate-600 h-11"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold tracking-wide text-slate-300">Setor de Atuação *</Label>
                      <Select value={leadData.setor} onValueChange={(value) => 
                        setLeadData(prev => ({ ...prev, setor: value }))
                      }>
                        <SelectTrigger className="bg-slate-950/60 border-white/5 rounded-2xl focus:ring-primary/50 text-slate-100 h-11">
                          <SelectValue placeholder="Selecione o setor" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-white/10 rounded-2xl text-slate-200">
                          {setores.map(setor => (
                            <SelectItem key={setor} value={setor} className="focus:bg-primary/20 focus:text-white rounded-xl my-1">{setor}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold tracking-wide text-slate-300">Quadro de Colaboradores *</Label>
                      <Select value={leadData.numFuncionarios} onValueChange={(value) => 
                        setLeadData(prev => ({ ...prev, numFuncionarios: value }))
                      }>
                        <SelectTrigger className="bg-slate-950/60 border-white/5 rounded-2xl focus:ring-primary/50 text-slate-100 h-11">
                          <SelectValue placeholder="Selecione o tamanho" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-white/10 rounded-2xl text-slate-200">
                          <SelectItem value="1-10" className="focus:bg-primary/20 focus:text-white rounded-xl my-0.5">1-10 funcionários</SelectItem>
                          <SelectItem value="11-50" className="focus:bg-primary/20 focus:text-white rounded-xl my-0.5">11-50 funcionários</SelectItem>
                          <SelectItem value="51-100" className="focus:bg-primary/20 focus:text-white rounded-xl my-0.5">51-100 funcionários</SelectItem>
                          <SelectItem value="101-500" className="focus:bg-primary/20 focus:text-white rounded-xl my-0.5">101-500 funcionários</SelectItem>
                          <SelectItem value="500+" className="focus:bg-primary/20 focus:text-white rounded-xl my-0.5">Mais de 500 funcionários</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setCurrentStep(2)} 
                    className="w-full rounded-2xl py-6 font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-secondary transition-all hover:scale-[1.01] flex items-center justify-center gap-2 mt-4"
                    disabled={!leadData.nome || !leadData.email || !leadData.empresa || !leadData.setor || !leadData.numFuncionarios}
                  >
                    Prosseguir
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/15">
                <CardContent className="p-8 sm:p-10 space-y-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">Fatores de Risco e Urgência</h3>
                      <p className="text-xs text-slate-400">Quais as principais dores mentais e qual a janela de intervenção planejada?</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300">
                    Selecione os principais desafios observados na saúde da equipe atualmente:
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {desafios.map(desafio => {
                      const isSelected = leadData.principaisDesafios.includes(desafio);
                      return (
                        <button
                          key={desafio}
                          type="button"
                          className={`flex items-center space-x-3 w-full p-4 text-left rounded-2xl border transition-all duration-300 hover:scale-[1.01] active:scale-95 ${
                            isSelected 
                              ? "bg-primary/10 border-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                              : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-950/80 hover:border-white/10"
                          }`}
                          onClick={() => handleDesafioToggle(desafio)}
                        >
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                            isSelected 
                              ? "bg-primary border-primary" 
                              : "border-slate-600"
                          }`}>
                            {isSelected && (
                              <CheckCircle className="w-3.5 h-3.5 text-white stroke-[3px]" />
                            )}
                          </div>
                          <span className="text-xs font-semibold">{desafio}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label className="text-xs font-semibold tracking-wide text-slate-300">Qual a urgência para implementar um programa de mitigação?</Label>
                    <Select value={leadData.urgencia} onValueChange={(value) => 
                      setLeadData(prev => ({ ...prev, urgencia: value }))
                    }>
                      <SelectTrigger className="bg-slate-950/60 border-white/5 rounded-2xl focus:ring-primary/50 text-slate-100 h-11">
                        <SelectValue placeholder="Selecione a janela temporal" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-white/10 rounded-2xl text-slate-200">
                        <SelectItem value="imediata" className="focus:bg-primary/20 focus:text-white rounded-xl my-0.5">Imediata (este mês)</SelectItem>
                        <SelectItem value="1-3-meses" className="focus:bg-primary/20 focus:text-white rounded-xl my-0.5">Curto prazo (1 a 3 meses)</SelectItem>
                        <SelectItem value="3-6-meses" className="focus:bg-primary/20 focus:text-white rounded-xl my-0.5">Médio prazo (3 a 6 meses)</SelectItem>
                        <SelectItem value="6-12-meses" className="focus:bg-primary/20 focus:text-white rounded-xl my-0.5">Longo prazo (6 a 12 meses)</SelectItem>
                        <SelectItem value="sem-pressa" className="focus:bg-primary/20 focus:text-white rounded-xl my-0.5">Sem pressa (Apenas mapeamento)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button variant="outline" onClick={() => setCurrentStep(1)} className="rounded-2xl border-white/10 text-slate-300 hover:bg-white/5 py-6">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                    <Button 
                      onClick={handleGoToStep3} 
                      className="flex-1 rounded-2xl py-6 font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-secondary transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                      disabled={leadData.principaisDesafios.length === 0 || !leadData.urgencia}
                    >
                      Processar Diagnóstico
                      <Calculator className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/15">
                <CardContent className="p-8 sm:p-10 space-y-6">
                  
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <Calculator className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">Seu Diagnóstico Exclusivo</h3>
                      <p className="text-xs text-slate-400">Score de Risco Psicossocial gerado algoritmicamente a partir dos seus inputs.</p>
                    </div>
                  </div>

                  {/* Display Score Futurista com Anel de Progresso SVG */}
                  <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-950/40 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="relative flex items-center justify-center w-36 h-36">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        {/* Círculo de fundo */}
                        <circle
                          cx="60"
                          cy="60"
                          r={radius}
                          className="stroke-slate-900 fill-none"
                          strokeWidth={strokeWidth}
                        />
                        {/* Arco preenchido com glow */}
                        <circle
                          cx="60"
                          cy="60"
                          r={radius}
                          className={`fill-none transition-all duration-1000 ease-out ${getScoreColorClass(leadScore)}`}
                          strokeWidth={strokeWidth}
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Texto do meio */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-extrabold text-white tracking-tighter">
                          {animatedScore}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">
                          Risk Score
                        </span>
                      </div>
                    </div>

                    <Badge className={`mt-5 text-xs font-bold px-4 py-1.5 rounded-full border ${getScoreBadgeVariant(leadScore)}`}>
                      {getScoreLabel(leadScore)}
                    </Badge>
                  </div>

                  {/* Insights Clássicos em subcards glassmorphic */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Mapeamento Inicial e Recomendações</h4>
                    
                    <div className="grid gap-3">
                      <div className="flex items-start space-x-3 p-4 bg-slate-950/30 rounded-2xl border border-white/5 hover:bg-slate-950/50 transition-colors">
                        <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-200">Impacto no Quadro de Colaboradores</h5>
                          <p className="text-[11px] leading-relaxed text-slate-400 mt-1">
                            Para corporações de {leadData.numFuncionarios} colaboradores, a vulnerabilidade com {leadData.principaisDesafios[0]?.toLowerCase()} costuma gerar custos invisíveis por insatisfação oculta e micro-absenteísmo.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 bg-slate-950/30 rounded-2xl border border-white/5 hover:bg-slate-950/50 transition-colors">
                        <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-200">Retorno Financeiro Estimado (ROI)</h5>
                          <p className="text-[11px] leading-relaxed text-slate-400 mt-1">
                            Estabilizar a saúde psicossocial em ambientes com seus desafios específicos tem potencial para poupar em média de <strong>R$ 150.000 a R$ 300.000 anuais</strong> em despesas diretas de turnover ativo e multas trabalhistas.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 bg-slate-950/30 rounded-2xl border border-white/5 hover:bg-slate-950/50 transition-colors">
                        <Award className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-200">Recomendação Científica (COPSOQ III)</h5>
                          <p className="text-[11px] leading-relaxed text-slate-400 mt-1">
                            Diante da janela de urgência "{leadData.urgencia === "imediata" ? "Imediata" : "Rápida"}", orienta-se a aplicação do inventário adaptado para controle do estresse e burnout, focando em feedbacks estruturados e redesenho de processos críticos.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card de Proximos Passos */}
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
                    <h5 className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Próximos Passos Inclusos no Envio:
                    </h5>
                    <ul className="grid sm:grid-cols-2 gap-2 text-[10px] text-slate-400 font-semibold">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>PDF de Relatório Detalhado</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Framework de Ação Preventiva</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Projeção de Payback / Financeiro</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Sessão de Alinhamento com Consultor</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="rounded-2xl border-white/10 text-slate-300 hover:bg-white/5 py-6">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Ajustar Dados
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      className="flex-1 rounded-2xl py-6 font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-secondary transition-all hover:scale-[1.01] flex items-center justify-center gap-2 text-white"
                      size="lg"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      Liberar Diagnóstico Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl text-center py-6">
                <CardContent className="p-8 sm:p-12 space-y-6">
                  <div className="flex justify-center mb-2">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 relative animate-bounce">
                      <CheckCircle className="h-8 w-8 text-emerald-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Solicitação Concluída!</h2>
                    <p className="text-sm text-slate-400">
                      Obrigado, <strong className="text-white">{leadData.nome}</strong>. O inventário e relatório analítico de riscos estão sendo gerados.
                    </p>
                  </div>
                  
                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-6 space-y-3 max-w-md mx-auto">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                      🎯 Score de Maturidade: {leadScore}/100
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Enviamos um link seguro de validação para <strong className="text-slate-200">{leadData.email}</strong>. Nossos especialistas de saúde ocupacional avaliarão seu caso nas próximas 24 horas úteis.
                    </p>
                  </div>

                  <Button asChild className="rounded-2xl py-5 font-bold bg-white text-slate-950 hover:bg-slate-200 transition-colors px-8">
                    <a href="/">Retornar à Landing Page</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}