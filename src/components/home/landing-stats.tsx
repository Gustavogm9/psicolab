import { Target, BarChart3, Globe, Shield } from "lucide-react";

export function LandingStats() {
  const stats = [
    {
      icon: Target,
      value: "100%",
      label: "Automação de leads",
      description: "Do diagnóstico ao CRM"
    },
    {
      icon: BarChart3,
      value: "ROI",
      label: "Comprovado",
      description: "Relatórios que mostram resultados"
    },
    {
      icon: Globe,
      value: "Página",
      label: "Profissional",
      description: "Com domínio personalizado"
    },
    {
      icon: Shield,
      value: "LGPD",
      label: "Compliant",
      description: "Dados seguros e protegidos"
    }
  ];

  return (
    <section className="py-12 bg-muted/30 border-y">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="text-center space-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-2">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="font-medium text-foreground">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
