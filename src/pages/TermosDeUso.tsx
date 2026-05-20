import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  HelpCircle, 
  UserPlus, 
  Slash, 
  Award, 
  ShieldAlert, 
  CreditCard, 
  Scale, 
  XOctagon, 
  RefreshCw, 
  Globe, 
  Mail, 
  ChevronRight,
  UserCheck
} from "lucide-react";

export default function TermosDeUso() {
  const [activeSection, setActiveSection] = useState("aceitacao");

  const secoes = [
    { id: "aceitacao", label: "1. Aceitação dos Termos", icon: Award },
    { id: "servico", label: "2. Descrição do Serviço", icon: HelpCircle },
    { id: "cadastro", label: "3. Cadastro & Conta", icon: UserPlus },
    { id: "uso-aceitavel", label: "4. Uso Aceitável", icon: ShieldAlert },
    { id: "propriedade-intelectual", label: "5. Propriedade Intelectual", icon: FileText },
    { id: "protecao-dados", label: "6. Proteção de Dados", icon: UserCheck },
    { id: "pagamentos", label: "7. Pagamentos & Reembolsos", icon: CreditCard },
    { id: "limitacao", label: "8. Limitação de Responsabilidade", icon: ShieldAlert },
    { id: "rescisao", label: "9. Rescisão", icon: XOctagon },
    { id: "modificacoes", label: "10. Modificações dos Termos", icon: RefreshCw },
    { id: "lei", label: "11. Lei Aplicável", icon: Scale },
    { id: "contato", label: "Dúvidas & Contato", icon: Mail },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // offset para header fixo
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      for (const secao of secoes) {
        const element = document.getElementById(secao.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;

          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(secao.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <MainLayout>
      <div className="relative min-h-screen bg-background/95">
        {/* Glows Orgânicos Apple de Fundo */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-secondary/5 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
          
          {/* Cabeçalho Sophisticated */}
          <div className="space-y-4 mb-16 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-semibold text-secondary">
              <FileText className="w-3.5 h-3.5" />
              Contrato de Licença de Software
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Termos de Uso
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base font-medium max-w-2xl">
              Última atualização: {new Date().toLocaleDateString('pt-BR')} • Leia com atenção os termos regulatórios da licença MenteMetrics que regem o uso do software e serviços integrados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Navegação Rápida Lateral / Menu de Âncoras */}
            <aside className="md:col-span-4 sticky top-24 hidden md:block">
              <div className="p-5 rounded-2xl border border-white/10 dark:border-white/5 bg-card/40 backdrop-blur-xl shadow-xl space-y-4">
                <div className="px-2 py-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Índice do Acordo
                  </h3>
                </div>
                <nav className="space-y-1.5">
                  {secoes.map((secao) => {
                    const Icon = secao.icon;
                    const isActive = activeSection === secao.id;
                    return (
                      <button
                        key={secao.id}
                        onClick={() => scrollToSection(secao.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/25 scale-[1.02]"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                          <span className="truncate">{secao.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Menu Horizontal Mobile */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-4 scrollbar-none sticky top-14 bg-background/95 z-30 py-2 border-b">
              {secoes.map((secao) => {
                const isActive = activeSection === secao.id;
                return (
                  <Button
                    key={secao.id}
                    variant={isActive ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => scrollToSection(secao.id)}
                    className="flex-shrink-0 text-xs rounded-full"
                  >
                    {secao.label}
                  </Button>
                );
              })}
            </div>

            {/* Conteúdo Principal */}
            <div className="md:col-span-8 space-y-8 pb-20">
              
              {/* Nota Reguladora */}
              <Card className="border border-secondary/20 bg-secondary/5 rounded-2xl overflow-hidden shadow-sm">
                <CardContent className="p-6 md:p-8 space-y-4">
                  <h3 className="font-bold text-lg text-secondary flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Acordo Legal do Usuário Final (EULA)
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Este documento constitui um acordo legal regulatório entre você (consultor, psicólogo ou corporação licenciada) e a <strong>MenteMetrics</strong>. Ao navegar, cadastrar-se ou usufruir de qualquer recurso de nossa plataforma, você atesta anuência tácita integral a estes Termos de Uso e às nossas Políticas de Privacidade.
                  </p>
                </CardContent>
              </Card>

              {/* Seção 1: Aceitação */}
              <section id="aceitacao" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <Award className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">1. Aceitação dos Termos</h2>
                </div>
                <div className="prose prose-sm leading-relaxed text-muted-foreground space-y-2 text-sm">
                  <p>
                    O acesso, cadastro e uso da marca, software e dados da MenteMetrics estão expressamente condicionados à sua conformidade com estes Termos. Caso discorde de quaisquer previsões aqui descritas, o uso do ecossistema de software torna-se imediatamente não autorizado por lei.
                  </p>
                </div>
              </section>

              {/* Seção 2: Descrição do Serviço */}
              <section id="servico" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <HelpCircle className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">2. Descrição do Serviço</h2>
                </div>
                <div className="prose prose-sm leading-relaxed text-muted-foreground space-y-3 text-sm">
                  <p>
                    A MenteMetrics é uma plataforma avançada no modelo SaaS (Software as a Service) para psicólogos organizacionais e empresas, que engloba:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Ambiente de CRM voltado à captação de leads empresariais.</li>
                    <li>Ferramentas de disparo e processamento de testes psicológicos corporativos de forma isolada e anônima.</li>
                    <li>Cálculo em tempo real de retorno sobre investimento (ROI) de saúde corporativa.</li>
                    <li>Editor Whitelabel para injeção dinâmica de marcas e cores próprias de consultores RH.</li>
                    <li>Hospedagem automatizada de perfis públicos associados a subdomínios dinâmicos.</li>
                  </ul>
                </div>
              </section>

              {/* Seção 3: Cadastro e Conta */}
              <section id="cadastro" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <UserPlus className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">3. Cadastro e Conta de Usuário</h2>
                </div>
                <div className="prose prose-sm leading-relaxed text-muted-foreground space-y-3 text-sm">
                  <p>
                    Para usufruir da plataforma, é obrigatória a criação de conta sob as seguintes premissas:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Prestar dados verdadeiros, exatos e atualizados na ficha cadastral.</li>
                    <li>Garantir a total confidencialidade de sua senha de acesso e chaves de API.</li>
                    <li>Reportar imediatamente ao suporte qualquer suspeita de invasão ou vazamento de senha.</li>
                    <li>O cadastro é estritamente pessoal, intransferível e vedado a múltiplos usuários por assento de licença sem contratação específica.</li>
                  </ul>
                </div>
              </section>

              {/* Seção 4: Uso Aceitável */}
              <section id="uso-aceitavel" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <ShieldAlert className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">4. Uso Aceitável</h2>
                </div>
                <div className="prose prose-sm leading-relaxed text-muted-foreground space-y-3 text-sm">
                  <p>O usuário concorda em <strong>NÃO</strong> realizar as seguintes ações:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-danger-soft">
                    <li>Disparar campanhas abusivas de spam de e-mail de questionários.</li>
                    <li>Utilizar robôs ou scripts automatizados para extrair relatórios ou dados agregados (web scraping).</li>
                    <li>Burlar limites de Row Level Security (RLS) ou tentar infiltrar SQL injections no backend.</li>
                    <li>Praticar pirataria ou engenharia reversa no código compilado em React e módulos integrados.</li>
                  </ul>
                </div>
              </section>

              {/* Seção 5: Propriedade Intelectual */}
              <section id="propriedade-intelectual" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">5. Propriedade Intelectual</h2>
                </div>
                <div className="prose prose-sm leading-relaxed text-muted-foreground space-y-3 text-sm">
                  <p>
                    Toda a estrutura lógica do software MenteMetrics, incluindo design de layout, favicons, scripts integrados, esquemas de tabelas Supabase e logotipos corporativos constituem propriedade intelectual autoral protegida pela Lei de Software nº 9.609/98 e direitos autorais internacionais.
                  </p>
                  <p>
                    A licença confere apenas o direito de uso restrito por assinatura. Os dados brutos inseridos pela consultoria (seus leads, clientes e notas internas) são e continuarão sendo de propriedade intelectual exclusiva do próprio consultor/empresa cliente.
                  </p>
                </div>
              </section>

              {/* Seção 6: Proteção de Dados */}
              <section id="protecao-dados" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <UserCheck className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">6. Proteção de Dados (LGPD)</h2>
                </div>
                <div className="prose prose-sm leading-relaxed text-muted-foreground space-y-2 text-sm">
                  <p>
                    Ambas as partes se obrigam a agir em conformidade total com a Lei Geral de Proteção de Dados. O consultor, na qualidade de Controlador de Dados, e a MenteMetrics, na qualidade de Operadora, comprometem-se a proteger as respostas e diagnósticos de saúde mental organizacional de qualquer colaborador participante contra vazamentos e acessos desautorizados.
                  </p>
                </div>
              </section>

              {/* Seção 7: Pagamentos e Reembolsos */}
              <section id="pagamentos" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <CreditCard className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">7. Pagamentos e Reembolsos</h2>
                </div>
                <div className="prose prose-sm leading-relaxed text-muted-foreground space-y-3 text-sm">
                  <p>
                    A MenteMetrics opera no modelo de assinatura recorrente mensal ou anual:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>O processamento e cobrança ocorrem de forma antecipada para vigência do período de trinta dias subsequentes.</li>
                    <li>O cancelamento pode ser feito a qualquer momento no painel, garantindo que não haverá novas recorrências.</li>
                    <li>Por razões operacionais, não são concedidos reembolsos proporcionais retroativos por dias de licença não usufruídos no ciclo vigente.</li>
                  </ul>
                </div>
              </section>

              {/* Seção 8: Limitação de Responsabilidade */}
              <section id="limitacao" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <ShieldAlert className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">8. Limitação de Responsabilidade</h2>
                </div>
                <div className="prose prose-sm leading-relaxed text-muted-foreground space-y-3 text-sm">
                  <p>
                    O software é fornecido na modalidade <strong>"COMO ESTÁ" (as is)</strong>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>A MenteMetrics não se responsabiliza por lucros cessantes, perdas financeiras ou decisões médicas/terapêuticas adotadas com base nos diagnósticos estatísticos do software.</li>
                    <li>Embora ofereçamos 99.9% de uptime histórico, não garantimos total infalibilidade do software frente a instabilidades na rede de telecomunicação de terceiros.</li>
                  </ul>
                </div>
              </section>

              {/* Seção 9: Rescisão */}
              <section id="rescisao" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <XOctagon className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">9. Rescisão</h2>
                </div>
                <div className="prose prose-sm leading-relaxed text-muted-foreground space-y-2 text-sm">
                  <p>
                    O descumprimento de qualquer obrigação de uso aceitável ou inadimplemento financeiro superior a 10 dias autoriza a MenteMetrics a rescindir ou suspender sumariamente o acesso à licença de software de forma unilateral.
                  </p>
                </div>
              </section>

              {/* Seção 10: Modificações dos Termos */}
              <section id="modificacoes" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <RefreshCw className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">10. Modificações dos Termos</h2>
                </div>
                <div className="prose prose-sm leading-relaxed text-muted-foreground space-y-2 text-sm">
                  <p>
                    Eventuais revisões nestes termos serão formalizadas mediante publicação nesta mesma página. A continuidade no login e uso das ferramentas após as publicações de revisão constitui anuência tácita integral às novas regras.
                  </p>
                </div>
              </section>

              {/* Seção 11: Lei Aplicável */}
              <section id="lei" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <Globe className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">11. Lei Aplicável e Foro</h2>
                </div>
                <div className="prose prose-sm leading-relaxed text-muted-foreground space-y-2 text-sm">
                  <p>
                    Estes termos são interpretados, regidos e executados em estrita concordância com as leis da República Federativa do Brasil. Para a resolução de quaisquer conflitos decorrentes deste contrato, as partes elegem soberanamente o Foro Central da Comarca de São Paulo/SP, com expressa renúncia a qualquer outro, por mais privilegiado que seja.
                  </p>
                </div>
              </section>

              <Separator className="my-8" />

              {/* Seção de Contato (Apple Box Design) */}
              <section id="contato" className="scroll-mt-28">
                <div className="p-6 md:p-8 rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-lg space-y-6">
                  <div>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary mb-2">Suporte Legal</Badge>
                    <h3 className="text-2xl font-bold text-card-foreground">Dúvidas Jurídicas & Contato</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Para sanar quaisquer ambiguidades reguladoras ou obter esclarecimentos sobre estes Termos de Uso:
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/10 text-sm">
                    <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">E-mail de Contato Legal</p>
                      <a href="mailto:contato@mentemetrics.com.br" className="font-semibold text-foreground hover:underline">
                        contato@mentemetrics.com.br
                      </a>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-dashed text-xs text-muted-foreground space-y-1">
                    <p><strong>MenteMetrics Tech Ltda.</strong> • CNPJ: 00.000.000/0001-00</p>
                    <p>Av. Paulista, 1000 - Bela Vista, São Paulo/SP - CEP: 01310-100</p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
