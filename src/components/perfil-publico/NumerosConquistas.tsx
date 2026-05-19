import { useEffect, useRef, useState } from "react";
import * as LucideIcons from "lucide-react";

interface Estatistica {
  id: string;
  icone: string;
  numero: string;
  label: string;
  descricao: string;
}

interface NumerosConquistasProps {
  estatisticas: Estatistica[];
  corPrimaria: string;
  onEstatisticaClick?: (estatistica: Estatistica) => void;
}

const useCounterAnimation = (endValue: number, duration: number = 2000, shouldStart: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number | null = null;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(startValue + (endValue - startValue) * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [endValue, duration, shouldStart]);

  return count;
};

export function NumerosConquistas({ estatisticas, corPrimaria, onEstatisticaClick }: NumerosConquistasProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  if (!estatisticas || estatisticas.length === 0) {
    return null;
  }

  // Função para parsear números com prefixos e sufixos complexos
  // Exemplos: "30+", "94%", "6 meses", "NPS 92"
  const parseNumeroEstatistica = (valor: string): { numericValue: number; prefix: string; suffix: string } => {
    // Encontrar o primeiro número na string
    const match = valor.match(/(\D*)(\d+)(\D*)/);
    if (match) {
      return {
        prefix: match[1].trim(),
        numericValue: parseInt(match[2], 10),
        suffix: match[3].trim()
      };
    }
    // Fallback: exibir valor original sem animação
    return { prefix: '', numericValue: 0, suffix: valor };
  };

  // Use layout inline para 4 ou menos itens
  const useInlineLayout = estatisticas.length <= 4;

  return (
    <div 
      ref={sectionRef} 
      className="py-16 relative overflow-hidden"
    >
      {/* Background decorativo com gradiente sutil */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(ellipse at center, ${corPrimaria}, transparent 70%)`
        }}
      />

      {/* Título com fonte elegante */}
      <div className="text-center mb-14 relative">
        <h2 
          className="font-playfair text-4xl md:text-5xl font-bold mb-4" 
          style={{ color: corPrimaria }}
        >
          Conquistas & Resultados
        </h2>
        <div 
          className="w-20 h-1 rounded-full mx-auto mb-6"
          style={{ background: `linear-gradient(to right, ${corPrimaria}, ${corPrimaria}60)` }}
        />
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Experiência comprovada em transformar vidas
        </p>
      </div>
      
      {useInlineLayout ? (
        // Layout inline horizontal elegante
        <div className="relative">
          <div className="flex flex-wrap justify-center items-stretch gap-0">
            {estatisticas.map((stat, index) => {
              const IconComponent = (LucideIcons as any)[stat.icone] || LucideIcons.Award;
              const { numericValue, prefix, suffix } = parseNumeroEstatistica(stat.numero);
              const isLast = index === estatisticas.length - 1;
              
              return (
                <div key={stat.id} className="flex items-stretch">
                  <StatItemInline
                    stat={stat}
                    numericValue={numericValue}
                    prefix={prefix}
                    suffix={suffix}
                    IconComponent={IconComponent}
                    corPrimaria={corPrimaria}
                    hasAnimated={hasAnimated}
                    index={index}
                    onClick={() => onEstatisticaClick?.(stat)}
                  />
                  
                  {/* Separador vertical elegante */}
                  {!isLast && (
                    <div className="hidden md:flex items-center px-8 lg:px-12">
                      <div 
                        className="w-px h-24 opacity-30"
                        style={{ 
                          background: `linear-gradient(to bottom, transparent, ${corPrimaria}, transparent)` 
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Grid layout para muitos itens
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {estatisticas.map((stat, index) => {
            const IconComponent = (LucideIcons as any)[stat.icone] || LucideIcons.Award;
            const { numericValue, prefix, suffix } = parseNumeroEstatistica(stat.numero);
            
            return (
              <StatItemGrid
                key={stat.id}
                stat={stat}
                numericValue={numericValue}
                prefix={prefix}
                suffix={suffix}
                IconComponent={IconComponent}
                corPrimaria={corPrimaria}
                hasAnimated={hasAnimated}
                index={index}
                onClick={() => onEstatisticaClick?.(stat)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface StatItemProps {
  stat: { label: string; descricao: string };
  numericValue: number;
  prefix: string;
  suffix: string;
  IconComponent: any;
  corPrimaria: string;
  hasAnimated: boolean;
  index: number;
  onClick?: () => void;
}

function StatItemInline({ stat, numericValue, prefix, suffix, IconComponent, corPrimaria, hasAnimated, index, onClick }: StatItemProps) {
  const animatedCount = useCounterAnimation(numericValue, 2000, hasAnimated);
  
  // Se não há número válido, exibir o valor original sem animação
  const displayValue = numericValue === 0 && suffix ? suffix : `${prefix}${animatedCount}${suffix}`;

  return (
    <div 
      onClick={onClick}
      className={`text-center px-6 py-4 cursor-pointer group transition-all duration-300 hover:scale-105 ${
        hasAnimated ? 'animate-fade-in' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Ícone pequeno e elegante */}
      <div className="flex justify-center mb-3">
        <div 
          className="p-2.5 rounded-full transition-transform duration-300 group-hover:scale-110" 
          style={{ backgroundColor: `${corPrimaria}10` }}
        >
          <IconComponent 
            className="h-5 w-5" 
            style={{ color: corPrimaria }}
          />
        </div>
      </div>
      
      {/* Número grande e elegante */}
      <div 
        className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-2 tracking-tight"
        style={{ color: corPrimaria }}
      >
        {displayValue}
      </div>
      
      {/* Label */}
      <h3 className="text-base md:text-lg font-semibold mb-1 text-foreground">
        {stat.label}
      </h3>
      
      {/* Descrição menor */}
      <p className="text-sm text-muted-foreground max-w-[180px] mx-auto">
        {stat.descricao}
      </p>
    </div>
  );
}

function StatItemGrid({ stat, numericValue, prefix, suffix, IconComponent, corPrimaria, hasAnimated, index, onClick }: StatItemProps) {
  const animatedCount = useCounterAnimation(numericValue, 2000, hasAnimated);
  
  // Se não há número válido, exibir o valor original sem animação
  const displayValue = numericValue === 0 && suffix ? suffix : `${prefix}${animatedCount}${suffix}`;

  return (
    <div 
      onClick={onClick}
      className={`text-center p-6 rounded-2xl cursor-pointer group transition-all duration-300 hover:shadow-lg border border-border/50 bg-card/50 backdrop-blur-sm ${
        hasAnimated ? 'animate-fade-in' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Ícone */}
      <div className="flex justify-center mb-4">
        <div 
          className="p-3 rounded-xl transition-transform duration-300 group-hover:scale-110" 
          style={{ backgroundColor: `${corPrimaria}10` }}
        >
          <IconComponent 
            className="h-6 w-6" 
            style={{ color: corPrimaria }}
          />
        </div>
      </div>
      
      {/* Número */}
      <div 
        className="font-playfair text-3xl md:text-4xl font-bold mb-2"
        style={{ color: corPrimaria }}
      >
        {displayValue}
      </div>
      
      {/* Label */}
      <h3 className="text-sm font-semibold mb-1">{stat.label}</h3>
      
      {/* Descrição */}
      <p className="text-xs text-muted-foreground">{stat.descricao}</p>
    </div>
  );
}
