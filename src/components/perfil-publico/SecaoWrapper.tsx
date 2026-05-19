import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SecaoWrapperProps {
  children: ReactNode;
  bg?: 'white' | 'muted' | 'gradient' | 'transparent';
  className?: string;
  id?: string;
  corPrimaria?: string;
  corSecundaria?: string;
}

export function SecaoWrapper({ children, bg = 'white', className, id, corPrimaria, corSecundaria }: SecaoWrapperProps) {
  const bgClasses = {
    white: 'bg-white',
    muted: 'bg-muted/30',
    gradient: '', // Usar inline style quando tiver cores dinâmicas
    transparent: 'bg-transparent'
  };

  // Style inline para gradient com cores dinâmicas do perfil
  const gradientStyle = bg === 'gradient' && corPrimaria && corSecundaria 
    ? { background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})` }
    : {};

  // Classe fallback para gradient sem cores dinâmicas
  const gradientClass = bg === 'gradient' && (!corPrimaria || !corSecundaria) 
    ? 'bg-gradient-to-br from-primary to-secondary' 
    : bgClasses[bg];

  return (
    <section 
      id={id}
      className={cn(
        'py-16 md:py-20',
        gradientClass,
        'transition-all duration-500',
        className
      )}
      style={gradientStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
