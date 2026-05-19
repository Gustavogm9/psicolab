import * as LucideIcons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface Especialidade {
  id: string;
  icone: string;
  titulo: string;
  descricao: string;
  destaque: boolean;
  imagem_url?: string;
}

interface EspecialidadesProps {
  especialidades: Especialidade[];
  corPrimaria: string;
  onEspecialidadeClick?: (especialidade: Especialidade) => void;
}

export function Especialidades({ especialidades, corPrimaria, onEspecialidadeClick }: EspecialidadesProps) {
  if (!especialidades || especialidades.length === 0) {
    return null;
  }

  // Separar destacadas das normais
  const destacadas = especialidades.filter(e => e.destaque);
  const normais = especialidades.filter(e => !e.destaque);

  return (
    <div className="py-8">
      {/* Título com fonte elegante */}
      <div className="text-center mb-14">
        <h2 
          className="font-playfair text-4xl md:text-5xl font-bold mb-4" 
          style={{ color: corPrimaria }}
        >
          Áreas de Atuação
        </h2>
        <div 
          className="w-20 h-1 rounded-full mx-auto mb-6"
          style={{ background: `linear-gradient(to right, ${corPrimaria}, ${corPrimaria}60)` }}
        />
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Atendimento especializado para diferentes perfis e necessidades
        </p>
      </div>

      {/* Cards destacados - layout especial */}
      {destacadas.length > 0 && (
        <div className="mb-10">
          <div className={`grid gap-6 ${destacadas.length === 1 ? 'max-w-lg mx-auto' : destacadas.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {destacadas.map((esp, index) => {
              const IconComponent = (LucideIcons as any)[esp.icone] || LucideIcons.Briefcase;
              
              return (
                <Card 
                  key={esp.id}
                  onClick={() => onEspecialidadeClick?.(esp)}
                  className="group hover:shadow-2xl transition-all duration-500 cursor-pointer animate-fade-in overflow-hidden relative border-0"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    background: esp.imagem_url ? 'transparent' : `linear-gradient(135deg, ${corPrimaria}10, ${corPrimaria}05)`
                  }}
                >
                  {/* Imagem de fundo se existir */}
                  {esp.imagem_url && (
                    <>
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${esp.imagem_url})` }}
                      />
                      <div 
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, ${corPrimaria}e0, ${corPrimaria}90)` }}
                      />
                    </>
                  )}
                  
                  {/* Decorative gradient border (quando sem imagem) */}
                  {!esp.imagem_url && (
                    <>
                      <div 
                        className="absolute inset-0 rounded-lg opacity-60"
                        style={{
                          background: `linear-gradient(135deg, ${corPrimaria}40, ${corPrimaria}10)`,
                          padding: '2px',
                        }}
                      />
                      <div className="absolute inset-[2px] rounded-lg bg-card" />
                    </>
                  )}
                  
                  <CardContent className={`relative pt-8 pb-8 text-center ${esp.imagem_url ? 'text-white' : ''}`}>
                    {/* Sparkle badge */}
                    <div className="absolute top-4 right-4">
                      <div 
                        className="p-2 rounded-full animate-pulse"
                        style={{ backgroundColor: esp.imagem_url ? 'rgba(255,255,255,0.2)' : `${corPrimaria}15` }}
                      >
                        <Sparkles className="w-4 h-4" style={{ color: esp.imagem_url ? 'white' : corPrimaria }} />
                      </div>
                    </div>
                    
                    {/* Blob icon container */}
                    <div className="flex justify-center mb-5">
                      <div 
                        className="p-6 rounded-[40%_60%_55%_45%/55%_45%_55%_45%] group-hover:scale-110 group-hover:rounded-[55%_45%_40%_60%/45%_55%_60%_40%] transition-all duration-500" 
                        style={{ backgroundColor: esp.imagem_url ? 'rgba(255,255,255,0.2)' : `${corPrimaria}15` }}
                      >
                        <IconComponent 
                          className="h-12 w-12" 
                          style={{ color: esp.imagem_url ? 'white' : corPrimaria }}
                        />
                      </div>
                    </div>
                    
                    <h3 className="font-playfair text-2xl font-bold mb-3">{esp.titulo}</h3>
                    <p className={`text-base leading-relaxed ${esp.imagem_url ? 'text-white/90' : 'text-muted-foreground'}`}>
                      {esp.descricao}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Cards normais */}
      {normais.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {normais.map((esp, index) => {
            const IconComponent = (LucideIcons as any)[esp.icone] || LucideIcons.Briefcase;
            
            return (
              <Card 
                key={esp.id}
                onClick={() => onEspecialidadeClick?.(esp)}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer animate-fade-in border-l-4 hover:-translate-y-1 overflow-hidden relative"
                style={{ 
                  borderLeftColor: corPrimaria,
                  animationDelay: `${(destacadas.length + index) * 100}ms`
                }}
              >
                {/* Imagem de fundo sutil se existir */}
                {esp.imagem_url && (
                  <>
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                      style={{ backgroundImage: `url(${esp.imagem_url})` }}
                    />
                  </>
                )}
                
                <CardContent className="pt-6 pb-6 relative">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div 
                      className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0" 
                      style={{ backgroundColor: `${corPrimaria}10` }}
                    >
                      <IconComponent 
                        className="h-6 w-6" 
                        style={{ color: corPrimaria }}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{esp.titulo}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {esp.descricao}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
