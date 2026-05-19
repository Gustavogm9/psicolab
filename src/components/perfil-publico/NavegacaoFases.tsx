import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Rocket,
  Palette,
  Sparkles,
  User,
  Briefcase,
  Image,
  Star,
  Zap,
  HelpCircle,
  Award,
  FileQuestion,
  GripVertical,
  Globe,
  ExternalLink,
  BarChart3,
  CheckCircle2,
  Circle,
  TrendingUp,
  ListOrdered,
  Menu,
  Mail
} from "lucide-react";

interface Secao {
  id: string;
  nome: string;
  icon: any;
  completo?: boolean;
}

interface Fase {
  id: string;
  nome: string;
  descricao: string;
  secoes: Secao[];
}

interface NavegacaoFasesProps {
  faseAtual: string;
  secaoAtual: string;
  onSecaoChange: (secao: string) => void;
  progressoPorFase: Record<string, number>;
}

const FASES: Fase[] = [
  {
    id: "fase-1",
    nome: "Configuração Inicial",
    descricao: "O essencial para começar",
    secoes: [
      { id: "inicio", nome: "Início & Status", icon: Rocket },
      { id: "identidade", nome: "Identidade Visual", icon: Palette },
    ]
  },
  {
    id: "fase-2",
    nome: "Construir Conteúdo",
    descricao: "Seções principais",
    secoes: [
      { id: "hero", nome: "Hero & Sobre Mim", icon: Sparkles },
      { id: "estatisticas", nome: "Números & Conquistas", icon: TrendingUp },
      { id: "processo", nome: "Como Funciona", icon: ListOrdered },
      { id: "especialidades", nome: "Especialidades", icon: Sparkles },
      { id: "servicos", nome: "Serviços", icon: Briefcase },
      { id: "portfolio", nome: "Portfólio & Cases", icon: Image },
      { id: "prova-social", nome: "Prova Social", icon: Star },
    ]
  },
  {
    id: "fase-3",
    nome: "Otimizar Conversão",
    descricao: "Maximizar captação",
    secoes: [
      { id: "ctas", nome: "CTAs & Conversão", icon: Zap },
      { id: "beneficios-faq", nome: "FAQ & Benefícios", icon: HelpCircle },
      { id: "diagnosticos", nome: "Diagnósticos", icon: FileQuestion },
    ]
  },
  {
    id: "fase-4",
    nome: "Avançado",
    descricao: "SEO, Analytics & Email",
    secoes: [
      { id: "navbar-footer", nome: "Navegação & Rodapé", icon: Menu },
      { id: "layout", nome: "Layout & Organização", icon: GripVertical },
      { id: "seo-dominio", nome: "SEO & Domínio", icon: Globe },
      { id: "rastreamento", nome: "Rastreamento & Analytics", icon: BarChart3 },
      { id: "email", nome: "Email & Envios", icon: Mail },
      { id: "analytics", nome: "Análise de Performance", icon: TrendingUp },
    ]
  }
];

export function NavegacaoFases({
  faseAtual,
  secaoAtual,
  onSecaoChange,
  progressoPorFase
}: NavegacaoFasesProps) {
  const getFaseSecao = (secaoId: string): string => {
    for (const fase of FASES) {
      if (fase.secoes.some(s => s.id === secaoId)) {
        return fase.id;
      }
    }
    return "fase-1";
  };

  const faseAtualCalculada = getFaseSecao(secaoAtual);

  return (
    <div className="space-y-1">
      {FASES.map((fase) => {
        const isFaseAtual = fase.id === faseAtualCalculada;
        const progresso = progressoPorFase[fase.id] || 0;

        return (
          <div key={fase.id} className="space-y-1">
            <div className={cn(
              "px-3 py-2 rounded-md transition-colors",
              isFaseAtual ? "bg-accent" : "hover:bg-accent/50"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{fase.nome}</p>
                  <p className="text-xs text-muted-foreground">{fase.descricao}</p>
                </div>
                <Badge
                  variant={progresso === 100 ? "default" : "secondary"}
                  className="ml-2 h-5"
                >
                  {progresso}%
                </Badge>
              </div>
            </div>

            {/* Mostrar seções se for a fase atual ou se já tiver progresso */}
            {(isFaseAtual || progresso > 0) && (
              <div className="ml-3 space-y-0.5 border-l-2 border-border pl-3">
                {fase.secoes.map((secao) => {
                  const Icon = secao.icon;
                  const isSecaoAtual = secao.id === secaoAtual;

                  return (
                    <button
                      key={secao.id}
                      onClick={() => onSecaoChange(secao.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all",
                        isSecaoAtual
                          ? "bg-primary text-primary-foreground font-medium shadow-sm"
                          : "hover:bg-accent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{secao.nome}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { FASES };
