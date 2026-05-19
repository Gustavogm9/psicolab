import { User, Users, Monitor, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function LandingUseCases() {
  const useCases = [
    {
      icon: User,
      title: "Psicólogo Organizacional",
      description: "Atua com empresas oferecendo diagnósticos, treinamentos e consultoria",
      benefits: [
        "Página profissional para captação de leads",
        "CRM integrado para gestão de oportunidades",
        "Relatórios de ROI que comprovam resultados"
      ]
    },
    {
      icon: Users,
      title: "Consultoria de RH",
      description: "Oferece serviços de saúde mental corporativa para múltiplos clientes",
      benefits: [
        "Gestão completa de clientes corporativos",
        "Avaliações e diagnósticos organizacionais",
        "Financeiro com contratos recorrentes"
      ]
    },
    {
      icon: Monitor,
      title: "Equipe de Saúde Mental",
      description: "Time que atende grandes empresas com programas estruturados",
      benefits: [
        "Multi-usuário com colaboração em tempo real",
        "Gestão de projetos e intervenções complexas",
        "Relatórios consolidados por empresa"
      ]
    },
    {
      icon: Briefcase,
      title: "Coach Executivo",
      description: "Profissional que combina coaching com saúde mental organizacional",
      benefits: [
        "Avaliações 360° e feedback estruturado",
        "Planos de desenvolvimento personalizados",
        "Acompanhamento de evolução com métricas"
      ]
    }
  ];

  return (
    <section id="casos-uso" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Para todo perfil profissional
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Independente do seu modelo de atuação, temos as ferramentas certas para sua consultoria
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <Card 
                key={index}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="inline-flex p-4 rounded-2xl bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {useCase.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {useCase.description}
                      </p>
                    </div>

                    <ul className="space-y-2">
                      {useCase.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-0.5">✓</span>
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
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
