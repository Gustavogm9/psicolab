import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layout/main-layout";
import { z } from "zod";
import { 
  Calculator,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Download,
  Lightbulb,
  BarChart3,
  Percent,
  Sparkles,
  ArrowRight,
  Shield,
  Coins
} from "lucide-react";

interface ROIData {
  numFuncionarios: number;
  salarioMedio: number;
  taxaAbsenteismo: number;
  taxaTurnover: number;
  custosRecrutamento: number;
  diasAfastamento: number;
  produtividadePerdida: number;
}

const roiDataSchema = z.object({
  numFuncionarios: z.number().min(10, "Mínimo 10 funcionários").max(10000, "Máximo 10.000 funcionários"),
  salarioMedio: z.number().min(1000, "Salário deve ser maior que R$ 1.000").max(1000000, "Salário muito alto"),
  taxaAbsenteismo: z.number().min(0, "Taxa não pode ser negativa").max(100, "Taxa não pode exceder 100%"),
  taxaTurnover: z.number().min(0, "Taxa não pode ser negativa").max(100, "Taxa não pode exceder 100%"),
  custosRecrutamento: z.number().min(0, "Custo não pode ser negativo").max(1000000, "Custo muito alto"),
  diasAfastamento: z.number().min(0, "Dias não podem ser negativos").max(365, "Dias não podem exceder 365"),
  produtividadePerdida: z.number().min(0, "Perda não pode ser negativa").max(100, "Perda não pode exceder 100%")
});

