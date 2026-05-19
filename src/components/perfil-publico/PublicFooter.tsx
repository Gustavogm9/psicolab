import { Mail, Phone, Instagram, Linkedin, Globe, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PublicFooterProps {
  perfilNome: string;
  tituloProfissional?: string | null;
  fotoPerfil?: string | null;
  biografia?: string | null;
  textoSobre?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  site?: string | null;
  corPrimaria: string;
  especialidades?: Array<{ id: string; titulo: string; destaque: boolean }>;
}

export function PublicFooter({
  perfilNome,
  tituloProfissional,
  fotoPerfil,
  biografia,
  textoSobre,
  whatsapp,
  instagram,
  linkedin,
  site,
  corPrimaria,
  especialidades = []
}: PublicFooterProps) {
  const currentYear = new Date().getFullYear();
  
  const textoApresentacao = textoSobre || 
    (biografia && biografia.length > 200 
      ? biografia.substring(0, 200) + "..." 
      : biografia) || 
    "Psicólogo(a) dedicado(a) a ajudar pessoas a alcançarem seu bem-estar emocional e desenvolvimento pessoal.";

  const especialidadesDestaque = especialidades
    .filter(e => e.destaque)
    .slice(0, 4);

  return (
    <footer className="bg-card border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Coluna 1: Sobre */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {fotoPerfil && (
                <img 
                  src={fotoPerfil} 
                  alt={`Foto de perfil de ${perfilNome}${tituloProfissional ? `, ${tituloProfissional}` : ''}`}
                  loading="lazy"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                />
              )}
              <div>
                <h3 className="font-bold text-lg">{perfilNome}</h3>
                {tituloProfissional && (
                  <p className="text-sm text-muted-foreground">{tituloProfissional}</p>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {textoApresentacao}
            </p>
            
            {/* Redes Sociais */}
            <div className="flex gap-3">
              {instagram && (
                <a
                  href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
                  style={{ color: corPrimaria }}
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
                  style={{ color: corPrimaria }}
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {site && (
                <a
                  href={site.startsWith('http') ? site : `https://${site}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
                  style={{ color: corPrimaria }}
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: corPrimaria }}>
              Navegação
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#sobre" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sobre
                </a>
              </li>
              <li>
                <a href="#servicos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Serviços
                </a>
              </li>
              <li>
                <a href="#depoimentos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Depoimentos
                </a>
              </li>
              <li>
                <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#contato" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Especialidades ou Contato */}
          <div>
            {especialidadesDestaque.length > 0 ? (
              <>
                <h4 className="font-semibold mb-4" style={{ color: corPrimaria }}>
                  Especialidades
                </h4>
                <ul className="space-y-2 text-sm">
                  {especialidadesDestaque.map((esp) => (
                    <li key={esp.id} className="text-muted-foreground">
                      {esp.titulo}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h4 className="font-semibold mb-4" style={{ color: corPrimaria }}>
                  Contato
                </h4>
                <ul className="space-y-3 text-sm">
                  {whatsapp && (
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a 
                        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                      >
                        WhatsApp
                      </a>
                    </li>
                  )}
                  {instagram && (
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <Instagram className="h-4 w-4" />
                      <span>Instagram</span>
                    </li>
                  )}
                  {linkedin && (
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>
            © {currentYear} {perfilNome}. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
