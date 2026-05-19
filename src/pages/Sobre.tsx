import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Award, 
  Heart, 
  Target, 
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";

const Sobre = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Segurança & Conformidade",
      description: "Atendemos rigorosamente às normas LGPD, ISO 27001 e NR-17 para máxima proteção de dados."
    },
    {
      icon: TrendingUp,
      title: "Analytics Avançado",
      description: "Dashboards intuitivos com insights acionáveis para tomada de decisão estratégica."
    },
    {
      icon: Users,
      title: "Colaboração Eficiente",
      description: "Plataforma integrada para RH, gestores e consultores trabalharem em sinergia."
    },
    {
      icon: Award,
      title: "Metodologia Validada",
      description: "Baseada em evidências científicas e melhores práticas do mercado internacional."
    }
  ];

  const stats = [
    { value: "500+", label: "Empresas Atendidas" },
    { value: "100k+", label: "Colaboradores Avaliados" },
    { value: "98%", label: "Satisfação dos Clientes" },
    { value: "24/7", label: "Suporte Disponível" }
  ];

  const team = [
    {
      name: "Dr. Carlos Mendes",
      role: "CEO & Fundador",
      description: "PhD em Psicologia Organizacional, 15+ anos em saúde ocupacional"
    },
    {
      name: "Dra. Ana Santos",
      role: "Diretora Científica",
      description: "Especialista em Ergonomia e Fatores Humanos, autora de 50+ publicações"
    },
    {
      name: "João Silva",
      role: "CTO",
      description: "Engenheiro de Software com expertise em soluções de saúde digital"
    }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            Sobre Nós
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transformando o
            <span className="text-primary"> Futuro do Trabalho</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Somos pioneiros em soluções tecnológicas para avaliação e gestão de riscos psicossociais, 
            promovendo ambientes de trabalho mais saudáveis e produtivos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/')}
              className="group"
            >
              Começar Agora
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/help')}
            >
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Nossa Missão
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Democratizar o acesso a ferramentas científicas de avaliação psicossocial, 
                permitindo que empresas de todos os tamanhos implementem programas efetivos 
                de saúde mental e bem-estar no trabalho.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <span className="font-medium">Bem-estar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="font-medium">Precisão</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-medium">Resultados</span>
                </div>
              </div>
            </div>
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Nossa Visão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ser a plataforma de referência global em saúde psicossocial organizacional, 
                  contribuindo para um futuro onde todos os trabalhadores tenham acesso a 
                  ambientes seguros, saudáveis e promotores de desenvolvimento humano.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Por que Escolher Nossa Plataforma?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combinamos expertise científica com tecnologia de ponta para entregar 
              soluções que realmente fazem a diferença.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nossa Equipe
            </h2>
            <p className="text-lg text-muted-foreground">
              Especialistas dedicados em transformar a saúde organizacional
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center p-6">
                <CardHeader>
                  <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Transformar sua Empresa?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Entre em contato conosco e descubra como podemos ajudar você a criar 
            um ambiente de trabalho mais saudável e produtivo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/')}
            >
              Começar Gratuitamente
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/help')}
            >
              Falar com Especialista
            </Button>
          </div>
          <Separator className="my-8 bg-primary-foreground/20" />
          <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm opacity-90">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>contato@workwell.com.br</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>+55 11 3000-0000</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>São Paulo, SP</span>
            </div>
          </div>
        </div>
      </section>
      </div>
    </MainLayout>
  );
};

export default Sobre;