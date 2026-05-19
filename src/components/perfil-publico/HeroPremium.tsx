import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Award, Star, CheckCircle } from "lucide-react";
import { getContrastColor } from "@/lib/color-utils";

interface HeroPremiumProps {
  perfil: {
    id: string;
    titulo_hero: string | null;
    subtitulo_hero: string | null;
    cta_hero_texto: string | null;
    cta_hero_link: string | null;
    imagem_hero_url: string | null;
    foto_perfil: string | null;
    titulo_profissional: string | null;
    tema_cor_primaria: string | null;
    tema_cor_secundaria: string | null;
  };
  onCtaClick?: () => void;
}

export const HeroPremium = ({ perfil, onCtaClick }: HeroPremiumProps) => {
  const corPrimaria = perfil.tema_cor_primaria || '#4A90A4';
  const corSecundaria = perfil.tema_cor_secundaria || '#6B7280';
  const hasFotoPerfil = !!perfil.foto_perfil;

  // Usar layout split quando há foto de perfil e não há imagem hero
  const useSplitLayout = hasFotoPerfil && !perfil.imagem_hero_url;

  const handleCtaClick = () => {
    if (perfil.cta_hero_link) {
      if (perfil.cta_hero_link.startsWith('#')) {
        const element = document.querySelector(perfil.cta_hero_link);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else if (perfil.cta_hero_link.startsWith('http://') || perfil.cta_hero_link.startsWith('https://')) {
        window.open(perfil.cta_hero_link, '_blank', 'noopener,noreferrer');
      } else {
        // Caminho relativo — rolar para âncora equivalente se possível
        const anchorId = perfil.cta_hero_link.replace(/^\//, '');
        const element = document.getElementById(anchorId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = perfil.cta_hero_link;
        }
      }
    }
    onCtaClick?.();
  };

  const scrollToContent = () => {
    window.scrollBy({ top: window.innerHeight - 100, behavior: 'smooth' });
  };

  if (useSplitLayout) {
    // Layout Split: Foto à esquerda, conteúdo à direita
    return (
      <header className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background com gradiente sutil */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${corPrimaria}08 0%, ${corSecundaria}05 50%, ${corPrimaria}03 100%)`,
          }}
        />

        {/* Elementos decorativos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Círculos flutuantes com blur */}
          <div
            className="absolute top-20 right-20 w-72 h-72 rounded-full opacity-20 blur-3xl animate-float"
            style={{ backgroundColor: corPrimaria }}
          />
          <div
            className="absolute bottom-20 left-10 w-96 h-96 rounded-full opacity-10 blur-3xl animate-float"
            style={{ backgroundColor: corSecundaria, animationDelay: '1s' }}
          />
          <div
            className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full opacity-15 blur-2xl animate-float"
            style={{ backgroundColor: corPrimaria, animationDelay: '2s' }}
          />

          {/* Linhas decorativas sutis */}
          <div
            className="absolute top-0 right-0 w-px h-full opacity-10"
            style={{ background: `linear-gradient(to bottom, transparent, ${corPrimaria}, transparent)` }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Coluna da Foto */}
            <div className="relative order-2 lg:order-1 flex justify-center lg:justify-start">
              <div className="relative">
                {/* Moldura decorativa */}
                <div
                  className="absolute -inset-4 rounded-[2rem] opacity-20 blur-sm"
                  style={{
                    background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})`
                  }}
                />
                <div
                  className="absolute -inset-3 rounded-[1.8rem] border-2"
                  style={{ borderColor: `${corPrimaria}30` }}
                />

                {/* Foto principal */}
                <div className="relative w-80 h-96 lg:w-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={perfil.foto_perfil!}
                    alt={perfil.titulo_profissional || "Profissional"}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay gradiente sutil no bottom */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-32"
                    style={{
                      background: `linear-gradient(to top, ${corPrimaria}20, transparent)`
                    }}
                  />
                </div>

                {/* Badge de credibilidade flutuante */}
                <div
                  className="absolute -right-4 top-8 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl border border-border/50 animate-fade-up"
                  style={{ animationDelay: '0.6s' }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1.5 rounded-full"
                      style={{ backgroundColor: `${corPrimaria}15` }}
                    >
                      <Award className="w-4 h-4" style={{ color: corPrimaria }} />
                    </div>
                    <span className="text-sm font-medium text-foreground">CRP Ativo</span>
                  </div>
                </div>

                {/* Badge de verificado */}
                <div
                  className="absolute -left-4 bottom-20 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl border border-border/50 animate-fade-up"
                  style={{ animationDelay: '0.8s' }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-foreground">Perfil Verificado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna do Conteúdo */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              {/* Badge de título profissional */}
              {perfil.titulo_profissional && (
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-up"
                  style={{
                    backgroundColor: `${corPrimaria}10`,
                    color: corPrimaria
                  }}
                >
                  <Star className="w-4 h-4" />
                  <span>{perfil.titulo_profissional}</span>
                </div>
              )}

              {/* Título principal com fonte elegante */}
              <h1
                className="font-playfair text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight animate-fade-up"
                style={{
                  color: corPrimaria,
                  animationDelay: '0.1s'
                }}
              >
                {perfil.titulo_hero}
              </h1>

              {/* Linha decorativa */}
              <div
                className="w-24 h-1 rounded-full mb-6 mx-auto lg:mx-0 animate-fade-up"
                style={{
                  background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})`,
                  animationDelay: '0.2s'
                }}
              />

              {/* Subtítulo */}
              {perfil.subtitulo_hero && (
                <p
                  className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-up"
                  style={{ animationDelay: '0.3s' }}
                >
                  {perfil.subtitulo_hero}
                </p>
              )}

              {/* CTA Button */}
              {perfil.cta_hero_texto && perfil.cta_hero_link && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: '0.4s' }}>
                  <Button
                    size="lg"
                    onClick={handleCtaClick}
                    className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: corPrimaria,
                      color: getContrastColor(corPrimaria)
                    }}
                  >
                    {perfil.cta_hero_texto}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-up cursor-pointer"
          style={{ animationDelay: '1s' }}
          aria-label="Rolar para baixo"
        >
          <span className="text-sm font-medium">Saiba mais</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </header>
    );
  }

  // Layout Full-width (com imagem de fundo)
  return (
    <header
      className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden"
      style={{
        background: perfil.imagem_hero_url
          ? `url(${perfil.imagem_hero_url}) center/cover`
          : `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})`,
      }}
    >
      {/* Overlay com gradiente elegante */}
      <div
        className="absolute inset-0"
        style={{
          background: perfil.imagem_hero_url
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)'
            : 'transparent'
        }}
      />

      {/* Elementos decorativos para hero sem imagem */}
      {!perfil.imagem_hero_url && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-white/5 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
      )}

      <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
        {/* Badge de credibilidade */}
        {perfil.titulo_profissional && (
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8 animate-fade-up bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <Award className="w-4 h-4" />
            <span>{perfil.titulo_profissional}</span>
          </div>
        )}

        {/* Título principal com fonte elegante */}
        <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {perfil.titulo_hero}
        </h1>

        {/* Linha decorativa */}
        <div
          className="w-32 h-1 bg-white/60 rounded-full mx-auto mb-8 animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        />

        {/* Subtítulo */}
        {perfil.subtitulo_hero && (
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {perfil.subtitulo_hero}
          </p>
        )}

        {/* CTA Button */}
        {perfil.cta_hero_texto && perfil.cta_hero_link && (
          <Button
            size="lg"
            onClick={handleCtaClick}
            className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-6 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-up"
            style={{ animationDelay: '0.4s' }}
          >
            {perfil.cta_hero_texto}
          </Button>
        )}
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors animate-fade-up cursor-pointer"
        style={{ animationDelay: '0.8s' }}
        aria-label="Rolar para baixo"
      >
        <span className="text-sm font-medium">Saiba mais</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>
    </header>
  );
};
