import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "Como funciona", href: "como-funciona" },
    { label: "Recursos", href: "recursos" },
    { label: "Para Empresas", href: "para-empresas" },
    { label: "FAQ", href: "faq" },
  ];

  return (
    <header 
      className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'top-4 max-w-5xl mx-auto px-4' 
          : 'top-0 w-full px-0'
      }`}
    >
      <nav 
        className={`transition-all duration-500 ease-in-out ${
          isScrolled 
            ? 'glass-premium rounded-full border border-white/20 dark:border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] bg-background/50 backdrop-blur-xl px-6 md:px-8 py-2' 
            : 'bg-transparent border-b border-transparent py-4 md:py-6 px-4 md:px-8'
        }`}
      >
        {/* Estilo local para o blur e bordas reflexivas */}
        <style dangerouslySetInnerHTML={{__html: `
          .glass-premium {
            background: rgba(255, 255, 255, 0.45);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .dark .glass-premium {
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
        `}} />

        <div className="flex items-center justify-between h-12 md:h-14">
          
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight transition-transform hover:scale-102">
            <div className="h-8.5 w-8.5 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-base shadow-md shadow-primary/10">
              M
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">MenteMetrics</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-y-[-1px] active:translate-y-[0px]"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3.5">
            <Button variant="ghost" asChild className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all duration-300">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-accent text-white rounded-full hover:opacity-95 shadow-md shadow-primary/5 transition-all duration-300">
              <Link to="/login">
                Começar
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full hover:bg-muted/30"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 py-4 border-t border-border/20 animate-fade-in space-y-3">
            <div className="flex flex-col gap-3.5">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="text-left px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl transition-all duration-300"
                >
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 px-4 pt-3 border-t border-border/10">
                <Button variant="outline" asChild className="w-full rounded-xl">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild className="w-full bg-gradient-to-r from-primary to-accent text-white rounded-xl shadow-md">
                  <Link to="/login">Começar teste grátis</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