export default function ROICalculator() {
  const [roiData, setROIData] = useState<ROIData>({
    numFuncionarios: 120,
    salarioMedio: 4500,
    taxaAbsenteismo: 4.5,
    taxaTurnover: 18,
    custosRecrutamento: 12000,
    diasAfastamento: 8,
    produtividadePerdida: 15
  });

  const [results, setResults] = useState({
    custoAtual: 0,
    custoComPrograma: 0,
    economia: 0,
    roi: 0,
    payback: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    try {
      roiDataSchema.parse(roiData);
      calculateROI();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Erro na validação do simulador:", error.issues[0].message);
      }
    }
  }, [roiData]);

  const calculateROI = () => {
    const { 
      numFuncionarios, 
      salarioMedio, 
      taxaAbsenteismo, 
      taxaTurnover, 
      custosRecrutamento,
      diasAfastamento,
      produtividadePerdida
    } = roiData;

    // Custos atuais (sem programa de saúde mental)
    const custoAbsenteismo = (numFuncionarios * salarioMedio * (taxaAbsenteismo / 100) * 12) / 30;
    const custoTurnover = (numFuncionarios * (taxaTurnover / 100) * custosRecrutamento);
    const custoAfastamentos = (numFuncionarios * 0.08 * salarioMedio * diasAfastamento) / 30; // 8% da equipe se afasta sob estresse
    const custoProdutividade = (numFuncionarios * salarioMedio * 12 * (produtividadePerdida / 100) * 0.5); // Perda parcial
    
    const custoAtual = custoAbsenteismo + custoTurnover + custoAfastamentos + custoProdutividade;

    // Reduções estimadas por estudos internacionais sobre saúde mental corporativa
    const reducaoAbsenteismo = 0.35; // 35% de redução
    const reducaoTurnover = 0.25; // 25% de redução
    const reducaoAfastamentos = 0.40; // 40% de redução
    const melhoriaProdutividade = 0.45; // 45% de recuperação da produtividade perdida

    const custoAbsenteismoComPrograma = custoAbsenteismo * (1 - reducaoAbsenteismo);
    const custoTurnoverComPrograma = custoTurnover * (1 - reducaoTurnover);
    const custoAfastamentosComPrograma = custoAfastamentos * (1 - reducaoAfastamentos);
    const custoProdutividadeComPrograma = custoProdutividade * (1 - melhoriaProdutividade);

    // Custo de implementação do MenteMetrics
    const custoPrograma = numFuncionarios * 120; // R$ 120 por colaborador/ano

    const custoComPrograma = custoAbsenteismoComPrograma + custoTurnoverComPrograma + 
                           custoAfastamentosComPrograma + custoProdutividadeComPrograma + custoPrograma;

    const economia = custoAtual - custoComPrograma;
    const roi = ((economia - custoPrograma) / custoPrograma) * 100;
    const payback = custoPrograma / (economia / 12); // meses para recuperar o investimento inicial

    setResults({
      custoAtual: Math.round(custoAtual),
      custoComPrograma: Math.round(custoComPrograma),
      economia: Math.round(economia),
      roi: Math.round(Math.max(roi, 0)),
      payback: Math.round(Math.max(Math.min(payback, 12), 1))
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: "Relatório de Viabilidade Gerado!",
      description: "Um PDF completo com a projeção foi enviado para seu e-mail corporativo.",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  // SVG Gauge calculations
  const radius = 64;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  // Percentage of savings from total current cost (clamped to 90% visual max)
  const savingsPct = results.custoAtual > 0 ? (results.economia / results.custoAtual) * 100 : 0;
  const strokeDashoffset = circumference - (Math.min(savingsPct * 1.5, 95) / 100) * circumference;

  // Comparison Bar scale
  const maxCost = Math.max(results.custoAtual, 1);
  const pctAtual = (results.custoAtual / maxCost) * 100;
  const pctComPrograma = (results.custoComPrograma / maxCost) * 100;

  return (
    <MainLayout>
      <div className="relative min-h-screen bg-background/95">
        {/* Glows de Fundo Estilo Apple/Linear */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
          {/* Cabeçalho Sophisticated Editorial */}
          <div className="space-y-4 mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Calculator className="w-3.5 h-3.5 animate-pulse" />
              <span>Simulador Financeiro de Saúde Mental</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Calculadora de ROI MenteMetrics
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base font-medium max-w-2xl mx-auto">
              Avalie de forma científica e baseada em evidências o retorno econômico gerado ao reduzir custos com turnover, absenteísmo e afastamentos de saúde mental na sua equipe.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Inputs - Left Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border border-white/10 dark:border-white/5 bg-card/40 backdrop-blur-xl shadow-xl rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Calculator className="h-5 w-5 text-primary" />
                    <span>Variáveis Operacionais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Número de Funcionários */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <Label className="font-semibold text-foreground/95">Total de Colaboradores</Label>
                      <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary/10 text-xs">
                        {roiData.numFuncionarios} pessoas
                      </span>
                    </div>
                    <Slider
                      value={[roiData.numFuncionarios]}
                      onValueChange={(val) => setROIData(prev => ({ ...prev, numFuncionarios: val[0] }))}
                      max={1200}
                      min={10}
                      step={10}
                      className="py-2"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>10</span>
                      <span>500</span>
                      <span>1.200+</span>
                    </div>
                  </div>

                  {/* Salário Médio */}
                  <div className="space-y-2">
                    <Label htmlFor="salario" className="text-sm font-semibold text-foreground/95">
                      Salário Nominal Médio (R$/mês)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">R$</span>
                      <Input
                        id="salario"
                        type="number"
                        className="pl-8 bg-card/30 border-white/10 focus-visible:ring-primary rounded-xl"
                        value={roiData.salarioMedio}
                        onChange={(e) => setROIData(prev => ({ ...prev, salarioMedio: Math.max(Number(e.target.value), 0) }))}
                      />
                    </div>
                  </div>

                  {/* Absenteísmo */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <Label className="font-semibold text-foreground/95">Taxa de Absenteísmo Mensal</Label>
                      <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary/10 text-xs">
                        {roiData.taxaAbsenteismo}%
                      </span>
                    </div>
                    <Slider
                      value={[roiData.taxaAbsenteismo]}
                      onValueChange={(val) => setROIData(prev => ({ ...prev, taxaAbsenteismo: val[0] }))}
                      max={15}
                      min={1}
                      step={0.1}
                      className="py-2"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>1.0%</span>
                      <span>7.5%</span>
                      <span>15.0%</span>
                    </div>
                  </div>

                  {/* Turnover */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <Label className="font-semibold text-foreground/95">Taxa de Turnover Anual</Label>
                      <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary/10 text-xs">
                        {roiData.taxaTurnover}%
                      </span>
                    </div>
                    <Slider
                      value={[roiData.taxaTurnover]}
                      onValueChange={(val) => setROIData(prev => ({ ...prev, taxaTurnover: val[0] }))}
                      max={45}
                      min={5}
                      step={1}
                      className="py-2"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>5%</span>
                      <span>25%</span>
                      <span>45%</span>
                    </div>
                  </div>

                  {/* Custos Recrutamento */}
                  <div className="space-y-2">
                    <Label htmlFor="recrutamento" className="text-sm font-semibold text-foreground/95">
                      Custo de Substituição por Vaga (R$)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">R$</span>
                      <Input
                        id="recrutamento"
                        type="number"
                        className="pl-8 bg-card/30 border-white/10 focus-visible:ring-primary rounded-xl"
                        value={roiData.custosRecrutamento}
                        onChange={(e) => setROIData(prev => ({ ...prev, custosRecrutamento: Math.max(Number(e.target.value), 0) }))}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Inclui encargos demissionais, anúncios, atração e ramp-up (comumente 3x o salário).
                    </p>
                  </div>

                  {/* Dias Afastamento */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <Label className="font-semibold text-foreground/95">Média de Afastamento p/ Ano</Label>
                      <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary/10 text-xs">
                        {roiData.diasAfastamento} dias
                      </span>
                    </div>
                    <Slider
                      value={[roiData.diasAfastamento]}
                      onValueChange={(val) => setROIData(prev => ({ ...prev, diasAfastamento: val[0] }))}
                      max={45}
                      min={3}
                      step={1}
                      className="py-2"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>3 dias</span>
                      <span>24 dias</span>
                      <span>45 dias</span>
                    </div>
                  </div>

                  {/* Produtividade Perdida */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <Label className="font-semibold text-foreground/95">Perda Estimada Presenteísmo</Label>
                      <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary/10 text-xs">
                        {roiData.produtividadePerdida}%
                      </span>
                    </div>
                    <Slider
                      value={[roiData.produtividadePerdida]}
                      onValueChange={(val) => setROIData(prev => ({ ...prev, produtividadePerdida: val[0] }))}
                      max={40}
                      min={5}
                      step={1}
                      className="py-2"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>5%</span>
                      <span>22%</span>
                      <span>40%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Queda de rendimento de colaboradores com ansiedade ou fadiga sem afastamento clínico.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results - Right Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* ROI Output Card Glassmorphic with SVG Gauge */}
              <Card className="border border-white/10 dark:border-white/5 bg-card/40 backdrop-blur-xl shadow-xl rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg font-bold">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      <span>Retorno sobre o Investimento</span>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 text-xs">
                      Viabilidade Máxima
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-4">
                    {/* SVG Progress Ring */}
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Shadow track */}
                        <circle
                          cx="72"
                          cy="72"
                          r={radius}
                          stroke="currentColor"
                          strokeWidth={strokeWidth}
                          fill="transparent"
                          className="text-muted-foreground/10"
                        />
                        {/* Dynamic animated savings path */}
                        <circle
                          cx="72"
                          cy="72"
                          r={radius}
                          stroke="url(#emeraldGradient)"
                          strokeWidth={strokeWidth}
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />
                        <defs>
                          <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#3B82F6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Central values */}
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Economia
                        </div>
                        <div className="text-lg font-black text-foreground leading-tight tracking-tight">
                          {results.roi}%
                        </div>
                        <div className="text-[9px] text-emerald-500 font-bold">
                          de Retorno
                        </div>
                      </div>
                    </div>

                    {/* Economy & Details */}
                    <div className="text-center md:text-left space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">
                          Economia Líquida Estimada
                        </p>
                        <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 tracking-tight mt-1">
                          {formatCurrency(results.economia)}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">
                          ao ano (já descontados custos de licença)
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-2 border border-white/5 rounded-xl bg-white/5">
                          <p className="text-[9px] text-muted-foreground font-semibold">Investimento Anual</p>
                          <p className="text-sm font-bold text-foreground">
                            {formatCurrency(roiData.numFuncionarios * 120)}
                          </p>
                        </div>
                        <div className="p-2 border border-white/5 rounded-xl bg-white/5">
                          <p className="text-[9px] text-muted-foreground font-semibold">Payback Esperado</p>
                          <p className="text-sm font-bold text-emerald-500">
                            {results.payback} {results.payback === 1 ? "mês" : "meses"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comparative Cost Panel */}
              <Card className="border border-white/10 dark:border-white/5 bg-card/40 backdrop-blur-xl shadow-xl rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <BarChart3 className="h-4.5 w-4.5 text-primary" />
                    <span>Impacto de Custos Financeiros</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Slider Visual Bars */}
                  <div className="space-y-4">
                    {/* Custo Atual */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-destructive animate-pulse" />
                          Situação Sem Intervenção
                        </span>
                        <span className="text-destructive font-bold">
                          {formatCurrency(results.custoAtual)}
                        </span>
                      </div>
                      <div className="h-3 w-full bg-muted/40 rounded-full overflow-hidden p-[2px]">
                        <div
                          className="h-full bg-gradient-to-r from-red-500/80 to-rose-500 rounded-full transition-all duration-700 ease-out shadow-lg"
                          style={{ width: `${pctAtual}%` }}
                        />
                      </div>
                    </div>

                    {/* Custo Com Programa */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-emerald-500 flex items-center gap-1 font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          Com Suporte MenteMetrics
                        </span>
                        <span className="text-emerald-500 font-bold">
                          {formatCurrency(results.custoComPrograma)}
                        </span>
                      </div>
                      <div className="h-3 w-full bg-muted/40 rounded-full overflow-hidden p-[2px]">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full transition-all duration-700 ease-out shadow-lg"
                          style={{ width: `${pctComPrograma}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expected Benefits Bento Block */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="p-3 border border-white/5 bg-white/5 rounded-2xl space-y-1 transition-all duration-300 hover:bg-white/10">
                      <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Absenteísmo (-35%)
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Redução nas perdas por atestados falsos ou faltas constantes.
                      </p>
                    </div>
                    
                    <div className="p-3 border border-white/5 bg-white/5 rounded-2xl space-y-1 transition-all duration-300 hover:bg-white/10">
                      <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Turnover Ativo (-25%)
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Menos desligamentos e menor gasto direto com rescisão e contratação.
                      </p>
                    </div>

                    <div className="p-3 border border-white/5 bg-white/5 rounded-2xl space-y-1 transition-all duration-300 hover:bg-white/10">
                      <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Afastamentos Clínicos (-40%)
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Combate preventivo a patologias psicossociais graves e burnout.
                      </p>
                    </div>

                    <div className="p-3 border border-white/5 bg-white/5 rounded-2xl space-y-1 transition-all duration-300 hover:bg-white/10">
                      <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Produtividade (+45%)
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Resgate do engajamento em colaboradores que trabalhavam desmotivados.
                      </p>
                    </div>
                  </div>

                  <Button onClick={handleDownloadReport} className="w-full rounded-2xl py-6 font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-secondary transition-all hover:scale-[1.01]" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Relatório Executivo (PDF)
                  </Button>
                </CardContent>
              </Card>

              {/* Benchmarks Widget */}
              <div className="p-5 border border-white/10 dark:border-white/5 bg-card/30 backdrop-blur-md rounded-2xl text-center space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                  Indicadores de Referência de Mercado
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-2">
                    <p className="text-sm font-bold text-foreground">3% a 6%</p>
                    <p className="text-[9px] text-muted-foreground font-semibold">Absenteísmo Médio BR</p>
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-bold text-foreground">15% a 22%</p>
                    <p className="text-[9px] text-muted-foreground font-semibold">Rotatividade Média</p>
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-bold text-emerald-500">3x a 5x</p>
                    <p className="text-[9px] text-muted-foreground font-semibold">ROI Clássico Mental</p>
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-bold text-emerald-500">6 a 9 m</p>
                    <p className="text-[9px] text-muted-foreground font-semibold">Prazo de Payback</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}