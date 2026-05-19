import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Check, 
  Star, 
  Zap, 
  Users, 
  BarChart3, 
  Shield, 
  Headphones,
  Crown,
  CreditCard,
  Download,
  Calendar,
  TrendingUp
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

const Billing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [currentPlan] = useState("professional");

  const plans = [
    {
      id: "starter",
      name: "Starter",
      description: "Ideal para pequenas empresas",
      monthlyPrice: 297,
      yearlyPrice: 2970,
      features: [
        "Até 50 colaboradores",
        "3 tipos de avaliação",
        "Relatórios básicos",
        "Suporte por email",
        "Dashboard básico",
        "Exportação PDF"
      ],
      limitations: [
        "Sem benchmark de mercado",
        "Sem integração com HRIS",
        "Histórico limitado a 6 meses"
      ],
      recommended: false,
      icon: Users
    },
    {
      id: "professional",
      name: "Professional",
      description: "Para empresas em crescimento",
      monthlyPrice: 597,
      yearlyPrice: 5970,
      features: [
        "Até 200 colaboradores",
        "Todos os tipos de avaliação",
        "Relatórios avançados",
        "Benchmark de mercado",
        "Suporte prioritário",
        "Integração básica",
        "Histórico completo",
        "Dashboard personalizado",
        "API básica"
      ],
      limitations: [
        "Sem white-label",
        "Integrações limitadas"
      ],
      recommended: true,
      icon: BarChart3
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Para grandes organizações",
      monthlyPrice: 1200,
      yearlyPrice: 12000,
      features: [
        "Colaboradores ilimitados",
        "Todos os recursos",
        "Consultoria especializada",
        "White-label disponível",
        "Integrações avançadas",
        "Suporte 24/7",
        "CSM dedicado",
        "API completa",
        "SLA garantido",
        "Treinamento personalizado"
      ],
      limitations: [],
      recommended: false,
      icon: Crown
    }
  ];

  const currentPlanData = plans.find(p => p.id === currentPlan);
  const usageData = {
    collaborators: { used: 87, limit: 200 },
    assessments: { used: 12, limit: 50 },
    apiCalls: { used: 2847, limit: 10000 }
  };

  const billingHistory = [
    {
      date: "15/11/2024",
      description: "Plano Professional - Mensal",
      amount: 597,
      status: "Pago",
      invoice: "INV-2024-11-001"
    },
    {
      date: "15/10/2024", 
      description: "Plano Professional - Mensal",
      amount: 597,
      status: "Pago",
      invoice: "INV-2024-10-001"
    },
    {
      date: "15/09/2024",
      description: "Plano Professional - Mensal", 
      amount: 597,
      status: "Pago",
      invoice: "INV-2024-09-001"
    }
  ];

  const getDiscountPercentage = () => {
    const monthly = currentPlanData?.monthlyPrice || 0;
    const yearly = currentPlanData?.yearlyPrice || 0;
    const monthlyTotal = monthly * 12;
    return Math.round(((monthlyTotal - yearly) / monthlyTotal) * 100);
  };

  return (
    <MainLayout>
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Planos e Cobrança</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gerencie sua assinatura e escolha o plano ideal para sua empresa
          </p>
        </div>

      {/* Current Plan Overview */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <currentPlanData.icon className="h-6 w-6" />
                Plano Atual: {currentPlanData?.name}
                <Badge variant="secondary">Ativo</Badge>
              </CardTitle>
              <CardDescription className="mt-2">
                Próxima cobrança: 15 de Dezembro de 2024 • R$ {currentPlanData?.monthlyPrice}
              </CardDescription>
            </div>
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Alterar Cartão
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Colaboradores</span>
                <span>{usageData.collaborators.used}/{usageData.collaborators.limit}</span>
              </div>
              <Progress 
                value={(usageData.collaborators.used / usageData.collaborators.limit) * 100} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avaliações este mês</span>
                <span>{usageData.assessments.used}/{usageData.assessments.limit}</span>
              </div>
              <Progress 
                value={(usageData.assessments.used / usageData.assessments.limit) * 100} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Chamadas API</span>
                <span>{usageData.apiCalls.used.toLocaleString()}/{usageData.apiCalls.limit.toLocaleString()}</span>
              </div>
              <Progress 
                value={(usageData.apiCalls.used / usageData.apiCalls.limit) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={!isYearly ? "font-medium" : "text-muted-foreground"}>Mensal</span>
        <Switch
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <span className={isYearly ? "font-medium" : "text-muted-foreground"}>Anual</span>
        {isYearly && (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Economize {getDiscountPercentage()}%
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.recommended ? 'border-primary shadow-lg' : ''} ${plan.id === currentPlan ? 'bg-primary/5' : ''}`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <plan.icon className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              
              <div className="space-y-2 pt-4">
                <div className="text-3xl font-bold text-foreground">
                  R$ {(isYearly ? plan.yearlyPrice / 12 : plan.monthlyPrice).toLocaleString()}
                  <span className="text-base font-normal text-muted-foreground">/mês</span>
                </div>
                {isYearly && (
                  <div className="text-sm text-muted-foreground">
                    Cobrado anualmente: R$ {plan.yearlyPrice.toLocaleString()}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-4">
                {plan.id === currentPlan ? (
                  <Button disabled className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Plano Atual
                  </Button>
                ) : plan.id === "enterprise" ? (
                  <Button variant="outline" className="w-full">
                    <Headphones className="h-4 w-4 mr-2" />
                    Falar com Vendas
                  </Button>
                ) : (
                  <Button className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    {currentPlan === "starter" ? "Fazer Upgrade" : "Alterar Plano"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Cobrança
          </CardTitle>
          <CardDescription>
            Suas últimas faturas e pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingHistory.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <div className="font-medium">{item.description}</div>
                  <div className="text-sm text-muted-foreground">{item.date}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">R$ {item.amount}</div>
                    <Badge variant={item.status === "Pago" ? "secondary" : "destructive"}>
                      {item.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise de Uso
          </CardTitle>
          <CardDescription>
            Como você está usando sua assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">87</div>
              <div className="text-sm text-muted-foreground">Colaboradores Ativos</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Avaliações Este Mês</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">2.8k</div>
              <div className="text-sm text-muted-foreground">API Calls</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Posso cancelar a qualquer momento?</h4>
            <p className="text-sm text-muted-foreground">
              Sim, você pode cancelar sua assinatura a qualquer momento. O cancelamento terá efeito no final do período de cobrança atual.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Como funciona o upgrade de plano?</h4>
            <p className="text-sm text-muted-foreground">
              O upgrade é instantâneo. Você será cobrado proporcionalmente pelo período restante do mês atual.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Aceita quais formas de pagamento?</h4>
            <p className="text-sm text-muted-foreground">
              Aceitamos cartões de crédito (Visa, Mastercard, Elo) e boleto bancário para planos anuais.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  );
};

export default Billing;