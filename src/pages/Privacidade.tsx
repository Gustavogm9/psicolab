import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Lock, 
  Eye, 
  UserCheck, 
  Database, 
  FileText, 
  Cookie, 
  Globe, 
  RefreshCw, 
  Mail, 
  Phone, 
  ChevronRight,
  ArrowUpRight
} from "lucide-react";

export default function Privacidade() {
  const [activeSection, setActiveSection] = useState("dados-coletados");

  const secoes = [
    { id: "dados-coletados", label: "1. Dados Coletados", icon: Database },
    { id: "finalidade", label: "2. Finalidade do Tratamento", icon: Eye },
    { id: "base-legal", label: "3. Base Legal (LGPD)", icon: Lock },
    { id: "compartilhamento", label: "4. Compartilhamento", icon: Shield },
    { id: "seguranca", label: "5. Armazenamento & Segurança", icon: Lock },
    { id: "direitos", label: "6. Seus Direitos (LGPD)", icon: UserCheck },
    { id: "retencao", label: "7. Retenção de Dados", icon: FileText },
    { id: "cookies", label: "8. Cookies", icon: Cookie },
    { id: "transferencia", label: "9. Transferência Internacional", icon: Globe },
    { id: "alteracoes", label: "10. Alterações na Política", icon: RefreshCw },
    { id: "dpo", label: "Encarregado de Dados (DPO)", icon: Mail },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // offset para compensar header fixo
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Monitora a seção visível na tela para atualizar a âncora ativa
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
        {/* Glows Orgânicos de Fundo no Estilo Apple/Linear */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
          
          {/* Cabeçalho Sophisticated Editorial */}
          <div className="space-y-4 mb-16 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Shield className="w-3.5 h-3.5" />
              Conformidade LGPD garantida
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Política de Privacidade
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base font-medium max-w-2xl">
              Última atualização: {new Date().toLocaleDateString('pt-BR')} • Entenda como a MenteMetrics protege, processa e respeita os seus dados organizacionais e pessoais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Navegação Rápida Lateral / Menu de Âncoras (Sticky Glassmorphic) */}
            <aside className="md:col-span-4 sticky top-24 hidden md:block">
              <div className="p-5 rounded-2xl border border-white/10 dark:border-white/5 bg-card/40 backdrop-blur-xl shadow-xl space-y-4">
                <div className="px-2 py-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Índice de Leitura
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
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
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

            {/* Menu Horizontal Mobile (Scroll horizontal sutil) */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-4 scrollbar-none sticky top-14 bg-background/95 z-30 py-2 border-b">
              {secoes.map((secao) => {
                const isActive = activeSection === secao.id;
                return (
                  <Button
                    key={secao.id}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => scrollToSection(secao.id)}
                    className="flex-shrink-0 text-xs rounded-full"
                  >
                    {secao.label}
                  </Button>
                );
              })}
            </div>

            {/* Conteúdo Principal Sophisticated Text Layout */}
            <div className="md:col-span-8 space-y-8 pb-20">
              
              {/* Nota de Introdução Premium */}
              <Card className="border border-primary/20 bg-primary/5 rounded-2xl overflow-hidden shadow-sm">
                <CardContent className="p-6 md:p-8 space-y-4">
                  <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Compromisso MenteMetrics com sua Segurança
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    A <strong>MenteMetrics</strong> está profundamente comprometida com a proteção da privacidade e a segurança inabalável de todos os dados trafegados em nossa plataforma de saúde mental e inteligência organizacional. Esta política documenta nosso compromisso transparente e as diretrizes de governança técnica que adotamos em estrito cumprimento à <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
                  </p>
                </CardContent>
              </Card>

              {/* Seção 1: Dados Coletados */}
              <section id="dados-coletados" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Database className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">1. Dados Coletados</h2>
                </div>
                <div className="prose prose-sm dark:prose-invert leading-relaxed text-muted-foreground space-y-4">
                  <p>
                    Para prestar serviços de inteligência e diagnóstico organizacional com precisão, coletamos as seguintes categorias de informações:
                  </p>
                  
                  <div className="grid gap-4 sm:grid-cols-2 mt-2">
                    <div className="p-4 rounded-xl border bg-muted/20">
                      <p className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Dados Cadastrais do Profissional
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Nome completo e identificador profissional (CRP, etc.)</li>
                        <li>Endereço de e-mail institucional e telefone ativo</li>
                        <li>Informações financeiras para faturamento e assinatura</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 rounded-xl border bg-muted/20">
                      <p className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                        Dados de Clientes & CRM
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Razão social, CNPJ e porte das empresas avaliadas</li>
                        <li>E-mails de contato dos gestores e patrocinadores</li>
                        <li>Configurações de Whitelabel (logos e paletas HSL)</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border bg-muted/20 col-span-1 sm:col-span-2">
                      <p className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        Respostas de Diagnósticos & Dados de Uso
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Respostas anônimas ou identificadas de questionários psicossociais (ex: COPSOQ)</li>
                        <li>Endereço IP, metadados de acesso, data/hora e logs de auditoria interna</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Seção 2: Finalidade do Tratamento */}
              <section id="finalidade" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Eye className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">2. Finalidade do Tratamento</h2>
                </div>
                <div className="prose prose-sm dark:prose-invert leading-relaxed text-muted-foreground space-y-3">
                  <p>
                    Todos os dados coletados têm propósitos estritamente técnicos e contratuais:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li><strong>Provisão de Serviço:</strong> Gerar relatórios executivos de saúde organizacional e índices de absenteísmo.</li>
                    <li><strong>Personalização Whitelabel:</strong> Aplicar automaticamente a marca do consultor em subdomínios vinculados.</li>
                    <li><strong>Análise de Leads & ROI:</strong> Estimar retornos financeiros sobre intervenções corporativas com base nos dados imputados.</li>
                    <li><strong>Segurança:</strong> Prevenir ataques cibernéticos e atestar logs de auditoria exigidos pelo compliance de RH.</li>
                  </ul>
                </div>
              </section>

              {/* Seção 3: Base Legal (LGPD) */}
              <section id="base-legal" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">3. Base Legal (LGPD)</h2>
                </div>
                <div className="prose prose-sm dark:prose-invert leading-relaxed text-muted-foreground space-y-3 text-sm">
                  <p>
                    Fundamentamos o processamento de dados nas seguintes bases legais estabelecidas pela LGPD:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Execução de Contrato (Art. 7º, V):</strong> Necessário para a correta entrega das licenças MenteMetrics contratadas.</li>
                    <li><strong>Consentimento (Art. 7º, I):</strong> Aplicado quando o colaborador aceita preencher uma avaliação psicossocial de forma opt-in.</li>
                    <li><strong>Legítimo Interesse (Art. 7º, IX):</strong> Para auditoria estatística agregada e otimização da performance de usabilidade do sistema.</li>
                  </ul>
                </div>
              </section>

              {/* Seção 4: Compartilhamento */}
              <section id="compartilhamento" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Shield className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">4. Compartilhamento de Dados</h2>
                </div>
                <div className="prose prose-sm dark:prose-invert leading-relaxed text-muted-foreground space-y-4 text-sm">
                  <p>
                    Garantimos com rigor que a MenteMetrics <strong>NÃO</strong> comercializa, aluga, ou cede dados pessoais ou organizacionais para quaisquer terceiros comerciais ou publicitários.
                  </p>
                  <p>
                    O compartilhamento se limita a provedores de infraestrutura crítica altamente qualificados:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Provedores de Nuvem (ex: Supabase, Vercel) com certificação SOC2/ISO 27001.</li>
                    <li>Gateways de pagamento sob conformidade PCI-DSS.</li>
                    <li>Consultorias autorizadas e empresas contratantes exclusivamente no escopo acordado pelo colaborador.</li>
                  </ul>
                </div>
              </section>

              {/* Seção 5: Armazenamento & Segurança */}
              <section id="seguranca" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">5. Armazenamento e Segurança</h2>
                </div>
                <div className="prose prose-sm dark:prose-invert leading-relaxed text-muted-foreground space-y-3 text-sm">
                  <p>
                    Empregamos controles de segurança em nível bancário para salvaguardar as informações:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Criptografia em Trânsito:</strong> Tráfego de ponta a ponta protegido por HTTPS / TLS 1.3 de alto bitrate.</li>
                    <li><strong>Criptografia em Repouso:</strong> Bancos de dados e buckets estáticos totalmente criptografados com AES-256.</li>
                    <li><strong>Isolamento de Tenant (RLS):</strong> Lógica rigorosa de Row Level Security (RLS) no Supabase, garantindo que nenhum usuário ou psicólogo consiga ler dados corporativos de outra consultoria.</li>
                    <li><strong>Backup & Auditoria:</strong> Backups automatizados diariamente e firewalls inteligentes com detecção de intrusão ativa.</li>
                  </ul>
                </div>
              </section>

              {/* Seção 6: Seus Direitos (LGPD) */}
              <section id="direitos" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <UserCheck className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">6. Seus Direitos (LGPD)</h2>
                </div>
                <div className="prose prose-sm dark:prose-invert leading-relaxed text-muted-foreground space-y-3 text-sm">
                  <p>
                    O titular de dados pessoais possui direitos inalienáveis garantidos pelo Artigo 18 da LGPD, os quais podem ser exercidos diretamente a qualquer momento:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 mt-2">
                    {[
                      "Confirmação da existência de tratamento dos seus dados",
                      "Acesso imediato e portabilidade de dados pessoais exportáveis",
                      "Correção de informações desatualizadas ou inconsistentes",
                      "Exclusão e anonimização de informações sensíveis desnecessárias",
                      "Revogação integral do consentimento outorgado",
                      "Oposição ao processamento de dados baseado em interesse legítimo"
                    ].map((direito, idx) => (
                      <div key={idx} className="flex gap-2 items-start p-3 border rounded-xl bg-card">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-foreground/80 font-medium leading-tight">{direito}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4">
                    Para formalizar solicitações de acesso ou exclusão de dados, entre em contato via:{" "}
                    <a href="mailto:dpo@mentemetrics.com.br" className="text-primary font-semibold hover:underline">
                      dpo@mentemetrics.com.br
                    </a>.
                  </p>
                </div>
              </section>

              {/* Seção 7: Retenção de Dados */}
              <section id="retencao" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">7. Retenção de Dados</h2>
                </div>
                <div className="prose prose-sm dark:prose-invert leading-relaxed text-muted-foreground space-y-3 text-sm">
                  <p>
                    Os dados são conservados somente enquanto durar a licença de assinatura ou até que o usuário solicite a exclusão formal da conta.
                  </p>
                  <p>
                    Ao final do contrato, realizamos a destruição segura das tabelas e arquivos em até 30 dias úteis, resguardando somente informações necessárias para o cumprimento de obrigações contábeis e fiscais.
                  </p>
                </div>
              </section>

              {/* Seção 8: Cookies */}
              <section id="cookies" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Cookie className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">8. Cookies e Tecnologias de Rastreio</h2>
                </div>
                <div className="prose prose-sm dark:prose-invert leading-relaxed text-muted-foreground space-y-3 text-sm">
                  <p>
                    Usamos cookies técnicos estritamente para manter sessões seguras e preservar preferências estéticas do whitelabel (ex. tema escuro vs. claro). Cookies analíticos (Google Analytics) rodam de forma anônima e podem ser desativados diretamente nas configurações do seu navegador.
                  </p>
                </div>
              </section>

              {/* Seção 9: Transferência Internacional */}
              <section id="transferencia" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Globe className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">9. Transferência Internacional de Dados</h2>
                </div>
                <div className="prose prose-sm dark:prose-invert leading-relaxed text-muted-foreground space-y-3 text-sm">
                  <p>
                    Os servidores e bancos de dados da MenteMetrics estão hospedados primordialmente em nuvem confiável localizada nos Estados Unidos da América (AWS/Supabase), com conformidade e cláusulas contratuais robustas que garantem o mesmo nível de proteção de dados exigidos pelo marco regulatório brasileiro.
                  </p>
                </div>
              </section>

              {/* Seção 10: Alterações na Política */}
              <section id="alteracoes" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 border-muted">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <RefreshCw className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">10. Alterações nesta Política</h2>
                </div>
                <div className="prose prose-sm dark:prose-invert leading-relaxed text-muted-foreground space-y-3 text-sm">
                  <p>
                    Esta política pode ser periodicamente revisada para fins de compliance. Atualizações expressivas serão notificadas via dashboard interno da plataforma ou por e-mail geral com no mínimo 15 dias de antecedência antes da vigência oficial.
                  </p>
                </div>
              </section>

              <Separator className="my-8" />

              {/* Seção Encarregado DPO (Apple Box Design) */}
              <section id="dpo" className="scroll-mt-28">
                <div className="p-6 md:p-8 rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-lg space-y-6">
                  <div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary mb-2">Fale Conosco</Badge>
                    <h3 className="text-2xl font-bold text-card-foreground">Encarregado de Dados (DPO)</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Para qualquer dúvida jurídica, requisições LGPD ou questionamentos sobre governança de dados na MenteMetrics:
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/10">
                      <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">E-mail Corporativo</p>
                        <a href="mailto:dpo@mentemetrics.com.br" className="font-semibold text-foreground hover:underline truncate block">
                          dpo@mentemetrics.com.br
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/10">
                      <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">E-mail de Suporte Geral</p>
                        <a href="mailto:contato@mentemetrics.com.br" className="font-semibold text-foreground hover:underline truncate block">
                          contato@mentemetrics.com.br
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-dashed text-xs text-muted-foreground space-y-1">
                    <p><strong>MenteMetrics Tech Ltda.</strong> • CNPJ: 00.000.000/0001-00</p>
                    <p>Av. Paulista, 1000 - Bela Vista, São Paulo/SP - CEP: 01310-100</p>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Caso sinta que seus direitos não foram plenamente atendidos, você possui legitimidade legal para peticionar diretamente junto à Autoridade Nacional de Proteção de Dados (ANPD).
                    </p>
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

// Componente simples auxiliar para evitar erros de compilação
function CheckCircle2(props: React.ComponentProps<typeof UserCheck>) {
  return (
    <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}
