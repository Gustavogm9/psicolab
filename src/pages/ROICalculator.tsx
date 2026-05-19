import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  BarChart3
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
    numFuncionarios: 100,
    salarioMedio: 5000,
    taxaAbsenteismo: 5,
    taxaTurnover: 15,
    custosRecrutamento: 15000,
    diasAfastamento: 10,
    produtividadePerdida: 20
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
    // Validar dados antes de calcular
    try {
      roiDataSchema.parse(roiData);
      calculateROI();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.issues[0].message);
        // Optionally show toast for validation errors
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

    // Custos atuais (sem programa)
    const custoAbsenteismo = (numFuncionarios * salarioMedio * (taxaAbsenteismo / 100) * 12) / 30;
    const custoTurnover = (numFuncionarios * (taxaTurnover / 100) * custosRecrutamento);
    const custoAfastamentos = (numFuncionarios * 0.1 * salarioMedio * diasAfastamento) / 30; // 10% da equipe se afasta
    const custoProdutividade = (numFuncionarios * salarioMedio * 12 * (produtividadePerdida / 100));
    
    const custoAtual = custoAbsenteismo + custoTurnover + custoAfastamentos + custoProdutividade;

    // Custos com programa (melhorias esperadas)
    const reducaoAbsenteismo = 0.4; // 40% de redução
    const reducaoTurnover = 0.3; // 30% de redução
    const reducaoAfastamentos = 0.5; // 50% de redução
    const aumentoProdutividade = 0.6; // 60% de melhoria

    const custoAbsenteismoComPrograma = custoAbsenteismo * (1 - reducaoAbsenteismo);
    const custoTurnoverComPrograma = custoTurnover * (1 - reducaoTurnover);
    const custoAfastamentosComPrograma = custoAfastamentos * (1 - reducaoAfastamentos);
    const custoProdutividadeComPrograma = custoProdutividade * (1 - aumentoProdutividade);

    // Custo do programa (estimativa)
    const custoPrograma = numFuncionarios * 100; // R$ 100 por funcionário/ano

    const custoComPrograma = custoAbsenteismoComPrograma + custoTurnoverComPrograma + 
                           custoAfastamentosComPrograma + custoProdutividadeComPrograma + custoPrograma;

    const economia = custoAtual - custoComPrograma;
    const roi = ((economia - custoPrograma) / custoPrograma) * 100;
    const payback = custoPrograma / (economia / 12); // meses para recuperar investimento

    setResults({
      custoAtual: Math.round(custoAtual),
      custoComPrograma: Math.round(custoComPrograma),
      economia: Math.round(economia),
      roi: Math.round(roi),
      payback: Math.round(payback)
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: "Relatório Gerado!",
      description: "O relatório detalhado do ROI foi enviado para seu email.",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Inputs */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-6 w-6 text-primary" />
                <span>Dados da Empresa</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Número de Funcionários</Label>
                <div className="px-3">
                  <Slider
                    value={[roiData.numFuncionarios]}
                    onValueChange={(value) => setROIData(prev => ({ ...prev, numFuncionarios: value[0] }))}
                    max={1000}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10</span>
                    <span className="font-medium">{roiData.numFuncionarios}</span>
                    <span>1000+</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salario">Salário Médio Mensal (R$)</Label>
                <Input
                  id="salario"
                  type="number"
                  value={roiData.salarioMedio}
                  onChange={(e) => setROIData(prev => ({ ...prev, salarioMedio: Number(e.target.value) }))}
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2">
                <Label>Taxa de Absenteísmo Atual (%)</Label>
                <div className="px-3">
                  <Slider
                    value={[roiData.taxaAbsenteismo]}
                    onValueChange={(value) => setROIData(prev => ({ ...prev, taxaAbsenteismo: value[0] }))}
                    max={20}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1%</span>
                    <span className="font-medium">{roiData.taxaAbsenteismo}%</span>
                    <span>20%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Taxa de Turnover Anual (%)</Label>
                <div className="px-3">
                  <Slider
                    value={[roiData.taxaTurnover]}
                    onValueChange={(value) => setROIData(prev => ({ ...prev, taxaTurnover: value[0] }))}
                    max={50}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5%</span>
                    <span className="font-medium">{roiData.taxaTurnover}%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recrutamento">Custo de Recrutamento por Pessoa (R$)</Label>
                <Input
                  id="recrutamento"
                  type="number"
                  value={roiData.custosRecrutamento}
                  onChange={(e) => setROIData(prev => ({ ...prev, custosRecrutamento: Number(e.target.value) }))}
                  placeholder="15000"
                />
              </div>

              <div className="space-y-2">
                <Label>Média de Dias de Afastamento por Caso</Label>
                <div className="px-3">
                  <Slider
                    value={[roiData.diasAfastamento]}
                    onValueChange={(value) => setROIData(prev => ({ ...prev, diasAfastamento: value[0] }))}
                    max={60}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5 dias</span>
                    <span className="font-medium">{roiData.diasAfastamento} dias</span>
                    <span>60 dias</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Perda de Produtividade Estimada (%)</Label>
                <div className="px-3">
                  <Slider
                    value={[roiData.produtividadePerdida]}
                    onValueChange={(value) => setROIData(prev => ({ ...prev, produtividadePerdida: value[0] }))}
                    max={50}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5%</span>
                    <span className="font-medium">{roiData.produtividadePerdida}%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {/* ROI Summary */}
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-success" />
                  <span>Resultado do ROI</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-lg p-6">
                    <div className="text-3xl font-bold text-success mb-2">
                      {formatCurrency(results.economia)}
                    </div>
                    <p className="text-muted-foreground">Economia Anual Estimada</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{results.roi}%</div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">{results.payback}</div>
                      <p className="text-sm text-muted-foreground">Meses Payback</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <span>Comparativo de Custos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span className="font-medium">Situação Atual</span>
                  </div>
                  <span className="font-bold text-destructive">
                    {formatCurrency(results.custoAtual)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-medium">Com Programa</span>
                  </div>
                  <span className="font-bold text-success">
                    {formatCurrency(results.custoComPrograma)}
                  </span>
                </div>

                <Separator />

                <div className="bg-primary/5 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <span>Benefícios Esperados</span>
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>40% redução no absenteísmo</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>30% redução no turnover</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>50% menos afastamentos por saúde mental</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>60% melhoria na produtividade</span>
                    </li>
                  </ul>
                </div>

                <Button onClick={handleDownloadReport} className="w-full" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Relatório Completo
                </Button>
              </CardContent>
            </Card>

            {/* Industry Benchmark */}
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-secondary" />
                  <span>Benchmark do Setor</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-warning">3-7%</div>
                    <p className="text-xs text-muted-foreground">Absenteísmo Médio</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-warning">12-18%</div>
                    <p className="text-xs text-muted-foreground">Turnover Médio</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-success">200-400%</div>
                    <p className="text-xs text-muted-foreground">ROI Típico</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-success">6-12</div>
                    <p className="text-xs text-muted-foreground">Meses Payback</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}