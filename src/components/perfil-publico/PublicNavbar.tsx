import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicNavbarProps {
  perfilNome: string;
  fotoPerfil?: string | null;
  ctaTexto?: string;
  ctaLink?: string;
  menuItems?: Array<{ id: string; nome: string; link: string }>;
  corPrimaria: string;
  onCtaClick?: () => void;
}

export function PublicNavbar({
  perfilNome,
  fotoPerfil,
  ctaTexto = "Agendar Consulta",
  ctaLink = "#contato",
  menuItems = [
    { id: "sobre", nome: "Sobre", link: "#sobre" },
    { id: "servicos", nome: "Serviços", link: "#servicos" },
    { id: "depoimentos", nome: "Depoimentos", link: "#depoimentos" },
    { id: "contato", nome: "Contato", link: "#contato" }
  ],
  corPrimaria,
  onCtaClick
}: PublicNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (link: string) => {
    setIsMobileMenuOpen(false);

    if (link.startsWith('#')) {
      const element = document.querySelector(link);
      if (element) {
        const navbarHeight = 80;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      // Caminho relativo — tenta achar âncora equivalente
      const anchorId = link.replace(/^\//, '');
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = link;
      }
    }
  };

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    }
    handleNavClick(ctaLink);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo/Nome */}
          <div className="flex items-center gap-3">
            {fotoPerfil && (
              <img
                src={fotoPerfil}
                alt={`Foto de perfil de ${perfilNome}`}
                loading="lazy"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            )}
            <span
              className={cn(
                "font-bold text-lg md:text-xl transition-colors",
                isScrolled ? "text-foreground" : "text-white"
              )}
            >
              {perfilNome}
            </span>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.link)}
                className={cn(
                  "text-sm font-medium transition-colors hover:opacity-80",
                  isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/90 hover:text-white"
                )}
              >
                {item.nome}
              </button>
            ))}
            <Button
              onClick={handleCtaClick}
              style={{ backgroundColor: corPrimaria }}
              className="text-white hover:opacity-90"
            >
              {ctaTexto}
            </Button>
          </div>

          {/* Menu Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "md:hidden p-2",
              isScrolled ? "text-foreground" : "text-white"
            )}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 animate-fade-in">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.link)}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
              >
                {item.nome}
              </button>
            ))}
            <Button
              onClick={handleCtaClick}
              style={{ backgroundColor: corPrimaria }}
              className="w-full text-white"
            >
              {ctaTexto}
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
