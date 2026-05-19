import { Instagram, Linkedin, Globe, Mail, Heart } from 'lucide-react';

interface FooterPremiumProps {
  perfil: {
    slug: string;
    biografia?: string | null;
    foto_perfil?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
    site?: string | null;
    whatsapp?: string | null;
    tema_cor_primaria?: string | null;
    tema_cor_secundaria?: string | null;
    footer_texto_sobre?: string | null;
  };
  nomeCompleto: string;
}

export const FooterPremium = ({ perfil, nomeCompleto }: FooterPremiumProps) => {
  const primaryColor = perfil.tema_cor_primaria || '#6366f1';
  const secondaryColor = perfil.tema_cor_secundaria || '#8b5cf6';
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: perfil.instagram ? `https://instagram.com/${perfil.instagram.replace('@', '')}` : null, label: 'Instagram' },
    { icon: Linkedin, href: perfil.linkedin, label: 'LinkedIn' },
    { icon: Globe, href: perfil.site, label: 'Website' },
  ].filter(link => link.href);

  const footerLinks = [
    { label: 'Início', href: '#hero' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Depoimentos', href: '#depoimentos' },
    { label: 'Contato', href: '#contato' },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Gradient Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, 
            hsl(var(--background)) 0%, 
            ${primaryColor}08 50%, 
            ${secondaryColor}05 100%
          )`
        }}
      />
      
      {/* Top Border Gradient */}
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{ 
          background: `linear-gradient(90deg, transparent, ${primaryColor}50, ${secondaryColor}50, transparent)` 
        }}
      />

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* Brand Column */}
            <div className="md:col-span-1">
              {/* Logo/Photo */}
              {perfil.foto_perfil ? (
                <div className="mb-6">
                  <div 
                    className="w-16 h-16 rounded-2xl overflow-hidden border-2"
                    style={{ borderColor: `${primaryColor}40` }}
                  >
                    <img 
                      src={perfil.foto_perfil} 
                      alt={nomeCompleto}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <h3 
                  className="font-playfair text-2xl font-bold mb-4"
                  style={{ color: primaryColor }}
                >
                  {nomeCompleto.split(' ')[0]}
                </h3>
              )}
              
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {perfil.footer_texto_sobre || 
                  perfil.biografia?.substring(0, 150) + '...' ||
                  'Profissional dedicada ao seu bem-estar e desenvolvimento pessoal.'}
              </p>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                      style={{ 
                        backgroundColor: `${primaryColor}15`,
                      }}
                      aria-label={social.label}
                    >
                      <social.icon 
                        className="w-4 h-4 transition-colors"
                        style={{ color: primaryColor }}
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="md:col-span-1">
              <h4 className="font-semibold text-foreground mb-6 text-sm uppercase tracking-wider">
                Navegação
              </h4>
              <nav className="space-y-3">
                {footerLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm group"
                  >
                    <span className="relative">
                      {link.label}
                      <span 
                        className="absolute -bottom-0.5 left-0 w-0 h-px transition-all duration-300 group-hover:w-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Contact Info */}
            <div className="md:col-span-1">
              <h4 className="font-semibold text-foreground mb-6 text-sm uppercase tracking-wider">
                Contato
              </h4>
              
              <div className="space-y-4">
                {perfil.whatsapp && (
                  <a
                    href={`https://wa.me/${perfil.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <svg 
                        className="w-4 h-4" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: primaryColor }}
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Newsletter CTA */}
              <div 
                className="mt-8 p-4 rounded-2xl"
                style={{ backgroundColor: `${primaryColor}08` }}
              >
                <p className="text-sm text-muted-foreground mb-3">
                  Receba dicas e conteúdos exclusivos
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Seu e-mail"
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-border/50 focus:outline-none focus:border-primary/50"
                  />
                  <button
                    className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
                    style={{ 
                      backgroundColor: primaryColor,
                      color: 'white'
                    }}
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="border-t"
          style={{ borderColor: `${primaryColor}15` }}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>
                © {currentYear} {nomeCompleto}. Todos os direitos reservados.
              </p>
              <p className="flex items-center gap-1.5">
                Feito com <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> 
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterPremium;
