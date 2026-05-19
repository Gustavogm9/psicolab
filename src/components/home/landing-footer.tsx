import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";

export function LandingFooter() {
  const footerSections = [
    {
      title: "Produto",
      links: [
        { label: "Como funciona", href: "#como-funciona" },
        { label: "Recursos", href: "#recursos" },
        { label: "Para Empresas", href: "#para-empresas" },
      ]
    },
    {
      title: "Empresa",
      links: [
        { label: "Sobre nós", href: "/sobre" },
        { label: "Contato", href: "mailto:contato@psicolab.com" },
      ]
    },
    {
      title: "Suporte",
      links: [
        { label: "Central de Ajuda", href: "/help-center" },
        { label: "WhatsApp", href: "https://wa.me/5511999999999" },
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Termos de Uso", href: "/termos" },
        { label: "Política de Privacidade", href: "/privacidade" },
      ]
    }
  ];

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {/* Branding */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                P
              </div>
              <span>PsicoLab</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Sistema completo para psicólogos que atuam com empresas: 
              captação de leads, diagnósticos corporativos e relatórios de ROI.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contato@psicolab.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>(11) 9999-9999</span>
              </div>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.href.startsWith('#') ? (
                      <button
                        onClick={() => {
                          const id = link.href.replace('#', '');
                          const element = document.getElementById(id);
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </button>
                    ) : link.href.startsWith('http') || link.href.startsWith('mailto:') ? (
                      <a 
                        href={link.href}
                        target={link.href.startsWith('http') ? "_blank" : undefined}
                        rel={link.href.startsWith('http') ? "noopener noreferrer" : undefined}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link 
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PsicoLab. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Feito com ❤️ para psicólogos</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
