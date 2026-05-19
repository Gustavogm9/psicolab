import * as LucideIcons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PassoTrabalho {
  id: string;
  icone: string;
  titulo: string;
  descricao: string;
  imagem_url?: string;
}

interface ComoFuncionaProps {
  passos: PassoTrabalho[];
  corPrimaria: string;
  corSecundaria: string;
  onPassoView?: (passo: PassoTrabalho, index: number) => void;
}

export function ComoFunciona({ passos, corPrimaria, corSecundaria, onPassoView }: ComoFuncionaProps) {
  if (!passos || passos.length === 0) {
    return null;
  }

  // Verificar se algum passo tem imagem
  const temImagens = passos.some(p => p.imagem_url);

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: corPrimaria }}>
          Como Funciona
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Um processo simples e transparente para sua jornada de transformação
        </p>
      </div>

      {/* Layout com imagens - mais visual */}
      {temImagens ? (
        <div className="space-y-12">
          {passos.map((passo, index) => {
            const IconComponent = (LucideIcons as any)[passo.icone] || LucideIcons.CheckCircle;
            const isEven = index % 2 === 0;
            
            return (
              <div 
                key={passo.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}>
                  {/* Imagem */}
                  <div className="w-full lg:w-1/2">
                    {passo.imagem_url ? (
                      <div 
                        className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
                        onClick={() => onPassoView?.(passo, index)}
                      >
                        <img
                          src={passo.imagem_url}
                          alt={passo.titulo}
                          className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div 
                          className="absolute inset-0 opacity-20"
                          style={{ background: `linear-gradient(135deg, ${corPrimaria}, transparent)` }}
                        />
                        {/* Número do passo sobreposto */}
                        <div 
                          className="absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})` }}
                        >
                          {index + 1}
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="w-full h-64 md:h-80 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${corPrimaria}10` }}
                      >
                        <IconComponent 
                          className="h-24 w-24 opacity-30" 
                          style={{ color: corPrimaria }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className={`w-full lg:w-1/2 ${isEven ? 'lg:pl-8' : 'lg:pr-8'}`}>
                    <div className="flex items-start gap-4">
                      <div 
                        className="p-4 rounded-2xl flex-shrink-0" 
                        style={{ backgroundColor: `${corPrimaria}15` }}
                      >
                        <IconComponent 
                          className="h-8 w-8" 
                          style={{ color: corPrimaria }}
                        />
                      </div>
                      <div>
                        <span 
                          className="text-sm font-semibold uppercase tracking-wider"
                          style={{ color: corPrimaria }}
                        >
                          Etapa {index + 1}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-bold mt-1 mb-4">{passo.titulo}</h3>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          {passo.descricao}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linha conectora */}
                {index < passos.length - 1 && (
                  <div className="flex justify-center py-4">
                    <div 
                      className="w-0.5 h-12"
                      style={{ 
                        background: `linear-gradient(180deg, ${corPrimaria}40, ${corPrimaria}10)`
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Layout sem imagens - cards em grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {passos.map((passo, index) => {
            const IconComponent = (LucideIcons as any)[passo.icone] || LucideIcons.CheckCircle;
            
            return (
              <div key={passo.id} className="relative animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                {/* Número do Passo */}
                <div 
                  className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl text-white shadow-lg z-10"
                  style={{ 
                    background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})`
                  }}
                >
                  {index + 1}
                </div>

                <Card 
                  className="h-full hover:shadow-lg transition-all duration-300 pt-6 cursor-pointer"
                  onClick={() => onPassoView?.(passo, index)}
                >
                  <CardContent className="pt-8">
                    <div className="flex justify-center mb-4">
                      <div 
                        className="p-4 rounded-full" 
                        style={{ backgroundColor: `${corPrimaria}15` }}
                      >
                        <IconComponent 
                          className="h-8 w-8" 
                          style={{ color: corPrimaria }}
                        />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-center">{passo.titulo}</h3>
                    <p className="text-muted-foreground text-center text-sm leading-relaxed">
                      {passo.descricao}
                    </p>
                  </CardContent>
                </Card>

                {/* Linha conectora (apenas até o penúltimo) */}
                {index < passos.length - 1 && (
                  <div 
                    className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/40 to-transparent"
                    style={{ 
                      background: `linear-gradient(90deg, ${corPrimaria}40, transparent)`
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
