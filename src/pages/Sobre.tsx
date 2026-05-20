import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  MapPin,
  Sparkles,
  Zap,
  Globe,
  Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";

const Sobre = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Segurança & Conformidade",
      description: "Atendemos rigorosamente às diretrizes da LGPD, ISO 27001 e normas técnicas NR-17 para assegurar proteção máxima de dados sensíveis e sigilo absoluto."
    },
    {
      icon: TrendingUp,
      title: "Analytics Preditivo",
      description: "Algoritmos inteligentes mapeiam focos silenciosos de absenteísmo e burnout, transformando dados brutos em ações preventivas estruturadas."
    },
    {
      icon: Users,
      title: "Ecossistema Integrado",
      description: "Conexão fluida entre RH, médicos do trabalho, gestores e consultores psicológicos em uma interface unificada e simplificada."
    },
    {
      icon: Award,
      title: "Validação Científica",
      description: "Nossos inventários de diagnóstico utilizam bases internacionais reconhecidas, como o COPSOQ (Copenhagen Psychosocial Questionnaire) III."
    }
  ];

  const stats = [
    { value: "500+", label: "Empresas Atendidas", prefix: "" },
    { value: "100k+", label: "Colaboradores Avaliados", prefix: "" },
    { value: "98%", label: "Satisfação dos Clientes", prefix: "" },
    { value: "24/7", label: "Monitoramento de Riscos", prefix: "" }
  ];

  const team = [
    {
      name: "Dr. Carlos Mendes",
      role: "CEO & Co-fundador",
      description: "PhD em Psicologia Organizacional pela USP, com 15+ anos desenvolvendo programas estratégicos de saúde corporativa de alto impacto.",
      initials: "CM"
    },
    {
      name: "Dra. Ana Santos",
      role: "Diretora Científica",
      description: "Especialista em Ergonomia e Psicometria Ocupacional. Autora de mais de 50 artigos e publicações em periódicos internacionais.",
      initials: "AS"
    },
    {
      name: "João Silva",
      role: "CTO & Co-fundador",
      description: "Arquiteto de sistemas com ampla bagagem na construção de ecossistemas seguros e escaláveis em fintechs e healthtechs globais.",
      initials: "JS"
    }
  ];

  return (
    <MainLayout>
      <div className="relative min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glows orgânicos ao fundo */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        
        {/* Grid de fundo sofisticada estilo Linear */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full z-10 space-y-24">
          
          {/* Hero Section */}
          <section className="text-center space-y-6 pt-8 max-w-4xl mx-auto">
            <Badge variant="outline" className="px-3 py-1 bg-white/5 border-white/10 text-slate-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Nossa Identidade
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-none">
              Transformando a Cultura e o <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Futuro do Trabalho</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
              Na <strong>MenteMetrics</strong>, fundimos a precisão da psicometria científica com a agilidade do analytics de dados em tempo real. Desenvolvemos ecossistemas para diagnosticar riscos psicossociais, potencializar o bem-estar e guiar lideranças a decisões corporativas humanizadas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/diagnostico')}
                className="group rounded-2xl py-6 px-8 font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-secondary transition-all hover:scale-[1.01]"
              >
                Gerar Diagnóstico Gratuito
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/roi')}
                className="rounded-2xl py-6 px-8 border-white/10 hover:bg-white/5 text-slate-300 font-bold"
              >
                Simular ROI Financeiro
              </Button>
            </div>
          </section>

          {/* Bento Grid Editorial */}
          <section className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Nosso Propósito</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">Métricas rigorosas, metodologias validadas e impacto organizacional direto.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Bento Card 1: Missão (Grande - ocupa 2 colunas no desktop) */}
              <div className="md:col-span-2 border border-white/10 bg-slate-900/30 backdrop-blur-xl rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:border-white/15 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-primary/10 rounded-2xl border border-primary/20">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Diretriz Vital</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    Nossa Missão é democratizar o acesso à inteligência psicossocial estratégica.
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-400">
                    Acreditamos que a produtividade e a rentabilidade não devem colidir com a saúde mental. Por isso, simplificamos ferramentas de rastreamento científico de riscos ergonômicos e mentais, habilitando corporações de todos os portes a estruturarem ambientes saudáveis, dinâmicos e de desenvolvimento contínuo.
                  </p>
                </div>
                
                <div className="flex items-center space-x-6 pt-8 mt-6 border-t border-white/5 text-xs text-slate-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Bem-estar Ativo
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Validação Psicológica
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Resultados Sustentáveis
                  </div>
                </div>
              </div>

              {/* Bento Card 2: Visão (Padrão - ocupa 1 coluna) */}
              <div className="border border-white/10 bg-slate-900/30 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between hover:border-white/15 transition-colors relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-secondary/10 transition-colors" />
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-secondary/10 rounded-2xl border border-secondary/20">
                      <Target className="h-5 w-5 text-secondary" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Visão de Futuro</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                    Liderança Global em HealthTech
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-400">
                    Posicionar-se como o ecossistema de referência primária em diagnóstico ocupacional na América Latina, redefinindo o padrão regulatório e de apoio preventivo para mais de 10 milhões de colaboradores globais.
                  </p>
                </div>
                
                <div className="pt-6 border-t border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  MenteMetrics Roadmap 2030
                </div>
              </div>

              {/* Bento Card 3: Estatísticas Rápidas (Padrão - ocupa 1 coluna) */}
              <div className="border border-white/10 bg-slate-900/30 backdrop-blur-xl rounded-3xl p-8 hover:border-white/15 transition-colors flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <Zap className="h-5 w-5 text-emerald-500" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Métricas Reais</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                          {stat.value}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-500 leading-tight">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Auditoria com Zero Falsos-Positivos
                </div>
              </div>

              {/* Bento Card 4: Segurança e Governança (Grande - ocupa 2 colunas) */}
              <div className="md:col-span-2 border border-white/10 bg-slate-900/30 backdrop-blur-xl rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:border-white/15 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                      <Lock className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Governança Corporativa</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                    Infraestrutura corporativa baseada em blindagem de dados sensíveis e anonimização científica.
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-400">
                    Garantimos total tranquilidade ao jurídico e à segurança da sua empresa. Os dados são totalmente criptografados de ponta a ponta e as avaliações são consolidadas em relatórios coletivos, protegendo o anonimato individual do trabalhador, em estrito alinhamento com as determinações vigentes da LGPD.
                  </p>
                </div>

                <div className="flex gap-4 pt-6 border-t border-white/5 text-[10px] text-slate-400 font-semibold">
                  <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">LGPD Compliant</span>
                  <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">AES-256 Encryption</span>
                  <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">ISO 27001 Ready</span>
                </div>
              </div>

            </div>
          </section>

          {/* Features Grid de Pilares */}
          <section className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Pilares da Plataforma</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">Por que grandes times de gestão confiam no MenteMetrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feat, index) => (
                <div key={index} className="p-6 border border-white/5 bg-slate-900/20 rounded-2xl space-y-3 hover:bg-slate-900/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <feat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-base font-bold text-slate-200">{feat.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400">{feat.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Equipe com Retratos e Micro-animações */}
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <Badge variant="outline" className="px-3 py-1 bg-white/5 border-white/10 text-slate-400">
                Lideranças
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Nosso Comitê Executivo</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">Especialistas renomados dedicados a reformular a cultura organizacional.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="border border-white/10 bg-slate-900/30 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl text-center p-6 flex flex-col justify-between group hover:border-white/20 transition-all hover:scale-[1.01]">
                  <div className="space-y-4">
                    {/* Retrato estilizado de vidro com iniciais */}
                    <div className="w-20 h-20 bg-slate-950 border border-white/10 rounded-full mx-auto flex items-center justify-center relative overflow-hidden group-hover:border-primary/50 transition-colors">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10 opacity-50" />
                      <span className="text-xl font-black text-slate-200 group-hover:text-primary transition-colors">
                        {member.initials}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">{member.name}</h3>
                      <p className="text-xs font-semibold text-primary">{member.role}</p>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-400">
                      {member.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-center gap-4 text-xs font-semibold text-slate-500">
                    <span className="hover:text-slate-300 cursor-pointer">LinkedIn</span>
                    <span>•</span>
                    <span className="hover:text-slate-300 cursor-pointer">Portfólio</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Contact & CTA */}
          <section className="border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-900/20 backdrop-blur-xl rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Pronto para Mitigar Custos de Rotatividade?
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Mapear riscos ocupacionais é o primeiro passo para resgatar o engajamento e a produtividade da sua equipe. Entre em contato conosco e ative seu painel MenteMetrics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button 
                size="lg" 
                onClick={() => navigate('/diagnostico')}
                className="rounded-2xl py-6 px-8 font-bold bg-white text-slate-950 hover:bg-slate-200 transition-colors shadow-xl"
              >
                Iniciar Diagnóstico Agora
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/help')}
                className="rounded-2xl py-6 px-8 border-white/10 hover:bg-white/5 text-slate-300 font-bold"
              >
                Falar com Especialista
              </Button>
            </div>

            <Separator className="my-8 bg-white/5" />

            <div className="flex flex-col sm:flex-row gap-8 justify-center text-xs font-semibold text-slate-400">
              <div className="flex items-center justify-center space-x-2.5">
                <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span>contato@mentemetrics.com.br</span>
              </div>
              <div className="flex items-center justify-center space-x-2.5">
                <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span>+55 11 3000-0000</span>
              </div>
              <div className="flex items-center justify-center space-x-2.5">
                <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span>São Paulo, SP</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </MainLayout>
  );
};

export default Sobre;