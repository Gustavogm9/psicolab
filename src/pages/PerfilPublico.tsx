import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { PublicWhiteLabelProvider } from "@/components/layout/PublicWhiteLabelProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Instagram,
  Clock,
  DollarSign,
  Star,
  Monitor,
  Users,
  Video,
  Briefcase,
  Send,
  MessageSquare,
  Zap,
  Lock,
  ChevronDown,
  Plus,
  Minus,
} from "lucide-react";
import { usePerfilPublico } from "@/hooks/usePerfilPublico";
import { useServicosPublicos } from "@/hooks/useServicosPublicos";
import { useDepoimentosPublicos } from "@/hooks/useDepoimentosPublicos";
import { usePortfolioImagens } from "@/hooks/usePortfolioImagens";
import { useTrackEvent } from "@/hooks/usePerfilPublicoAnalytics";
import { useCreatePerfilPublicoLead } from "@/hooks/usePerfilPublicoLeads";
import { useQuestionariosPerfilPublico } from "@/hooks/useQuestionariosPerfilPublico";
import { useActiveDomain } from "@/hooks/useActiveDomain";
import { DiagnosticoWidget } from "@/components/perfil-publico/DiagnosticoWidget";
import { PortfolioGallery } from "@/components/perfil-publico/PortfolioGallery";
import { SEOMetaTags } from "@/components/perfil-publico/SEOMetaTags";
import { useGTM, trackGTMEvent } from "@/hooks/useGTM";
import { useFacebookPixel, trackPixelEvent, trackCapiEvent } from "@/hooks/useFacebookPixel";
import { SecaoWrapper } from "@/components/perfil-publico/SecaoWrapper";
import { PublicNavbar } from "@/components/perfil-publico/PublicNavbar";
import { NumerosConquistas } from "@/components/perfil-publico/NumerosConquistas";
import { ComoFunciona } from "@/components/perfil-publico/ComoFunciona";
import { Especialidades } from "@/components/perfil-publico/Especialidades";
import { ServicosLista } from "@/components/perfil-publico/ServicosLista";
import { DepoimentosLista } from "@/components/perfil-publico/DepoimentosLista";
import { HeroPremium } from "@/components/perfil-publico/HeroPremium";
import { SobrePremium } from "@/components/perfil-publico/SobrePremium";
import { FAQPremium } from "@/components/perfil-publico/FAQPremium";
import { ContatoPremium } from "@/components/perfil-publico/ContatoPremium";
import { FooterPremium } from "@/components/perfil-publico/FooterPremium";
import { ScrollReveal } from "@/components/perfil-publico/ScrollReveal";
import { getContrastColor } from "@/lib/color-utils";

interface PerfilPublicoProps {
  slug?: string;
}

