import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Video, Monitor, Briefcase, ArrowRight, Sparkles } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { getContrastColor } from "@/lib/color-utils";

interface Servico {
  id: string;
  titulo: string;
  descricao: string | null;
  preco: number | null;
  duracao: number | null;
  modalidade: string | null;
  icone?: string;
  imagem_url?: string | null;
}

interface ServicosListaProps {
  servicos: Servico[];
  corPrimaria: string;
  corSecundaria: string;
  whatsapp?: string | null;
  onCtaClick?: () => void;
}

export function ServicosLista({ servicos, corPrimaria, corSecundaria, whatsapp, onCtaClick }: ServicosListaProps) {
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

  if (!servicos || servicos.length === 0) {
    return null;
  }

  // Determinar se o primeiro serviço deve ter destaque
  const temDestaque = servicos.length >= 3;

  return (
    <div className="py-8">
      {/* Título com fonte elegante */}
      <div className="text-center mb-14">
        <h2 
          className="font-playfair text-4xl md:text-5xl font-bold mb-4" 
          style={{ color: corPrimaria }}
        >
          Serviços
        </h2>
        <div 
          className="w-20 h-1 rounded-full mx-auto mb-6"
          style={{ background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria || corPrimaria})` }}
        />
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Soluções personalizadas para suas necessidades
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {servicos.map((servico, index) => {
          const IconComponent = servico.icone 
            ? (LucideIcons as any)[servico.icone] || Briefcase
            : Briefcase;
          
          const isDestaque = temDestaque && index === 0;

          return (
            <Card
              key={servico.id}
              className={`group hover:shadow-2xl transition-all duration-500 flex flex-col animate-fade-in overflow-hidden relative ${
                isDestaque ? 'md:col-span-2 lg:col-span-1 lg:row-span-1' : ''
              }`}
              style={{ 
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Destaque badge */}
              {isDestaque && (
                <div 
                  className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg"
                  style={{ 
                    backgroundColor: corPrimaria,
                    color: getContrastColor(corPrimaria)
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  Mais Procurado
                </div>
              )}

              {/* Icon/Image Header with overlay effect */}
              <div 
                className="h-40 flex items-center justify-center relative overflow-hidden"
                style={{ 
                  background: servico.imagem_url 
                    ? `url(${servico.imagem_url}) center/cover` 
                    : `linear-gradient(135deg, ${corPrimaria}12, ${corSecundaria || corPrimaria}08)`
                }}
              >
                {!servico.imagem_url && (
                  <>
                    {/* Decorative circles */}
                    <div 
                      className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20"
                      style={{ backgroundColor: corPrimaria }}
                    />
                    <div 
                      className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-10"
                      style={{ backgroundColor: corSecundaria || corPrimaria }}
                    />
                    
                    <div 
                      className="relative p-6 rounded-2xl group-hover:scale-110 transition-all duration-500 shadow-lg" 
                      style={{ backgroundColor: `${corPrimaria}15`, backdropFilter: 'blur(4px)' }}
                    >
                      <IconComponent 
                        className="h-12 w-12" 
                        style={{ color: corPrimaria }}
                      />
                    </div>
                  </>
                )}
                
                {/* Overlay gradient */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${corPrimaria}20, transparent)`
                  }}
                />
              </div>

              <CardContent className="pt-6 pb-6 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="font-playfair text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {servico.titulo}
                </h3>

                {/* Description */}
                {servico.descricao && (
                  <p className="text-muted-foreground mb-4 flex-1 leading-relaxed">
                    {servico.descricao}
                  </p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {servico.duracao && (
                    <Badge 
                      variant="secondary" 
                      className="flex items-center gap-1.5 text-sm px-3 py-1"
                      style={{ backgroundColor: `${corPrimaria}08`, color: corPrimaria }}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {formatarDuracao(servico.duracao)}
                    </Badge>
                  )}
                  {servico.modalidade && (
                    <Badge 
                      variant="outline" 
                      className="flex items-center gap-1.5 text-sm px-3 py-1"
                    >
                      {getModalidadeIcon(servico.modalidade)}
                      {getModalidadeLabel(servico.modalidade)}
                    </Badge>
                  )}
                </div>

                {/* Price with premium design */}
                {servico.preco && (
                  <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: `${corPrimaria}05` }}>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                      Investimento
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg text-muted-foreground">R$</span>
                      <span 
                        className="font-playfair text-4xl font-bold"
                        style={{ color: corPrimaria }}
                      >
                        {formatarPreco(servico.preco).replace('R$', '').trim()}
                      </span>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <Button 
                  size="lg"
                  className="w-full group/btn shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ 
                    backgroundColor: corPrimaria,
                    borderColor: corPrimaria,
                    color: getContrastColor(corPrimaria || '#000000')
                  }}
                  onClick={() => {
                    onCtaClick?.();
                    if (whatsapp) {
                      const numero = whatsapp.replace(/\D/g, '');
                      const mensagem = encodeURIComponent(
                        `Olá! Vi seu perfil e tenho interesse no serviço "${servico.titulo}". Podemos conversar?`
                      );
                      window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank');
                    } else {
                      const element = document.querySelector('#contato');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <span>Quero este serviço</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
