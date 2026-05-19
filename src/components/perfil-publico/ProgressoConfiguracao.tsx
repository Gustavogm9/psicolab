import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { PerfilPublico } from "@/hooks/usePerfilPublico";
import { ServicoPublico } from "@/hooks/useServicosPublicos";
import { DepoimentoPublico } from "@/hooks/useDepoimentosPublicos";
import { PortfolioImagem } from "@/hooks/usePortfolioImagens";

interface ProgressoConfiguracaoProps {
  perfil: Partial<PerfilPublico>;
  servicos: ServicoPublico[];
  depoimentos: DepoimentoPublico[];
  portfolioImagens: PortfolioImagem[];
}

export function ProgressoConfiguracao({ perfil, servicos, depoimentos, portfolioImagens }: ProgressoConfiguracaoProps) {
  const calcularProgresso = () => {
    const checks = [
      // Fase 1: Configuração Inicial (23%)
      { campo: !!perfil.slug, peso: 5, label: "URL Personalizada" },
      { campo: !!perfil.titulo_profissional, peso: 5, label: "Título Profissional" },
      { campo: !!perfil.foto_perfil, peso: 5, label: "Foto de Perfil" },
      { campo: !!perfil.tema_cor_primaria, peso: 5, label: "Cores Definidas" },
      { campo: !!perfil.favicon_url, peso: 3, label: "Favicon Personalizado" },
      
      // Fase 2: Construir Conteúdo (40%)
      { campo: !!perfil.titulo_hero, peso: 8, label: "Hero Section" },
      { campo: !!perfil.biografia && perfil.biografia.length > 50, peso: 8, label: "Biografia Completa" },
      { campo: servicos.length > 0, peso: 8, label: "Serviços Adicionados" },
      { campo: depoimentos.length > 0, peso: 8, label: "Depoimentos" },
      { campo: !!(perfil.beneficios && (perfil.beneficios as any[]).length > 0), peso: 8, label: "Benefícios" },
      { campo: portfolioImagens.length > 0, peso: 5, label: "Portfólio" },
      
      // Fase 3: Otimizar Conversão (20%)
      { campo: !!perfil.cta_hero_link, peso: 5, label: "CTA Hero" },
      { campo: !!perfil.whatsapp || !!perfil.instagram || !!perfil.linkedin, peso: 5, label: "Redes Sociais" },
      { campo: !!(perfil.faqs && (perfil.faqs as any[]).length > 0), peso: 5, label: "FAQ" },
      { campo: !!perfil.cta_flutuante_ativo, peso: 5, label: "CTAs Configurados" },
      
      // Fase 4: Avançado (20%)
      { campo: !!perfil.seo_titulo, peso: 5, label: "SEO Título" },
      { campo: !!perfil.seo_descricao, peso: 5, label: "SEO Descrição" },
      { campo: !!perfil.gtm_id || !!perfil.facebook_pixel_id, peso: 5, label: "Rastreamento configurado" },
      { campo: !!perfil.secoes_config, peso: 5, label: "Layout Organizado" },
      { campo: perfil.ativo === true, peso: 5, label: "Perfil Ativo" },
    ];

    const total = checks.reduce((acc, check) => acc + (check.campo ? check.peso : 0), 0);
    const itensCompletos = checks.filter(check => check.campo).length;
    
    return {
      percentual: total,
      itensCompletos,
      totalItens: checks.length,
      checks
    };
  };

  const progresso = calcularProgresso();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Completude do Perfil</span>
          <Badge variant={progresso.percentual === 100 ? "default" : "secondary"}>
            {progresso.percentual}%
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {progresso.itensCompletos}/{progresso.totalItens} itens
        </span>
      </div>
      
      <Progress value={progresso.percentual} className="h-2" />
      
      {progresso.percentual === 100 && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-medium">Perfil 100% completo!</span>
        </div>
      )}
      
      {progresso.percentual < 100 && (
        <p className="text-xs text-muted-foreground">
          Complete mais {100 - progresso.percentual}% para otimizar sua página
        </p>
      )}
    </div>
  );
}