const PerfilPublico = ({ slug: propSlug }: PerfilPublicoProps = {}) => {
  const { slug: paramSlug } = useParams();
  const slug = propSlug || paramSlug;
  const { data: perfil, isLoading: isLoadingPerfil } = usePerfilPublico(slug);
  const { data: activeDomain } = useActiveDomain();

  // Injetar GTM e Facebook Pixel
  useGTM(perfil?.gtm_id);
  useFacebookPixel(perfil?.facebook_pixel_id);

  // Trocar favicon dinamicamente quando o perfil carregar
  useEffect(() => {
    if (perfil?.favicon_url) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;

      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }

      // Salvar o favicon original
      const originalHref = link.href;

      // Atualizar com o favicon personalizado (com timestamp para evitar cache)
      link.href = `${perfil.favicon_url}?t=${Date.now()}`;

      // Cleanup: restaurar favicon padrão ao sair da página
      return () => {
        link.href = originalHref || '/favicon.png';
      };
    }
  }, [perfil?.favicon_url]);

  const { data: servicos = [], isLoading: isLoadingServicos } = useServicosPublicos(perfil?.id);
  const { data: depoimentos = [], isLoading: isLoadingDepoimentos } = useDepoimentosPublicos(perfil?.id);
  const { data: portfolioImagens = [], isLoading: isLoadingPortfolio } = usePortfolioImagens(perfil?.id);
  const { data: questionarios = [] } = useQuestionariosPerfilPublico(perfil?.id);
  const trackEvent = useTrackEvent();
  const createLead = useCreatePerfilPublicoLead();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
  });

  // Registrar visita
  useEffect(() => {
    if (perfil) {
      const visitaRegistrada = sessionStorage.getItem(`visita_perfil_${perfil.id}`);
      if (!visitaRegistrada) {
        trackEvent.mutate({
          perfilPublicoId: perfil.id,
          tipoEvento: 'visita',
        });
        sessionStorage.setItem(`visita_perfil_${perfil.id}`, 'true');
      }
    }
  }, [perfil, trackEvent]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!perfil?.id) return;

    createLead.mutate({
      perfilPublicoId: perfil.id,
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone || undefined,
      mensagem: formData.mensagem || undefined,
      origem: 'formulario_contato',
    });

    trackEvent.mutate({
      perfilPublicoId: perfil.id,
      tipoEvento: 'envio_formulario',
    });

    // Rastrear no GTM e Facebook Pixel
    trackGTMEvent('form_submission', { form_type: 'contact', perfil_id: perfil.id });
    trackPixelEvent('Contact', { content_name: 'formulario_contato' });

    // Rastrear na CAPI com dados do usuário
    if (perfil.facebook_pixel_id) {
      trackCapiEvent(
        perfil.id,
        perfil.facebook_pixel_id,
        'Lead',
        { content_name: 'formulario_contato', content_category: 'contact_form' },
        { email: formData.email, phone: formData.telefone, first_name: formData.nome }
      );
    }

    setFormData({ nome: "", email: "", telefone: "", mensagem: "" });
  };

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(preco);
  };

  const formatarDuracao = (minutos: number) => {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h${mins}min` : `${horas}h`;
  };

  const getModalidadeIcon = (modalidade: string) => {
    switch (modalidade) {
      case "presencial":
        return <Users className="w-4 h-4" />;
      case "online":
        return <Video className="w-4 h-4" />;
      case "hibrido":
        return <Monitor className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getModalidadeLabel = (modalidade: string) => {
    switch (modalidade) {
      case "presencial":
        return "Presencial";
      case "online":
        return "Online";
      case "hibrido":
        return "Híbrido";
      default:
        return "Não especificado";
    }
  };

  if (isLoadingPerfil) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-64 w-full mb-8 bg-gray-200" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-40 w-full bg-gray-200" />
              <Skeleton className="h-60 w-full bg-gray-200" />
            </div>
            <div>
              <Skeleton className="h-96 w-full bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!perfil || !perfil.ativo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">🔒 Página Não Disponível</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Esta página ainda não está publicada.
            </p>
            <p className="text-sm text-muted-foreground">
              Se você é o proprietário, acesse as configurações para ativá-la.
            </p>
            <Button asChild className="w-full">
              <a href="/">Voltar para Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const secoesOrdenadas = (perfil.secoes_config || []).sort((a, b) => a.ordem - b.ordem);

  // URL da página (usar domínio customizado se disponível)
  const pageUrl = activeDomain?.isCustomDomain
    ? `https://${activeDomain.domain}`
    : `${window.location.origin}/perfil/${slug}`;

  // Função para renderizar cada seção baseada no ID
  const renderSecao = (secaoId: string): React.ReactNode => {
    switch (secaoId) {
      case 'hero':
        if (!perfil.titulo_hero) return null;
        return (
          <HeroPremium
            key="hero"
            perfil={perfil}
            onCtaClick={() => {
              trackEvent.mutate({
                perfilPublicoId: perfil.id,
                tipoEvento: 'clique_cta_hero',
              });
              trackGTMEvent('cta_click', { cta_type: 'hero', page_slug: slug, perfil_id: perfil.id });
              trackPixelEvent('Lead', { content_name: 'hero_cta', content_category: 'cta' });

              // CAPI
              if (perfil.facebook_pixel_id) {
                trackCapiEvent(
                  perfil.id,
                  perfil.facebook_pixel_id,
                  'Lead',
                  { content_name: 'hero_cta', content_category: 'cta' }
                );
              }
            }}
          />
        );

      case 'numeros':
        if (!perfil.estatisticas || perfil.estatisticas.length === 0) return null;
        return (
          <SecaoWrapper key="numeros" bg="muted" id="numeros">
            <NumerosConquistas
              estatisticas={perfil.estatisticas}
              corPrimaria={perfil.tema_cor_primaria}
              onEstatisticaClick={(estatistica) => {
                trackEvent.mutate({
                  perfilPublicoId: perfil.id,
                  tipoEvento: 'clique_estatistica',
                  metadata: { estatisticaId: estatistica.id, label: estatistica.label },
                });
              }}
            />
          </SecaoWrapper>
        );

      case 'sobre':
        if (!perfil.biografia) return null;
        return (
          <SecaoWrapper key="sobre" bg="white" id="sobre">
            <SobrePremium perfil={perfil} />
          </SecaoWrapper>
        );

      case 'beneficios':
        if (!perfil.beneficios || perfil.beneficios.length === 0) return null;
        return (
          <SecaoWrapper key="beneficios" bg="muted" id="beneficios">
            {/* Título com fonte elegante */}
            <div className="text-center mb-14">
              <h2
                className="font-playfair text-4xl md:text-5xl font-bold mb-4"
                style={{ color: perfil.tema_cor_primaria }}
              >
                Por Que Escolher Meu Trabalho?
              </h2>
              <div
                className="w-20 h-1 rounded-full mx-auto"
                style={{ background: `linear-gradient(to right, ${perfil.tema_cor_primaria}, ${perfil.tema_cor_secundaria || perfil.tema_cor_primaria})` }}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {perfil.beneficios.map((beneficio: any, index: number) => {
                const IconComponent = (LucideIcons as any)[beneficio.icone] || LucideIcons.Target;
                return (
                  <Card
                    key={beneficio.id}
                    className="text-center hover:shadow-xl transition-all duration-300 animate-fade-in border-t-4 group"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      borderTopColor: perfil.tema_cor_primaria
                    }}
                  >
                    <CardContent className="pt-8 pb-8">
                      <div className="flex justify-center mb-4">
                        {/* Blob shape instead of circle */}
                        <div
                          className="p-5 rounded-[40%_60%_55%_45%/55%_45%_55%_45%] transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: `${perfil.tema_cor_primaria}15` }}
                        >
                          <IconComponent
                            className="h-10 w-10"
                            style={{ color: perfil.tema_cor_primaria }}
                          />
                        </div>
                      </div>
                      <h3 className="font-playfair text-2xl font-semibold mb-3">{beneficio.titulo}</h3>
                      <p className="text-muted-foreground text-base leading-relaxed">{beneficio.descricao}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </SecaoWrapper>
        );

      case 'como_funciona':
        if (!perfil.processo_trabalho || perfil.processo_trabalho.length === 0) return null;
        return (
          <SecaoWrapper key="como_funciona" bg="white" id="como-funciona">
            <ComoFunciona
              passos={perfil.processo_trabalho}
              corPrimaria={perfil.tema_cor_primaria}
              corSecundaria={perfil.tema_cor_secundaria}
              onPassoView={(passo, index) => {
                trackEvent.mutate({
                  perfilPublicoId: perfil.id,
                  tipoEvento: 'visualizacao_passo_processo',
                  metadata: { passoId: passo.id, titulo: passo.titulo, posicao: index + 1 },
                });
              }}
            />
          </SecaoWrapper>
        );

      case 'servicos':
        if (servicos.length === 0) return null;
        return (
          <SecaoWrapper key="servicos" bg="muted" id="servicos">
            <ServicosLista
              servicos={servicos}
              corPrimaria={perfil.tema_cor_primaria}
              corSecundaria={perfil.tema_cor_secundaria}
              whatsapp={perfil.whatsapp}
              onCtaClick={() => {
                trackEvent.mutate({
                  perfilPublicoId: perfil.id,
                  tipoEvento: 'clique_servico',
                });
              }}
            />
          </SecaoWrapper>
        );

      case 'especialidades':
        if (!perfil.especialidades || perfil.especialidades.length === 0) return null;
        return (
          <SecaoWrapper key="especialidades" bg="white" id="especialidades">
            <Especialidades
              especialidades={perfil.especialidades}
              corPrimaria={perfil.tema_cor_primaria}
              onEspecialidadeClick={(especialidade) => {
                trackEvent.mutate({
                  perfilPublicoId: perfil.id,
                  tipoEvento: 'clique_especialidade',
                  metadata: {
                    especialidadeId: especialidade.id,
                    titulo: especialidade.titulo,
                    destaque: especialidade.destaque
                  },
                });
              }}
            />
          </SecaoWrapper>
        );

      case 'depoimentos':
        if (depoimentos.length === 0) return null;
        return (
          <SecaoWrapper key="depoimentos" bg="white" id="depoimentos">
            <DepoimentosLista
              depoimentos={depoimentos}
              corPrimaria={perfil.tema_cor_primaria}
              corSecundaria={perfil.tema_cor_secundaria}
            />
          </SecaoWrapper>
        );

      case 'portfolio':
        if (portfolioImagens.length === 0) return null;
        return (
          <SecaoWrapper key="portfolio" bg="white" id="portfolio">
            {/* Título com fonte elegante */}
            <div className="text-center mb-14">
              <h2
                className="font-playfair text-4xl md:text-5xl font-bold mb-4"
                style={{ color: perfil.tema_cor_primaria }}
              >
                Portfólio
              </h2>
              <div
                className="w-20 h-1 rounded-full mx-auto"
                style={{ background: `linear-gradient(to right, ${perfil.tema_cor_primaria}, ${perfil.tema_cor_secundaria || perfil.tema_cor_primaria})` }}
              />
            </div>
            <PortfolioGallery
              imagens={portfolioImagens}
              corPrimaria={perfil.tema_cor_primaria}
              onImageClick={(imagemId) => {
                trackEvent.mutate({
                  perfilPublicoId: perfil.id,
                  tipoEvento: 'clique_portfolio',
                  metadata: { imagemId },
                });
              }}
            />
          </SecaoWrapper>
        );

      case 'faq':
        if (!perfil.faqs || perfil.faqs.length === 0) return null;
        return (
          <ScrollReveal key="faq" animation="fade-up">
            <SecaoWrapper bg="muted" id="faq">
              <FAQPremium
                faqs={perfil.faqs}
                corPrimaria={perfil.tema_cor_primaria}
                corSecundaria={perfil.tema_cor_secundaria}
              />
            </SecaoWrapper>
          </ScrollReveal>
        );

      case 'diagnosticos':
        if (questionarios.length === 0) return null;
        return (
          <SecaoWrapper key="diagnosticos" bg="white" id="diagnosticos">
            {/* Título com fonte elegante */}
            <div className="text-center mb-14">
              <h2
                className="font-playfair text-4xl md:text-5xl font-bold mb-4"
                style={{ color: perfil.tema_cor_primaria }}
              >
                Diagnósticos Gratuitos
              </h2>
              <div
                className="w-20 h-1 rounded-full mx-auto"
                style={{ background: `linear-gradient(to right, ${perfil.tema_cor_primaria}, ${perfil.tema_cor_secundaria || perfil.tema_cor_primaria})` }}
              />
            </div>

            <div className="grid gap-6">
              {questionarios.map((questionario) => (
                <DiagnosticoWidget
                  key={questionario.id}
                  questionario={questionario}
                  corPrimaria={perfil.tema_cor_primaria}
                  onClique={() => {
                    trackEvent.mutate({
                      perfilPublicoId: perfil.id,
                      tipoEvento: 'clique_servico',
                    });
                  }}
                />
              ))}
            </div>
          </SecaoWrapper>
        );

      case 'cta_intermediario':
        if (!perfil.cta_intermediario_titulo || !perfil.cta_intermediario_botao_texto || !perfil.cta_intermediario_botao_link) return null;
        return (
          <SecaoWrapper key="cta_intermediario" bg="gradient" corPrimaria={perfil.tema_cor_primaria || undefined} corSecundaria={perfil.tema_cor_secundaria || undefined}>
            <div className="text-center py-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {perfil.cta_intermediario_titulo}
              </h2>
              {perfil.cta_intermediario_subtitulo && (
                <p className="text-xl md:text-2xl text-white/90 mb-8">
                  {perfil.cta_intermediario_subtitulo}
                </p>
              )}
              <Button
                size="lg"
                className="bg-white hover:bg-gray-100 text-lg px-10 py-7 shadow-2xl"
                style={{ color: perfil.tema_cor_primaria }}
                onClick={() => {
                  if (perfil.cta_intermediario_botao_link.startsWith('#')) {
                    const element = document.querySelector(perfil.cta_intermediario_botao_link);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  } else if (perfil.cta_intermediario_botao_link.startsWith('http://') || perfil.cta_intermediario_botao_link.startsWith('https://')) {
                    window.open(perfil.cta_intermediario_botao_link, '_blank', 'noopener,noreferrer');
                  } else {
                    const anchorId = perfil.cta_intermediario_botao_link.replace(/^\//, '');
                    const element = document.getElementById(anchorId);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = perfil.cta_intermediario_botao_link;
                    }
                  }
                  trackEvent.mutate({
                    perfilPublicoId: perfil.id,
                    tipoEvento: 'clique_cta_intermediario',
                  });
                }}
              >
                {perfil.cta_intermediario_botao_texto}
              </Button>
            </div>
          </SecaoWrapper>
        );

      case 'contato':
        return (
          <ScrollReveal key="contato" animation="fade-up">
            <ContatoPremium
              perfil={perfil}
              perfilId={perfil.id}
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              isSubmitting={createLead.isPending}
            />
          </ScrollReveal>
        );

      default:
        return null;
    }
  };

  return (
    <PublicWhiteLabelProvider whiteLabelId={perfil.whitelabel_id}>
      <>
        <SEOMetaTags
          perfil={perfil}
          pageUrl={pageUrl}
          servicos={servicos}
          depoimentos={depoimentos}
        />

        <div
          className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 relative"
          style={{ fontFamily: perfil.tema_fonte }}
        >
          {/* Grid pattern background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

          {/* Navbar */}
          <PublicNavbar
            perfilNome={perfil.titulo_profissional || "Profissional"}
            fotoPerfil={perfil.foto_perfil}
            ctaTexto={perfil.navbar_cta_texto || "Agendar Consulta"}
            ctaLink={perfil.navbar_cta_link || "#contato"}
            menuItems={perfil.navbar_menu_items || undefined}
            corPrimaria={perfil.tema_cor_primaria}
            onCtaClick={() => {
              trackEvent.mutate({
                perfilPublicoId: perfil.id,
                tipoEvento: 'clique_cta_hero',
              });
              // Rastrear no GTM e Pixel
              trackGTMEvent('cta_click', { cta_type: 'navbar', page_slug: slug, perfil_id: perfil.id });
              trackPixelEvent('Lead', { content_name: 'navbar_cta', content_category: 'cta' });

              // CAPI
              if (perfil.facebook_pixel_id) {
                trackCapiEvent(
                  perfil.id,
                  perfil.facebook_pixel_id,
                  'Lead',
                  { content_name: 'navbar_cta', content_category: 'cta' }
                );
              }
            }}
          />

          {/* Seções renderizadas dinamicamente na ordem configurada */}
          {secoesOrdenadas
            .filter(secao => secao.visivel)
            .map(secao => renderSecao(secao.id))
          }

          {/* Footer Premium */}
          <FooterPremium
            perfil={perfil}
            nomeCompleto={perfil.titulo_profissional || "Profissional"}
          />

          {/* CTA Flutuante */}
          {perfil.cta_flutuante_ativo && perfil.cta_flutuante_texto && perfil.cta_flutuante_link && (
            <div className="fixed bottom-8 right-8 z-50 animate-fade-up">
              <Button
                size="lg"
                className="shadow-2xl hover:shadow-xl hover:brightness-90 transition-all duration-300 hover:scale-105 text-lg px-8"
                style={{
                  backgroundColor: perfil.tema_cor_primaria,
                  color: getContrastColor(perfil.tema_cor_primaria || '#000000'),
                  minHeight: '56px'
                }}
                onClick={() => {
                  if (perfil.cta_flutuante_link.startsWith('#')) {
                    const element = document.querySelector(perfil.cta_flutuante_link);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  } else if (perfil.cta_flutuante_link.startsWith('http://') || perfil.cta_flutuante_link.startsWith('https://')) {
                    window.open(perfil.cta_flutuante_link, '_blank', 'noopener,noreferrer');
                  } else {
                    const anchorId = perfil.cta_flutuante_link.replace(/^\//, '');
                    const element = document.getElementById(anchorId);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = perfil.cta_flutuante_link;
                    }
                  }
                  trackEvent.mutate({
                    perfilPublicoId: perfil.id,
                    tipoEvento: 'clique_cta_flutuante',
                  });
                }}
              >
                <Zap className="w-5 h-5 mr-2" />
                {perfil.cta_flutuante_texto}
              </Button>
            </div>
          )}
        </div>
      </>
    </PublicWhiteLabelProvider>
  );
};

export default PerfilPublico;
