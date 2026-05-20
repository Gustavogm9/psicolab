import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Building2, ArrowRight, CheckCircle } from "lucide-react";

interface UserSelectionProps {
  onViewChange: (view: "consultora" | "gestor") => void;
}

export function UserSelection({ onViewChange }: UserSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MenteMetrics
            </span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Bem-vindo(a) ao MenteMetrics
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Selecione seu perfil para acessar a plataforma de consultoria psicológica corporativa
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Consultora Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/20 hover:scale-105 cursor-pointer overflow-hidden relative">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                Especialista
              </Badge>
            </div>
            
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-card-foreground">Psicólogo(a) Consultor(a)</h3>
                  <p className="text-muted-foreground">Especialista em saúde mental corporativa</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Acesse ferramentas completas para conduzir avaliações psicossociais, 
                  gerar relatórios profissionais e acompanhar o progresso dos seus clientes.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">O que você pode fazer:</h4>
                  <ul className="space-y-2">
                    {[
                      "Gerenciar múltiplas empresas clientes",
                      "Criar e aplicar avaliações personalizadas", 
                      "Gerar relatórios executivos e técnicos",
                      "Acompanhar ROI e métricas de impacto",
                      "Conduzir workshops e intervenções"
                    ].map((item, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button 
                className="w-full group-hover:bg-primary-hover transition-colors duration-300" 
                size="lg"
                onClick={() => onViewChange("consultora")}
              >
                Acessar como Consultor(a)
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>

          {/* Gestor Card */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-2 hover:border-secondary/20 hover:scale-105 cursor-pointer overflow-hidden relative">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                Executivo
              </Badge>
            </div>
            
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary-hover rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-card-foreground">Gestor Empresarial</h3>
                  <p className="text-muted-foreground">Líder focado em resultados e bem-estar</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Visualize dashboards executivos, acompanhe o progresso das iniciativas 
                  de saúde mental e acesse relatórios estratégicos para tomada de decisão.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">O que você pode fazer:</h4>
                  <ul className="space-y-2">
                    {[
                      "Visualizar métricas de saúde organizacional",
                      "Acompanhar ROI dos investimentos", 
                      "Baixar relatórios executivos",
                      "Monitorar status de ações e planos",
                      "Acessar evidências para auditorias"
                    ].map((item, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button 
                variant="secondary"
                className="w-full group-hover:bg-secondary-hover transition-colors duration-300" 
                size="lg"
                onClick={() => onViewChange("gestor")}
              >
                Acessar como Gestor
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Não tem certeza? <span className="text-primary cursor-pointer hover:underline">Saiba mais sobre cada perfil</span>
          </p>
        </div>
      </div>
    </div>
  );
}