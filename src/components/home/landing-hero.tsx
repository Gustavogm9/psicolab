import { Button } from "@/components/ui/button";
import { ArrowRight, Play, TrendingUp, Calendar, Users, Activity, ArrowUpRight, DollarSign, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export function LandingHero() {
  const [activeTab, setActiveTab] = useState<"roi" | "agenda" | "satisfacao">("roi");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-muted/5 to-background pt-24 pb-20 md:pt-28 md:pb-28">
      {/* Estilos locais de animações personalizadas (efeito 100% autônomo para garantir o visual Nível Apple) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drawLine {
          from { stroke-dashoffset: 400; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes floatOrg {
          0% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-15px) rotate(3deg) scale(1.05); }
          100% { transform: translateY(0px) rotate(0deg) scale(1); }
        }
        @keyframes floatOrgReverse {
          0% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(12px) rotate(-3deg) scale(0.95); }
          100% { transform: translateY(0px) rotate(0deg) scale(1); }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.08); }
        }
        .animate-draw-line {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: drawLine 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-float-org-1 {
          animation: floatOrg 10s ease-in-out infinite;
        }
        .animate-float-org-2 {
          animation: floatOrgReverse 12s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: subtlePulse 8s ease-in-out infinite;
        }
        .glass-premium {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .dark .glass-premium {
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .card-shadow-apple {
          box-shadow: 0 8px 30px rgb(0 0 0 / 0.04), 0 30px 60px rgb(0 0 0 / 0.04), inset 0 1px 0px rgba(255,255,255,0.2);
        }
        .btn-shine-effect {
          position: relative;
          overflow: hidden;
        }
        .btn-shine-effect::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 30%;
          height: 200%;
          background: rgba(255, 255, 255, 0.15);
          transform: rotate(30deg);
          transition: all 0.6s ease;
        }
        .btn-shine-effect:hover::after {
          left: 130%;
        }
      `}} />

      {/* Glows de Luz de Fundo Orgânicos */}
      <div className="absolute top-10 right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-10 left-[-10%] w-[600px] h-[600px] bg-accent/8 rounded-full blur-[130px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

      <div className="container relative z-10 mx-auto px-4 max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* Coluna Esquerda - Texto */}
          <div className="lg:col-span-6 space-y-7 text-left animate-fade-in">
            {/* Tag de destaque */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-primary/8 rounded-full border border-primary/20 shadow-sm transition-all duration-300 hover:bg-primary/12">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Plataforma N° 1 para Psicólogos Organizacionais</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.1] tracking-tight text-foreground">
              Transforme saúde mental em <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[size:200%] animate-pulse-glow">
                ROI e Valor Estratégico
              </span>
            </h1>

            {/* Descrição */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-normal">
              A única plataforma completa desenhada para psicólogos que atuam em empresas: capte leads qualificados, 
              aplique diagnósticos corporativos avançados (COPSOQ) e prove resultados com relatórios automáticos de ROI.
            </p>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-4 pt-3">
              <Button size="lg" asChild className="text-base h-13 px-8 rounded-xl font-medium btn-shine-effect bg-gradient-to-r from-primary to-accent hover:opacity-95 shadow-lg shadow-primary/20">
                <Link to="/login">
                  Começar Teste Grátis
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base h-13 px-8 rounded-xl font-medium glass-premium hover:bg-muted/30 hover:text-foreground transition-all duration-300"
                onClick={() => scrollToSection('recursos')}
              >
                <Play className="mr-2 h-4 w-4 fill-foreground" />
                Ver Demonstração
              </Button>
            </div>

            {/* Itens de Benefícios */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-border/60">
              {[
                "Captação automatizada de clientes B2B",
                "Diagnósticos corporativos COPSOQ",
                "Relatórios executivos e cálculo de ROI",
                "Portal whitelabel personalizado com sua marca"
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    ✓
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna Direita - Mockup de Dashboard Premium (Nível Apple) */}
          <div className="lg:col-span-6 relative mt-6 lg:mt-0">
            {/* Decorações do Mockup */}
            <div className="absolute top-[-8%] left-[-8%] w-56 h-56 bg-accent/15 rounded-full blur-[80px] animate-float-org-2 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-8%] w-60 h-60 bg-primary/15 rounded-full blur-[90px] animate-float-org-1 pointer-events-none" />

            {/* Dashboard Container Principal */}
            <div className="relative glass-premium card-shadow-apple rounded-[24px] border border-white/20 p-5 md:p-6 w-full animate-float-org-1 select-none">
              
              {/* Top Window Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-5">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                
                {/* Abas Interativas de Demonstração */}
                <div className="flex bg-muted/50 p-0.5 rounded-lg border border-border/20 text-[10px] sm:text-xs font-semibold">
                  <button 
                    onClick={() => setActiveTab("roi")}
                    className={`px-3 py-1 rounded-md transition-all ${activeTab === "roi" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    ROI Analítico
                  </button>
                  <button 
                    onClick={() => setActiveTab("agenda")}
                    className={`px-3 py-1 rounded-md transition-all ${activeTab === "agenda" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Diagnósticos
                  </button>
                  <button 
                    onClick={() => setActiveTab("satisfacao")}
                    className={`px-3 py-1 rounded-md transition-all ${activeTab === "satisfacao" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Satisfação
                  </button>
                </div>
              </div>

              {/* Área de Conteúdo da Aba Ativa */}
              <div className="min-h-[220px]">
                
                {/* 1. Aba ROI */}
                {activeTab === "roi" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Retorno de Investimento Estimado</span>
                        <h4 className="text-2xl font-bold text-foreground mt-0.5">328% de ROI</h4>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Gráfico SVG Animado de Linha */}
                    <div className="relative h-28 w-full border-b border-border/30 flex items-end">
                      <svg className="w-full h-full absolute inset-0" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Área do Gráfico */}
                        <path 
                          d="M0,90 Q50,70 100,50 T200,30 T300,10 L300,100 L0,100 Z" 
                          fill="url(#chartGlow)"
                          className="opacity-70"
                        />
                        {/* Linha Principal */}
                        <path 
                          d="M0,90 Q50,70 100,50 T200,30 T300,10" 
                          fill="none" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth="3.5" 
                          strokeLinecap="round"
                          className="animate-draw-line"
                        />
                        {/* Pontos de Destaque */}
                        <circle cx="100" cy="50" r="4.5" fill="hsl(var(--accent))" stroke="white" strokeWidth="1.5" />
                        <circle cx="200" cy="30" r="4.5" fill="hsl(var(--accent))" stroke="white" strokeWidth="1.5" />
                        <circle cx="300" cy="10" r="5" fill="hsl(var(--primary))" stroke="white" strokeWidth="2" />
                      </svg>
                      
                      {/* Grid Lines Horizontais do Mockup */}
                      <div className="w-full flex flex-col justify-between h-full text-[8px] text-muted-foreground/60 select-none pb-1">
                        <div className="border-t border-dashed border-border/20 w-full" />
                        <div className="border-t border-dashed border-border/20 w-full" />
                        <div className="border-t border-dashed border-border/20 w-full" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] md:text-xs text-muted-foreground font-medium pt-1">
                      <span>Jan: Diagnóstico</span>
                      <span>Mar: Ações</span>
                      <span>Mai: Auditoria ROI</span>
                    </div>
                  </div>
                )}

                {/* 2. Aba Agenda/Diagnósticos */}
                {activeTab === "agenda" && (
                  <div className="space-y-3.5 animate-fade-in">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Diagnósticos e Formulários Ativos</span>
                    
                    {[
                      { title: "Mapeamento Estresse Ocupacional", responses: 89, date: "Ativo", type: "COPSOQ II" },
                      { title: "Pesquisa de Clima Psicológico", responses: 142, date: "Ativo", type: "Clima B2B" },
                      { title: "Diagnóstico Risco Psicossocial", responses: 47, date: "Pendente", type: "Whitelabel" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-border/30 bg-background/50 hover:bg-background/80 transition-all duration-300 shadow-sm hover:translate-x-1">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs md:text-sm font-semibold text-foreground">{item.title}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                              <span>{item.type}</span>
                              <span>•</span>
                              <span>{item.responses} respostas</span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.date === "Ativo" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                          {item.date}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Aba Satisfação */}
                {activeTab === "satisfacao" && (
                  <div className="space-y-4 animate-fade-in">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Métricas de Clima Organizacional</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl border border-border/30 bg-background/50 flex flex-col justify-between">
                        <span className="text-[10px] font-semibold text-muted-foreground">eNPS Médio</span>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-2xl font-bold text-foreground">+74</span>
                          <span className="text-[10px] text-emerald-500 font-bold">✓ Zona de Excelência</span>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-xl border border-border/30 bg-background/50 flex flex-col justify-between">
                        <span className="text-[10px] font-semibold text-muted-foreground">Absenteísmo Reduzido</span>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-2xl font-bold text-foreground">-32%</span>
                          <span className="text-[10px] text-emerald-500 font-bold">Após Intervenções</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/30 bg-primary/5 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Activity className="h-4.5 w-4.5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-foreground">Relatório de Impacto</p>
                        <p className="text-[10px] text-muted-foreground">Comprovando redução de sinistros em R$ 142k/ano.</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Badges Flutuantes (Micro-interações) */}
              
              {/* Badge 1: Leads B2B (Superior Esquerdo) */}
              <div className="absolute -left-6 -top-5 glass-premium border border-white/20 p-2.5 rounded-xl shadow-xl flex items-center gap-2.5 w-44 animate-float hover:scale-105 transition-all duration-300">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Nova Empresa Lead</p>
                  <p className="text-xs font-bold text-foreground">Grupo Votorantim</p>
                </div>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground absolute top-2 right-2" />
              </div>

              {/* Badge 2: Valor Contrato (Inferior Direito) */}
              <div className="absolute -right-6 -bottom-5 glass-premium border border-white/20 p-2.5 rounded-xl shadow-xl flex items-center gap-2.5 w-44 animate-float hover:scale-105 transition-all duration-300" style={{ animationDelay: '2.5s' }}>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <DollarSign className="h-4.5 w-4.5" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Valor do Contrato</p>
                  <p className="text-xs font-bold text-foreground">R$ 12.500 /mês</p>
                </div>
                <Award className="h-3 w-3 text-emerald-500 absolute top-2 right-2 animate-bounce" />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
