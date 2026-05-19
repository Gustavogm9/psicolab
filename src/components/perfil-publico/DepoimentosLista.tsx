import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

interface Depoimento {
  id: string;
  nome: string;
  cargo: string | null;
  empresa: string | null;
  foto: string | null;
  texto: string;
  rating: number | null;
  data: string | null;
}

interface DepoimentosListaProps {
  depoimentos: Depoimento[];
  corPrimaria: string;
  corSecundaria: string;
}

export function DepoimentosLista({ depoimentos, corPrimaria, corSecundaria }: DepoimentosListaProps) {
  if (!depoimentos || depoimentos.length === 0) {
    return null;
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'fill-current' : 'stroke-current opacity-30'}`}
            style={{ color: i < rating ? '#FBBF24' : '#d1d5db' }}
          />
        ))}
      </div>
    );
  };

  // Destaque para o primeiro depoimento se houver 3+
  const temDestaque = depoimentos.length >= 3;
  const depoimentoDestaque = temDestaque ? depoimentos[0] : null;
  const outrosDepoimentos = temDestaque ? depoimentos.slice(1) : depoimentos;

  return (
    <div className="py-8">
      {/* Título com fonte elegante */}
      <div className="text-center mb-14">
        <h2 
          className="font-playfair text-4xl md:text-5xl font-bold mb-4" 
          style={{ color: corPrimaria }}
        >
          O Que Dizem Meus Clientes
        </h2>
        <div 
          className="w-20 h-1 rounded-full mx-auto mb-6"
          style={{ background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria || corPrimaria})` }}
        />
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Histórias reais de transformação e sucesso
        </p>
      </div>

      {/* Depoimento em destaque (estilo magazine) */}
      {depoimentoDestaque && (
        <div className="mb-12">
          <Card className="overflow-hidden border-0 shadow-2xl animate-fade-in">
            <div 
              className="relative p-8 md:p-12"
              style={{
                background: `linear-gradient(135deg, ${corPrimaria}08, ${corSecundaria || corPrimaria}05)`
              }}
            >
              {/* Aspas gigantes decorativas */}
              <Quote 
                className="absolute top-6 left-6 w-20 h-20 md:w-28 md:h-28 opacity-10"
                style={{ color: corPrimaria }}
              />
              
              <div className="relative grid md:grid-cols-3 gap-8 items-center">
                {/* Avatar grande */}
                <div className="flex flex-col items-center md:items-start">
                  <div className="relative">
                    <div 
                      className="absolute -inset-2 rounded-full opacity-30 blur-sm"
                      style={{ background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria || corPrimaria})` }}
                    />
                    <Avatar className="relative w-32 h-32 md:w-40 md:h-40 border-4 border-white shadow-xl">
                      {depoimentoDestaque.foto && (
                        <AvatarImage 
                          src={depoimentoDestaque.foto} 
                          alt={`Foto de ${depoimentoDestaque.nome}`} 
                          loading="lazy" 
                        />
                      )}
                      <AvatarFallback 
                        className="text-4xl font-bold"
                        style={{ backgroundColor: `${corPrimaria}20`, color: corPrimaria }}
                      >
                        {depoimentoDestaque.nome[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="mt-4 text-center md:text-left">
                    <h3 className="font-playfair text-xl font-bold">{depoimentoDestaque.nome}</h3>
                    {depoimentoDestaque.cargo && (
                      <p className="text-sm text-muted-foreground">{depoimentoDestaque.cargo}</p>
                    )}
                    {depoimentoDestaque.empresa && (
                      <Badge 
                        variant="outline" 
                        className="mt-2 text-xs"
                        style={{ borderColor: corPrimaria, color: corPrimaria }}
                      >
                        {depoimentoDestaque.empresa}
                      </Badge>
                    )}
                    {depoimentoDestaque.rating && (
                      <div className="mt-3">
                        {renderStars(depoimentoDestaque.rating)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Texto do depoimento */}
                <div className="md:col-span-2">
                  <blockquote className="relative">
                    <p className="font-playfair text-xl md:text-2xl lg:text-3xl leading-relaxed italic text-foreground">
                      "{depoimentoDestaque.texto}"
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Grid de depoimentos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outrosDepoimentos.map((depoimento, index) => (
          <Card
            key={depoimento.id}
            className="group hover:shadow-xl transition-all duration-300 animate-fade-in overflow-hidden"
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <CardContent className="pt-6 pb-6 relative">
              {/* Aspas decorativas menores */}
              <Quote 
                className="absolute top-4 right-4 w-10 h-10 opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ color: corPrimaria }}
              />
              
              {/* Header com Avatar */}
              <div className="flex items-start gap-4 mb-5">
                <Avatar className="w-14 h-14 border-2 shadow-md flex-shrink-0" style={{ borderColor: `${corPrimaria}20` }}>
                  {depoimento.foto && (
                    <AvatarImage 
                      src={depoimento.foto} 
                      alt={`Foto de ${depoimento.nome}`} 
                      loading="lazy" 
                    />
                  )}
                  <AvatarFallback 
                    className="text-lg font-bold"
                    style={{ backgroundColor: `${corPrimaria}15`, color: corPrimaria }}
                  >
                    {depoimento.nome[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{depoimento.nome}</h3>
                  {depoimento.cargo && (
                    <p className="text-sm text-muted-foreground truncate">{depoimento.cargo}</p>
                  )}
                  {depoimento.empresa && (
                    <Badge 
                      variant="outline" 
                      className="mt-1 text-xs"
                      style={{ borderColor: `${corPrimaria}40`, color: corPrimaria }}
                    >
                      {depoimento.empresa}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Rating */}
              {depoimento.rating && (
                <div className="mb-4">
                  {renderStars(depoimento.rating)}
                </div>
              )}

              {/* Texto */}
              <p className="text-muted-foreground leading-relaxed italic text-sm">
                "{depoimento.texto}"
              </p>
              
              {/* Linha decorativa no bottom */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria || corPrimaria})` }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
