import { Target, ClipboardCheck, TrendingUp, Briefcase, DollarSign, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function LandingBenefits() {
  const benefits = [
    {
      icon: Target,
      title: "Mais leads qualificados",
      description: "Página profissional com formulários que alimentam seu CRM automaticamente"
    },
    {
      icon: ClipboardCheck,
      title: "Diagnósticos profissionais",
      description: "Questionários validados para mapear clima, estresse e saúde mental organizacional"
    },
    {
      icon: TrendingUp,
      title: "ROI comprovado",
      description: "Relatórios que mostram o retorno sobre investimento para seus clientes corporativos"
    },
    {
      icon: Briefcase,
      title: "Gestão de projetos",
      description: "Acompanhe intervenções, prazos e entregas de cada cliente com clareza"
    },
    {
      icon: DollarSign,
      title: "Financeiro integrado",
      description: "Contratos recorrentes, faturas automáticas e integração com Asaas para cobranças"
    },
    {
      icon: Shield,
      title: "LGPD compliant",
      description: "Dados protegidos com criptografia, políticas de privacidade e backups automáticos"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Por que escolher este sistema para sua consultoria?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desenvolvido especificamente para psicólogos organizacionais e consultores corporativos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card 
                key={index}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="inline-flex p-3 rounded-2xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    
                    <h3 className="text-xl font-semibold">
                      {benefit.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
