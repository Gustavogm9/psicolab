import { Quote } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface Credencial {
  icone?: string;
  label: string;
}

interface SobrePremiumProps {
  perfil: {
    biografia: string | null;
    foto_perfil: string | null;
    titulo_profissional: string | null;
    tema_cor_primaria: string | null;
    tema_cor_secundaria: string | null;
    credenciais?: Credencial[] | null;
  };
}

export const SobrePremium = ({ perfil }: SobrePremiumProps) => {
  const corPrimaria = perfil.tema_cor_primaria || '#4A90A4';
  const corSecundaria = perfil.tema_cor_secundaria || '#6B7280';
  const hasFotoPerfil = !!perfil.foto_perfil;

  // Extrair primeira frase para destaque (citação)
  const biografiaCompleta = perfil.biografia || '';
  const primeiraFrase = biografiaCompleta.split(/[.!?]/)[0] + '.';
  const restoBiografia = biografiaCompleta.substring(primeiraFrase.length).trim();

  // Usar credenciais do perfil ou não exibir nenhuma (removido hardcoded)
  const credenciais: Credencial[] = perfil.credenciais || [];

  if (hasFotoPerfil) {
    // Layout com foto lateral
    return (
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Coluna da Foto - 2/5 */}
          <div className="lg:col-span-2 relative flex justify-center">
            <div className="relative">
              {/* Moldura decorativa externa */}
              <div 
                className="absolute -inset-4 rounded-2xl opacity-20"
                style={{ 
                  background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})`,
                }}
              />
              
              {/* Borda decorativa com padrão */}
              <div 
                className="absolute -inset-2 rounded-xl border-2"
                style={{ borderColor: `${corPrimaria}25` }}
              />
              
              {/* Container da foto */}
              <div className="relative w-72 h-80 sm:w-80 sm:h-96 lg:w-full lg:h-[480px] rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src={perfil.foto_perfil!} 
                  alt={perfil.titulo_profissional || "Sobre mim"}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay gradiente sutil */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: `linear-gradient(135deg, ${corPrimaria}, transparent)`
                  }}
                />
              </div>

              {/* Elemento decorativo - Aspas */}
              <div 
                className="absolute -top-6 -left-6 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: corPrimaria }}
              >
                <Quote className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Coluna do Texto - 3/5 */}
          <div className="lg:col-span-3 space-y-6">
            {/* Título com fonte elegante */}
            <div className="space-y-4">
              <h2 
                className="font-playfair text-4xl md:text-5xl font-bold"
                style={{ color: corPrimaria }}
              >
                Sobre Mim
              </h2>
              <div 
                className="w-20 h-1 rounded-full"
                style={{ background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})` }}
              />
            </div>

            {/* Citação em destaque */}
            <blockquote className="relative pl-6 border-l-4" style={{ borderColor: corPrimaria }}>
              <p 
                className="font-playfair text-xl md:text-2xl italic leading-relaxed"
                style={{ color: `${corPrimaria}dd` }}
              >
                "{primeiraFrase}"
              </p>
            </blockquote>

            {/* Texto principal */}
            {restoBiografia && (
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {restoBiografia}
              </p>
            )}

            {/* Badges de credenciais - só exibe se houver */}
            {credenciais.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-4">
                {credenciais.map((cred, index) => {
                  const IconComponent = cred.icone 
                    ? (LucideIcons as any)[cred.icone] || LucideIcons.Award
                    : LucideIcons.Award;
                  return (
                    <div 
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 hover:shadow-md"
                      style={{ 
                        borderColor: `${corPrimaria}30`,
                        backgroundColor: `${corPrimaria}05`
                      }}
                    >
                      <IconComponent 
                        className="w-4 h-4" 
                        style={{ color: corPrimaria }}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {cred.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Layout sem foto - texto centralizado com aspas decorativas
  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Título com fonte elegante */}
      <div className="space-y-4 mb-10">
        <h2 
          className="font-playfair text-4xl md:text-5xl font-bold"
          style={{ color: corPrimaria }}
        >
          Sobre Mim
        </h2>
        <div 
          className="w-20 h-1 rounded-full mx-auto"
          style={{ background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})` }}
        />
      </div>

      {/* Container com aspas decorativas */}
      <div className="relative">
        {/* Aspa de abertura */}
        <Quote 
          className="absolute -top-4 -left-4 w-12 h-12 opacity-20 rotate-180"
          style={{ color: corPrimaria }}
        />
        
        {/* Aspa de fechamento */}
        <Quote 
          className="absolute -bottom-4 -right-4 w-12 h-12 opacity-20"
          style={{ color: corPrimaria }}
        />

        {/* Citação em destaque */}
        <blockquote className="mb-6">
          <p 
            className="font-playfair text-2xl md:text-3xl italic leading-relaxed px-8"
            style={{ color: `${corPrimaria}dd` }}
          >
            "{primeiraFrase}"
          </p>
        </blockquote>

        {/* Texto principal */}
        {restoBiografia && (
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed whitespace-pre-wrap px-4">
            {restoBiografia}
          </p>
        )}
      </div>

      {/* Badges de credenciais - só exibe se houver */}
      {credenciais.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 pt-8">
          {credenciais.map((cred, index) => {
            const IconComponent = cred.icone 
              ? (LucideIcons as any)[cred.icone] || LucideIcons.Award
              : LucideIcons.Award;
            return (
              <div 
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 hover:shadow-md"
                style={{ 
                  borderColor: `${corPrimaria}30`,
                  backgroundColor: `${corPrimaria}05`
                }}
              >
                <IconComponent 
                  className="w-4 h-4" 
                  style={{ color: corPrimaria }}
                />
                <span className="text-sm font-medium text-foreground">
                  {cred.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
