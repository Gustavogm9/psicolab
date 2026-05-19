import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PerfilComDominio {
  slug: string;
  updated_at: string;
  dominios_customizados: Array<{
    dominio: string;
    status: string;
  }>;
}

export const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState<string>("");

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        // Buscar todos os perfis públicos ativos com seus domínios customizados
        const { data: perfis, error } = await supabase
          .from("perfis_publicos")
          .select(`
            slug, 
            updated_at,
            dominios_customizados!inner (
              dominio,
              status
            )
          `)
          .eq("ativo", true);

        if (error) throw error;

        const baseUrl = window.location.origin;
        const currentDate = new Date().toISOString();

        // Gerar XML do sitemap
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

        // Página principal
        xml += "  <url>\n";
        xml += `    <loc>${baseUrl}/</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += "    <changefreq>weekly</changefreq>\n";
        xml += "    <priority>1.0</priority>\n";
        xml += "  </url>\n";

        // Páginas estáticas
        const staticPages = [
          { path: "/sobre", changefreq: "monthly", priority: "0.8" },
          { path: "/lead-capture", changefreq: "monthly", priority: "0.7" },
          { path: "/roi-calculator", changefreq: "monthly", priority: "0.7" },
        ];

        staticPages.forEach((page) => {
          xml += "  <url>\n";
          xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
          xml += `    <lastmod>${currentDate}</lastmod>\n`;
          xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
          xml += `    <priority>${page.priority}</priority>\n`;
          xml += "  </url>\n";
        });

        // Perfis públicos (usar domínio customizado se disponível)
        perfis?.forEach((perfil) => {
          const perfilData = perfil as unknown as PerfilComDominio;
          const dominioAtivo = Array.isArray(perfilData.dominios_customizados) 
            ? perfilData.dominios_customizados.find((d: any) => d.status === 'ativo')
            : null;
          
          // URL principal do perfil
          const perfilUrl = dominioAtivo 
            ? `https://${dominioAtivo.dominio}`
            : `${baseUrl}/perfil/${perfilData.slug}`;
          
          xml += "  <url>\n";
          xml += `    <loc>${perfilUrl}</loc>\n`;
          xml += `    <lastmod>${new Date(perfilData.updated_at).toISOString()}</lastmod>\n`;
          xml += "    <changefreq>weekly</changefreq>\n";
          xml += "    <priority>0.9</priority>\n";
          xml += "  </url>\n";
          
          // Se tem domínio customizado, adicionar URL alternativa do Lovable também
          if (dominioAtivo) {
            xml += "  <url>\n";
            xml += `    <loc>${baseUrl}/perfil/${perfilData.slug}</loc>\n`;
            xml += `    <lastmod>${new Date(perfilData.updated_at).toISOString()}</lastmod>\n`;
            xml += "    <changefreq>weekly</changefreq>\n";
            xml += "    <priority>0.7</priority>\n";
            xml += "  </url>\n";
          }
        });

        xml += "</urlset>";
        setXmlContent(xml);
      } catch (error) {
        console.error("Erro ao gerar sitemap:", error);
        setXmlContent("Error generating sitemap");
      }
    };

    generateSitemap();
  }, []);

  // Retornar XML puro sem HTML
  useEffect(() => {
    if (xmlContent) {
      // Definir o content-type como XML
      const style = document.createElement('style');
      style.textContent = 'body { font-family: monospace; white-space: pre; }';
      document.head.appendChild(style);
    }
  }, [xmlContent]);

  return (
    <div style={{ padding: '20px' }}>
      {xmlContent || "Gerando sitemap.xml..."}
    </div>
  );
};

export default Sitemap;
