import { Globe, ClipboardList, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function LandingHowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Globe,
      title: "Crie sua página profissional",
      description: "Configure seu perfil público com domínio personalizado para atrair empresas"
    },
    {
      number: "02",
      icon: ClipboardList,
      title: "Aplique diagnósticos",
      description: "Use questionários prontos ou personalizados para mapear necessidades organizacionais"
    },
    {
      number: "03",
      icon: Users,
      title: "Converta leads em clientes",
      description: "Gerencie todo o funil de vendas no CRM integrado com histórico completo"
    },
    {
      number: "04",
      icon: TrendingUp,
      title: "Comprove resultados",
      description: "Gere relatórios de ROI que demonstram o valor do seu trabalho às empresas"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Como funciona na prática
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Implementar o sistema é simples e rápido. Veja como começar a usar em 4 passos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index}
                className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="pt-8 pb-6">
                  <div className="absolute top-4 right-4 text-6xl font-bold text-primary/5">
                    {step.number}
                  </div>
                  
                  <div className="relative space-y-4">
                    <div className="inline-flex p-3 rounded-2xl bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    
                    <h3 className="text-xl font-semibold">
                      {step.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Linha conectora (apenas desktop) */}
        <div className="hidden lg:block relative -mt-64 mb-64">
          <div className="absolute top-1/2 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
      </div>
    </section>
  );
}
