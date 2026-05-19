import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

export function LandingHero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 pt-20 pb-16">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Coluna Esquerda - Texto */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">Sistema completo para psicólogos</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Transforme sua{" "}
              <span className="text-primary">consultoria</span> em saúde mental organizacional
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Sistema completo para psicólogos que atuam com empresas: captação de leads, 
              diagnósticos corporativos, gestão de projetos e relatórios de ROI que comprovam resultados.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" asChild className="text-base h-12 px-8">
                <Link to="/login">
                  Começar teste grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base h-12 px-8"
                onClick={() => scrollToSection('recursos')}
              >
                <Play className="mr-2 h-5 w-5" />
                Ver o sistema por dentro
              </Button>
            </div>

            <div className="pt-4 space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                ✓ Capte leads qualificados com sua página profissional
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                ✓ Aplique diagnósticos e avaliações organizacionais
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                ✓ Demonstre ROI e fidelize clientes com relatórios
              </p>
            </div>
          </div>

          {/* Coluna Direita - Mockup */}
          <div className="relative animate-fade-in animation-delay-200">
            <div className="relative">
              {/* Card principal */}
              <div className="bg-card border-2 rounded-2xl shadow-2xl p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-32 bg-primary/20 rounded" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                  <div className="h-px bg-border" />
                </div>

                {/* Mini Agenda */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="h-2 w-12 bg-primary rounded" />
                    <div className="h-2 w-24 bg-muted rounded" />
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/20" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2 w-full bg-muted rounded" />
                        <div className="h-2 w-2/3 bg-muted/60 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cards flutuantes */}
              <div className="absolute -right-4 -top-4 bg-card border rounded-xl shadow-lg p-4 w-48 animate-float">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div className="h-2 w-20 bg-muted rounded" />
                  </div>
                  <div className="h-8 w-full bg-primary/10 rounded" />
                </div>
              </div>

              <div className="absolute -left-4 -bottom-4 bg-card border rounded-xl shadow-lg p-4 w-40 animate-float animation-delay-500">
                <div className="space-y-2">
                  <div className="h-2 w-16 bg-muted rounded" />
                  <div className="h-6 bg-green-500/20 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">+47%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
    </section>
  );
}
