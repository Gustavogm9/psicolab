import { Globe, ClipboardList, Users, TrendingUp, CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LandingFeatures() {
  const features = [
    {
      icon: Globe,
      category: "Página Pública",
      title: "Sua vitrine profissional online",
      points: [
        "Domínio personalizado (seunome.com.br)",
        "Seções customizáveis (serviços, depoimentos, FAQ)",
        "Formulário de captação integrado ao CRM",
        "SEO otimizado para Google"
      ],
      highlight: "Capte mais clientes"
    },
    {
      icon: ClipboardList,
      category: "Diagnósticos & Avaliações",
      title: "Mapeie necessidades organizacionais",
      points: [
        "Questionários de clima e satisfação",
        "Diagnósticos de saúde mental corporativa",
        "Avaliações de feedback 360°",
        "Relatórios automáticos com análises"
      ],
      highlight: "Templates prontos"
    },
    {
      icon: Users,
      category: "CRM & Leads",
      title: "Gerencie seu funil de vendas",
      points: [
        "Kanban visual de oportunidades",
        "Histórico completo de interações",
        "Alertas de follow-up automáticos",
        "Conversão de lead para cliente"
      ],
      highlight: "Aumente conversões"
    },
    {
      icon: TrendingUp,
      category: "ROI & Relatórios",
      title: "Comprove resultados aos clientes",
      points: [
        "Cálculo automático de ROI",
        "Comparativos antes/depois",
        "Exportação em PDF profissional",
        "Dashboard de métricas"
      ],
      highlight: "Fidelize clientes"
    }
  ];

  return (
    <section id="recursos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Recursos Completos
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold">
            Tudo que você precisa para crescer
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas profissionais para captação, gestão e retenção de clientes corporativos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in border-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-primary mb-1">
                          {feature.category}
                        </div>
                        <h3 className="text-xl font-bold leading-tight">
                          {feature.title}
                        </h3>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="whitespace-nowrap">
                      {feature.highlight}
                    </Badge>
                  </div>

                  {/* Points */}
                  <div className="space-y-3">
                    {feature.points.map((point, pointIndex) => (
                      <div
                        key={pointIndex}
                        className="flex items-start gap-3 group"
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Decorative gradient */}
                  <div className="absolute -bottom-2 -right-2 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            E muito mais: gestão financeira, contratos recorrentes, integração com Asaas...
          </p>
          <button 
            onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-primary hover:underline font-medium"
          >
            Ver todas as funcionalidades →
          </button>
        </div>
      </div>
    </section>
  );
}
