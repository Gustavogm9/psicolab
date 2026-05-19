import { Building2, Users, BarChart2, Target, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LandingForCompanies() {
  const companyBenefits = [
    {
      icon: Building2,
      title: "Para consultorias",
      description: "Gerencie múltiplos clientes corporativos em um só lugar com eficiência"
    },
    {
      icon: Users,
      title: "Para equipes",
      description: "Colabore com outros profissionais em projetos maiores e complexos"
    },
    {
      icon: BarChart2,
      title: "Para gestores de RH",
      description: "Dashboards e relatórios consolidados para tomada de decisão estratégica"
    },
    {
      icon: Target,
      title: "Para psicólogos autônomos",
      description: "Profissionalize sua atuação com empresas e destaque-se no mercado"
    }
  ];

  const features = [
    "CRM completo para gestão de leads e oportunidades",
    "Questionários diagnósticos prontos e personalizáveis",
    "Relatórios de ROI automáticos e profissionais",
    "Gestão financeira com contratos recorrentes",
    "Página pública com domínio personalizado",
    "Integração com Asaas para cobranças"
  ];

  return (
    <section id="para-empresas" className="py-20 bg-gradient-to-br from-primary/5 via-background to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Building2 className="h-4 w-4" />
                Solução Corporativa
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Perfeito para quem trabalha com{" "}
                <span className="text-gradient">empresas</span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Seja consultoria, equipe de saúde mental ou psicólogo autônomo, 
                oferecemos todas as ferramentas para profissionalizar sua atuação 
                com organizações.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {companyBenefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-card border hover:shadow-md transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="inline-flex p-2 rounded-lg bg-primary/10 mb-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                );
              })}
            </div>

            <Button size="lg" className="group" onClick={() => window.location.href = '/login'}>
              Começar teste grátis
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right column - Visual mockup */}
          <div className="relative">
            <Card className="p-6 shadow-2xl animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Dashboard Consultoria</h3>
                      <p className="text-xs text-muted-foreground">Visão completa do negócio</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                    Multi-usuário
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Recursos inclusos:</h4>
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 animate-fade-in"
                      style={{ animationDelay: `${(index + 3) * 100}ms` }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">15+</div>
                      <div className="text-xs text-muted-foreground">Clientes ativos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">48</div>
                      <div className="text-xs text-muted-foreground">Leads no CRM</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">R$ 85k</div>
                      <div className="text-xs text-muted-foreground">Faturamento</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg animate-fade-in" style={{ animationDelay: "400ms" }}>
              <span className="text-sm font-semibold">🚀 Profissional</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
