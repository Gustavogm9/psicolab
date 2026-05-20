import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoButtons } from "@/components/home/demo-buttons";
import { Link } from "react-router-dom";
import { useWhiteLabel } from "@/hooks/useWhiteLabel";
import { 
  ArrowRight, 
  Shield, 
  BarChart3, 
  Users, 
  CheckCircle,
  TrendingUp,
  Award,
  Target,
  Calculator,
  Download
} from "lucide-react";

interface HeroSectionProps {
  onViewChange?: () => void;
}

export function HeroSection({ onViewChange }: HeroSectionProps) {
  const { config } = useWhiteLabel();
  const features = [
    {
      icon: Shield,
      title: "Compliance NR-1",
      description: "Mapeamento completo de riscos psicossociais conforme regulamentação"
    },
    {
      icon: BarChart3,
      title: "Analytics Avançado",
      description: "Dashboards intuitivos com insights acionáveis para gestores"
    },
    {
      icon: Users,
      title: "Gestão Colaborativa",
      description: "Plataforma multi-usuário para consultoras e empresas clientes"
    },
    {
      icon: TrendingUp,
      title: "ROI Mensurável",
      description: "Simulador de retorno sobre investimento com métricas reais"
    }
  ];

  const benefits = [
    "Redução de até 30% no absenteísmo",
    "Melhoria de 25% na satisfação dos colaboradores", 
    "Compliance garantido com NR-1 e PGR/GRO",
    "ROI médio de 300% no primeiro ano"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft/30 to-secondary-soft/30">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {config?.logo_url ? (
              <img 
                src={config.logo_url} 
                alt={config.nome_empresa}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {config?.nome_empresa?.charAt(0) || 'M'}
                </span>
              </div>
            )}
            <h1 className="text-2xl font-bold text-gradient">
              {config?.nome_empresa || 'MenteMetrics'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={onViewChange}
            >
              Ver Demo
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <Badge className="bg-primary-soft text-primary border-primary/20 px-4 py-2">
            <Award className="w-4 h-4 mr-2" />
            Certificado para NR-1 e PGR/GRO
          </Badge>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Transforme a{" "}
              <span className="text-gradient-secondary">Saúde Mental</span>
              <br />
              da sua Empresa
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Plataforma completa para psicólogos consultores especializados em 
              <strong> saúde mental corporativa</strong>. Avaliações, análise e 
              intervenções baseadas em evidências científicas.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-4 h-auto"
              asChild
            >
              <Link to="/lead-capture">
                Diagnóstico Gratuito
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4 h-auto"
              asChild
            >
              <Link to="/roi-calculator">
                <Calculator className="mr-2 h-5 w-5" />
                Calcular ROI
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="lg" 
              className="text-lg px-8 py-4 h-auto"
              onClick={onViewChange}
            >
              Ver Demonstração
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>LGPD Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>ISO 27001</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Tudo que você precisa em uma plataforma
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Desde o primeiro check-up até relatórios executivos completos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="card-premium hover:scale-105 transition-all duration-300 text-center"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="card-premium bg-gradient-to-br from-primary-soft/20 to-secondary-soft/20 border-primary/10">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-success to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl lg:text-3xl mb-4">
                Resultados Comprovados
              </CardTitle>
              <CardDescription className="text-lg">
                Nossos clientes obtêm resultados mensuráveis em saúde mental e produtividade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-foreground font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Demo Section */}
      {onViewChange && <DemoButtons onViewChange={onViewChange} />}

      {/* Footer CTA */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Pronto para começar?
          </h2>
          <p className="text-lg text-muted-foreground">
            Junte-se a mais de 100 consultoras que já transformam empresas com nossa plataforma
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-12 py-4 h-auto"
            asChild
          >
            <Link to="/lead-capture">
              Criar Conta Gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}