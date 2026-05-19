import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info,
  Award,
  GitBranch,
  Stethoscope,
  Menu,
  FileText,
  Image,
} from "lucide-react";
import { PerfilPublico } from "@/hooks/usePerfilPublico";
import { ServicoPublico } from "@/hooks/useServicosPublicos";
import { DepoimentoPublico } from "@/hooks/useDepoimentosPublicos";
import { PortfolioImagem } from "@/hooks/usePortfolioImagens";

interface SmartSuggestionCardsProps {
  perfil: Partial<PerfilPublico>;
  servicos: ServicoPublico[];
  depoimentos: DepoimentoPublico[];
  portfolioImagens: PortfolioImagem[];
  onNavigate: (secao: string) => void;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
  action: {
    label: string;
    secao: string;
  };
  icon: any;
  impact: string;
}

export function SmartSuggestionCards({
  perfil,
  servicos,
  depoimentos,
  portfolioImagens,
  onNavigate,
}: SmartSuggestionCardsProps) {
  const generateSuggestions = (): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    // Sugestões de Alta Prioridade
    if (!perfil.titulo_profissional || perfil.titulo_profissional.trim().length === 0) {
      suggestions.push({
        id: "titulo-profissional",
        title: "Adicione seu Título Profissional",
        description: "Visitantes precisam saber quem você é logo de cara",
        priority: "high",
        category: "Essencial",
        action: {
          label: "Adicionar Agora",
          secao: "inicio",
        },
        icon: Target,
        impact: "+45% conversão",
      });
    }

    if (!perfil.biografia || perfil.biografia.trim().length < 50) {
      suggestions.push({
        id: "biografia",
        title: "Complete sua Biografia",
        description: "Uma biografia detalhada aumenta a confiança dos visitantes",
        priority: "high",
        category: "Essencial",
        action: {
          label: "Escrever Bio",
          secao: "inicio",
        },
        icon: Users,
        impact: "+35% engajamento",
      });
    }

    if (!perfil.foto_perfil) {
      suggestions.push({
        id: "foto-perfil",
        title: "Adicione uma Foto Profissional",
        description: "Páginas com foto profissional convertem 3x mais",
        priority: "high",
        category: "Essencial",
        action: {
          label: "Upload Foto",
          secao: "inicio",
        },
        icon: Users,
        impact: "+200% credibilidade",
      });
    }

    // Sugestões de Prioridade Média
    if (servicos.length === 0) {
      suggestions.push({
        id: "adicionar-servicos",
        title: "Liste seus Serviços",
        description: "Mostre claramente o que você oferece aos clientes",
        priority: "medium",
        category: "Conteúdo",
        action: {
          label: "Adicionar Serviços",
          secao: "servicos",
        },
        icon: Sparkles,
        impact: "+60% interesse",
      });
    } else if (servicos.length < 3) {
      suggestions.push({
        id: "mais-servicos",
        title: "Adicione Mais Serviços",
        description: "Páginas com 3+ serviços têm melhor performance",
        priority: "low",
        category: "Otimização",
        action: {
          label: "Ver Serviços",
          secao: "servicos",
        },
        icon: TrendingUp,
        impact: "+25% leads",
      });
    }

    if (depoimentos.filter(d => d.status === 'aprovado').length === 0) {
      suggestions.push({
        id: "adicionar-depoimentos",
        title: "Solicite Depoimentos",
        description: "Prova social aumenta drasticamente a conversão",
        priority: "medium",
        category: "Credibilidade",
        action: {
          label: "Solicitar Agora",
          secao: "prova-social",
        },
        icon: Users,
        impact: "+80% confiança",
      });
    }

    if (!perfil.whatsapp && !perfil.instagram && !perfil.linkedin) {
      suggestions.push({
        id: "adicionar-contatos",
        title: "Adicione Meios de Contato",
        description: "Facilite que visitantes entrem em contato com você",
        priority: "medium",
        category: "Conversão",
        action: {
          label: "Configurar",
          secao: "inicio",
        },
        icon: Zap,
        impact: "+50% conversões",
      });
    }

    if (!perfil.cta_hero_link || perfil.cta_hero_link.trim().length === 0) {
      suggestions.push({
        id: "cta-principal",
        title: "Configure CTA Principal",
        description: "Guie seus visitantes para a ação desejada",
        priority: "medium",
        category: "Conversão",
        action: {
          label: "Configurar CTA",
          secao: "hero-sobre",
        },
        icon: Target,
        impact: "+40% conversão",
      });
    }

    // Sugestões de Baixa Prioridade (Otimizações)
    if (!perfil.seo_titulo || !perfil.seo_descricao) {
      suggestions.push({
        id: "seo",
        title: "Otimize SEO da Página",
        description: "Melhore o ranqueamento nos motores de busca",
        priority: "low",
        category: "Crescimento",
        action: {
          label: "Configurar SEO",
          secao: "seo",
        },
        icon: TrendingUp,
        impact: "+30% visibilidade",
      });
    }

    // Novas seções - Prioridade Média
    if (!perfil.estatisticas || (perfil.estatisticas as any[]).length === 0) {
      suggestions.push({
        id: "estatisticas",
        title: "Adicione Números & Conquistas",
        description: "Estatísticas concretas demonstram sua experiência e expertise",
        priority: "medium",
        category: "Credibilidade",
        action: {
          label: "Adicionar Estatísticas",
          secao: "conteudo",
        },
        icon: Award,
        impact: "+55% autoridade",
      });
    }

    if (!perfil.processo_trabalho || (perfil.processo_trabalho as any[]).length === 0) {
      suggestions.push({
        id: "processo-trabalho",
        title: "Explique seu Processo de Trabalho",
        description: "Mostre como você conduz o atendimento, gerando confiança",
        priority: "medium",
        category: "Transparência",
        action: {
          label: "Definir Processo",
          secao: "conteudo",
        },
        icon: GitBranch,
        impact: "+40% clareza",
      });
    }

    if (!perfil.especialidades || (perfil.especialidades as any[]).length === 0) {
      suggestions.push({
        id: "especialidades",
        title: "Defina suas Especialidades",
        description: "Deixe claro quem você atende e suas áreas de expertise",
        priority: "medium",
        category: "Posicionamento",
        action: {
          label: "Adicionar Especialidades",
          secao: "conteudo",
        },
        icon: Stethoscope,
        impact: "+45% relevância",
      });
    }

    // Navegação e Footer - Prioridade Baixa
    if (!perfil.navbar_menu_items || (perfil.navbar_menu_items as any[]).length === 0) {
      suggestions.push({
        id: "menu-navegacao",
        title: "Configure seu Menu de Navegação",
        description: "Personalize os itens do menu para melhor guiar visitantes",
        priority: "low",
        category: "UX",
        action: {
          label: "Configurar Menu",
          secao: "navegacao-footer",
        },
        icon: Menu,
        impact: "+25% usabilidade",
      });
    }

    if (!perfil.footer_texto_sobre || perfil.footer_texto_sobre.trim().length === 0) {
      suggestions.push({
        id: "rodape",
        title: "Personalize o Rodapé",
        description: "Adicione um texto sobre você no rodapé da página",
        priority: "low",
        category: "Branding",
        action: {
          label: "Editar Rodapé",
          secao: "navegacao-footer",
        },
        icon: FileText,
        impact: "+10% profissionalismo",
      });
    }

    if (portfolioImagens.length === 0) {
      suggestions.push({
        id: "adicionar-portfolio",
        title: "Adicione Cases e Projetos",
        description: "Mostre seu trabalho através de imagens do seu portfólio",
        priority: "medium",
        category: "Credibilidade",
        action: {
          label: "Adicionar Portfolio",
          secao: "portfolio",
        },
        icon: Image,
        impact: "+50% confiança",
      });
    }

    if (!perfil.favicon_url) {
      suggestions.push({
        id: "favicon-personalizado",
        title: "Adicione seu Favicon",
        description: "Personalize o ícone que aparece na aba do navegador",
        priority: "low",
        category: "Branding",
        action: {
          label: "Upload Favicon",
          secao: "identidade",
        },
        icon: Image,
        impact: "+15% profissionalismo",
      });
    }

    if (!perfil.gtm_id && !perfil.facebook_pixel_id) {
      suggestions.push({
        id: "configurar-tracking",
        title: "Configure o Rastreamento",
        description: "Adicione GTM ou Pixel para medir conversões e otimizar anúncios",
        priority: "medium",
        category: "Conversão",
        action: {
          label: "Configurar Rastreamento",
          secao: "rastreamento",
        },
        icon: TrendingUp,
        impact: "+70% insights",
      });
    }

    if (!perfil.beneficios || (perfil.beneficios as any[]).length === 0) {
      suggestions.push({
        id: "beneficios",
        title: "Destaque seus Benefícios",
        description: "Mostre o valor que você entrega aos clientes",
        priority: "low",
        category: "Conteúdo",
        action: {
          label: "Adicionar Benefícios",
          secao: "faq-beneficios",
        },
        icon: Sparkles,
        impact: "+20% interesse",
      });
    }

    if (!perfil.faqs || (perfil.faqs as any[]).length === 0) {
      suggestions.push({
        id: "faqs",
        title: "Adicione Perguntas Frequentes",
        description: "Responda dúvidas comuns e reduza objeções",
        priority: "low",
        category: "Conteúdo",
        action: {
          label: "Criar FAQs",
          secao: "faq-beneficios",
        },
        icon: Info,
        impact: "+15% conversão",
      });
    }

    if (!perfil.ativo) {
      suggestions.push({
        id: "ativar-perfil",
        title: "Ative sua Página Pública",
        description: "Torne sua página visível para o mundo",
        priority: "high",
        category: "Publicação",
        action: {
          label: "Ativar Agora",
          secao: "publicacao",
        },
        icon: Zap,
        impact: "Começar a captar leads",
      });
    }

    return suggestions;
  };

  const suggestions = generateSuggestions();
  const highPriority = suggestions.filter((s) => s.priority === "high");
  const mediumPriority = suggestions.filter((s) => s.priority === "medium");
  const lowPriority = suggestions.filter((s) => s.priority === "low");

  if (suggestions.length === 0) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return AlertCircle;
      case "medium":
        return Lightbulb;
      case "low":
        return Info;
      default:
        return Info;
    }
  };

  const renderSuggestionGroup = (
    suggestions: Suggestion[],
    title: string,
    icon: any
  ) => {
    if (suggestions.length === 0) return null;

    const Icon = icon;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">{title}</h3>
          <Badge variant="outline">{suggestions.length}</Badge>
        </div>
        <div className="grid gap-3">
          {suggestions.map((suggestion) => {
            const SuggestionIcon = suggestion.icon;
            const PriorityIcon = getPriorityIcon(suggestion.priority);

            return (
              <Card
                key={suggestion.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <SuggestionIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-sm">
                            {suggestion.title}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          {suggestion.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={getPriorityColor(suggestion.priority)}>
                      <PriorityIcon className="h-3 w-3 mr-1" />
                      {suggestion.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>Impacto: {suggestion.impact}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigate(suggestion.action.secao)}
                      className="h-7"
                    >
                      {suggestion.action.label}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Sugestões Inteligentes</h2>
      </div>

      {renderSuggestionGroup(highPriority, "Ação Urgente", AlertCircle)}
      {renderSuggestionGroup(mediumPriority, "Recomendado", Lightbulb)}
      {renderSuggestionGroup(lowPriority, "Otimizações", Sparkles)}
    </div>
  );
}
