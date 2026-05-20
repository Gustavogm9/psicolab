import { Globe, ClipboardList, Users, TrendingUp, Sparkles, Check, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function LandingFeatures() {
  const [selectedColor, setSelectedColor] = useState<"emerald" | "violet" | "sky" | "amber">("emerald");

  const colorThemes = {
    emerald: {
      primary: "bg-emerald-500",
      text: "text-emerald-500",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      gradient: "from-emerald-500/20 to-emerald-500/5",
      label: "Identidade Verde Esmeralda"
    },
    violet: {
      primary: "bg-violet-500",
      text: "text-violet-500",
      border: "border-violet-500/30",
      bg: "bg-violet-500/10",
      gradient: "from-violet-500/20 to-violet-500/5",
      label: "Identidade Roxo Ametista"
    },
    sky: {
      primary: "bg-sky-500",
      text: "text-sky-500",
      border: "border-sky-500/30",
      bg: "bg-sky-500/10",
      gradient: "from-sky-500/20 to-sky-500/5",
      label: "Identidade Azul Oceano"
    },
    amber: {
      primary: "bg-amber-500",
      text: "text-amber-500",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      gradient: "from-amber-500/20 to-amber-500/5",
      label: "Identidade Âmbar Quente"
    }
  };

  return (
    <section id="recursos" className="py-24 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
      {/* Estilos adicionais para o visual Apple */}
      <style dangerouslySetInnerHTML={{__html: `
        .glass-bento {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 30px rgb(0 0 0 / 0.02), inset 0 1px 0px rgba(255,255,255,0.25);
        }
        .dark .glass-bento {
          background: rgba(30, 41, 59, 0.3);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 30px rgb(0 0 0 / 0.05);
        }
        .bento-card-hover {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bento-card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgb(0 0 0 / 0.06);
          border-color: rgba(255, 255, 255, 0.3);
        }
        .dark .bento-card-hover:hover {
          border-color: rgba(255, 255, 255, 0.1);
        }
      `}} />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Cabeçalho */}
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Funcionalidades Premium
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            A infraestrutura que o seu negócio B2B exige
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-normal">
            Esqueça as planilhas manuais e o visual amador. Ofereça relatórios corporativos automáticos sob um design digno das maiores empresas do mundo.
          </p>
        </div>

        {/* Bento Grid Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* CARD 1: Whitelabel Interativo (Col-span 2 / Row-span 2 no Desktop) */}
          <Card className="md:col-span-2 glass-bento bento-card-hover overflow-hidden relative">
            <CardContent className="p-7 md:p-9 flex flex-col justify-between h-full space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shrink-0">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Portal Whitelabel & Captação</span>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight mt-0.5">Sua marca, sua identidade visual</h3>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground max-w-md">
                  Seus clientes e empresas parceiras acessam diagnósticos e relatórios através de uma plataforma customizada com suas cores, logo e domínio próprio.
                </p>
              </div>

              {/* Demo Whitelabel Interativa */}
              <div className="p-5 rounded-2xl border border-border/40 bg-background/60 shadow-sm space-y-4 max-w-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-md ${colorThemes[selectedColor].primary} shrink-0 shadow-sm`} />
                    <span className="text-xs font-bold text-foreground">Clínica & Consultoria de Psicologia</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] uppercase font-extrabold tracking-wider ${colorThemes[selectedColor].border} ${colorThemes[selectedColor].bg} ${colorThemes[selectedColor].text}`}>
                    Whitelabel Ativo
                  </Badge>
                </div>

                <div className="h-px bg-border/40" />

                {/* Card de Demonstração Simulada */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-2 text-left">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">Portal do Psicólogo</span>
                    <p className="text-xs font-semibold text-foreground">Acesse relatórios de ROI e diagnósticos</p>
                    <div className="flex gap-1.5 pt-1.5">
                      {Object.keys(colorThemes).map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color as any)}
                          className={`h-5 w-5 rounded-full border-2 transition-all ${
                            selectedColor === color 
                              ? "border-foreground scale-110 shadow-sm" 
                              : "border-transparent opacity-60 hover:opacity-100"
                          } ${
                            color === "emerald" ? "bg-emerald-500" :
                            color === "violet" ? "bg-violet-500" :
                            color === "sky" ? "bg-sky-500" : "bg-amber-500"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${colorThemes[selectedColor].border} ${colorThemes[selectedColor].bg} text-left flex flex-col justify-between space-y-2 transition-all duration-500`}>
                    <p className={`text-[9px] font-extrabold uppercase ${colorThemes[selectedColor].text}`}>{colorThemes[selectedColor].label}</p>
                    <p className="text-[11px] font-medium text-foreground">O visual de todo o seu app é reconfigurado instantaneamente.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 text-xs text-muted-foreground font-medium pt-2 border-t border-border/20">
                <span className="flex items-center gap-1.5">✓ Domínio Personalizado</span>
                <span className="flex items-center gap-1.5">✓ Branding Customizado</span>
                <span className="flex items-center gap-1.5">✓ SEO para Google</span>
              </div>

            </CardContent>
          </Card>

          {/* CARD 2: Diagnósticos COPSOQ (Col-span 1) */}
          <Card className="glass-bento bento-card-hover overflow-hidden relative">
            <CardContent className="p-7 md:p-8 flex flex-col justify-between h-full space-y-6">
              
              <div className="space-y-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shrink-0 w-fit">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Mapeamento de Riscos</span>
                  <h3 className="text-lg md:text-xl font-bold tracking-tight mt-0.5">Diagnósticos e COPSOQ II</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Avalie e mapeie estresse ocupacional, riscos psicossociais e clima com questionários estruturados de alto rigor científico.
                </p>
              </div>

              {/* Lista Animada de Questionários */}
              <div className="space-y-2">
                {[
                  { name: "Carga de Trabalho (COPSOQ)", fill: "w-[85%]" },
                  { name: "Demandas Cognitivas", fill: "w-[64%]" },
                  { name: "Suporte Social & Liderança", fill: "w-[92%]" }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1 text-left">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-foreground truncate max-w-[150px]">{item.name}</span>
                      <span className="text-muted-foreground">{item.fill.replace('w-[', '').replace('%]', '')}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/65 rounded-full overflow-hidden">
                      <div className={`h-full bg-primary/70 rounded-full ${item.fill}`} />
                    </div>
                  </div>
                ))}
              </div>

              <span className="text-xs font-semibold text-primary flex items-center gap-1 group cursor-pointer pt-2 border-t border-border/20">
                Templates de avaliações 
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>

            </CardContent>
          </Card>

          {/* CARD 3: CRM & Kanban de Oportunidades (Col-span 1) */}
          <Card className="glass-bento bento-card-hover overflow-hidden relative">
            <CardContent className="p-7 md:p-8 flex flex-col justify-between h-full space-y-6">
              
              <div className="space-y-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shrink-0 w-fit">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">CRM & Funil B2B</span>
                  <h3 className="text-lg md:text-xl font-bold tracking-tight mt-0.5">Kanban de Oportunidades</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Gerencie todo o relacionamento com as empresas contratantes de forma visual, da captação de leads à assinatura de propostas.
                </p>
              </div>

              {/* Kanban Miniaturizado */}
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="p-2 rounded-xl bg-muted/50 space-y-2 border border-border/30">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block">Lead</span>
                  <div className="p-2 rounded-lg bg-background border border-border/40 shadow-sm text-[9px] space-y-1">
                    <p className="font-bold text-foreground truncate">Votorantim</p>
                    <p className="text-muted-foreground text-[8px]">R$ 15k • Clima</p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-primary/5 space-y-2 border border-primary/10">
                  <span className="text-[9px] font-bold text-primary uppercase block">Proposta</span>
                  <div className="p-2 rounded-lg bg-background border border-primary/20 shadow-sm text-[9px] space-y-1">
                    <p className="font-bold text-foreground truncate">Itaú Tech</p>
                    <p className="text-primary font-semibold text-[8px]">R$ 32k • COPSOQ</p>
                  </div>
                </div>
              </div>

              <span className="text-xs font-semibold text-primary flex items-center gap-1 group cursor-pointer pt-2 border-t border-border/20">
                Gerenciar pipeline
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>

            </CardContent>
          </Card>

          {/* CARD 4: Relatórios de ROI (Col-span 2) */}
          <Card className="md:col-span-2 glass-bento bento-card-hover overflow-hidden relative">
            <CardContent className="p-7 md:p-9 flex flex-col justify-between h-full space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shrink-0">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Comprovação Financeira</span>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight mt-0.5">Relatórios executivos e ROI</h3>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground max-w-md">
                  Mostre aos CEOs e RHs o valor real da sua atuação de forma quantitativa. Prove como suas intervenções reduzem absenteísmo, rotatividade e economizam dinheiro.
                </p>
              </div>

              {/* Simulação de Bloco de ROI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border/40 bg-background/50 shadow-sm text-left">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Absenteísmo</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-extrabold text-red-500">-28%</span>
                    <span className="text-[8px] text-muted-foreground">anual</span>
                  </div>
                </div>
                <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border/40 pt-2 sm:pt-0 sm:pl-4">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Economia Direta</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-extrabold text-foreground">R$ 184k</span>
                    <span className="text-[8px] text-emerald-500 font-bold">Sinistros</span>
                  </div>
                </div>
                <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border/40 pt-2 sm:pt-0 sm:pl-4">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Produtividade</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-extrabold text-emerald-500">+12%</span>
                    <span className="text-[8px] text-muted-foreground">eNPS</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 text-xs text-muted-foreground font-medium pt-2 border-t border-border/20">
                <span className="flex items-center gap-1.5">✓ Exportação em PDF executivo</span>
                <span className="flex items-center gap-1.5">✓ Comparativos Antes/Depois</span>
                <span className="flex items-center gap-1.5">✓ Gráficos Prontos para Apresentação</span>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* Rodapé CTA */}
        <div className="text-center mt-16 animate-fade-in">
          <p className="text-sm text-muted-foreground mb-3 font-medium">
            Tudo isso integrado à gestão de contratos, cobranças Asaas e biblioteca de intervenções.
          </p>
          <button 
            onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs font-bold uppercase tracking-wider text-primary hover:text-accent flex items-center gap-1.5 mx-auto transition-colors"
          >
            Conhecer todos os recursos
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
