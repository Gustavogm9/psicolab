import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Users, BarChart3 } from "lucide-react";

interface DemoButtonsProps {
  onViewChange: (view: "consultora" | "gestor") => void;
}

export function DemoButtons({ onViewChange }: DemoButtonsProps) {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Explore a Plataforma
          </h2>
          <p className="text-xl text-muted-foreground">
            Veja como funciona para cada tipo de usuário
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Consultora Demo */}
          <Card className="card-premium hover:scale-105 transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Monitor className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Dashboard Consultora</CardTitle>
              <CardDescription>
                Gerencie clientes, projetos e relatórios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Painel de controle completo
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Gestão de múltiplos clientes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Relatórios executivos
                </li>
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                onClick={() => onViewChange("consultora")}
              >
                Ver Dashboard Consultora
              </Button>
            </CardContent>
          </Card>

          {/* Gestor Demo */}
          <Card className="card-premium hover:scale-105 transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Painel Executivo</CardTitle>
              <CardDescription>
                Acompanhe KPIs e planos de ação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                  Métricas de saúde mental
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                  ROI e simuladores
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                  Status de intervenções
                </li>
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-secondary to-primary hover:opacity-90"
                onClick={() => onViewChange("gestor")}
              >
                Ver Painel Executivo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}