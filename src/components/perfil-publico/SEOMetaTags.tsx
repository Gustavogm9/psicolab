import { Helmet } from "react-helmet-async";
import { PerfilPublico } from "@/hooks/usePerfilPublico";
import { ServicoPublico } from "@/hooks/useServicosPublicos";
import { DepoimentoPublico } from "@/hooks/useDepoimentosPublicos";
import { useActiveDomain } from "@/hooks/useActiveDomain";

interface SEOMetaTagsProps {
  perfil: PerfilPublico;
  pageUrl: string;
  servicos?: ServicoPublico[];
  depoimentos?: DepoimentoPublico[];
}

export const SEOMetaTags = ({ perfil, pageUrl, servicos = [], depoimentos = [] }: SEOMetaTagsProps) => {
  const { data: activeDomain } = useActiveDomain();
  
  // Usar domínio customizado para URLs absolutas se disponível
  const baseUrl = activeDomain?.isCustomDomain 
    ? `https://${activeDomain.domain}`
    : pageUrl.split('/perfil/')[0];
  
  const canonicalUrl = activeDomain?.isCustomDomain
    ? `https://${activeDomain.domain}`
    : pageUrl;
    
  const seoTitle = perfil.seo_titulo || `${perfil.titulo_profissional} - ${perfil.slug}`;
  const seoDescription = perfil.seo_descricao || perfil.biografia?.substring(0, 160) || "Profissional de saúde especializado";
  const seoImage = perfil.foto_capa || perfil.imagem_hero_url || perfil.foto_perfil || "/og-default.png";
  const seoKeywords = perfil.seo_palavras_chave?.join(", ") || "psicólogo, saúde mental, terapia, consultoria";

  // Schema.org - Professional Service / Health Professional
  const sameAsLinks = [
    perfil.instagram && `https://instagram.com/${perfil.instagram.replace('@', '')}`,
    perfil.linkedin && perfil.linkedin,
    perfil.site,
  ].filter(Boolean);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": canonicalUrl,
    "name": perfil.titulo_profissional || perfil.slug,
    "url": canonicalUrl,
    ...(perfil.foto_perfil && { "logo": perfil.foto_perfil }),
    "image": seoImage,
    "description": seoDescription,
    "priceRange": "$$",
    ...(perfil.whatsapp && {
      "telephone": perfil.whatsapp,
    }),
    ...(sameAsLinks.length > 0 && {
      "sameAs": sameAsLinks,
    }),
    "areaServed": {
      "@type": "Country",
      "name": "Brasil"
    },
    "availableLanguage": {
      "@type": "Language",
      "name": "Português"
    },
  };

  // Schema.org - Person (if professional profile)
  const personSameAsLinks = [
    perfil.instagram && `https://instagram.com/${perfil.instagram.replace('@', '')}`,
    perfil.linkedin && perfil.linkedin,
    perfil.site,
  ].filter(Boolean);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": perfil.titulo_profissional || perfil.slug,
    "url": canonicalUrl,
    ...(perfil.foto_perfil && { "image": perfil.foto_perfil }),
    ...(perfil.biografia && { "description": perfil.biografia }),
    ...(perfil.titulo_profissional && { "jobTitle": perfil.titulo_profissional }),
    ...(perfil.whatsapp && {
      "telephone": perfil.whatsapp,
    }),
    ...(personSameAsLinks.length > 0 && {
      "sameAs": personSameAsLinks,
    }),
  };

  // Schema.org - WebPage
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": seoTitle,
    "description": seoDescription,
    "url": canonicalUrl,
    "image": seoImage,
    "publisher": {
      "@type": "Organization",
      "name": "PsiColab",
      "url": baseUrl,
    },
    "inLanguage": "pt-BR",
  };

  // Schema.org - Service (individual services)
  const serviceSchemas = servicos.slice(0, 5).map((servico) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": servico.titulo,
    "description": servico.descricao,
    "provider": {
      "@type": "Person",
      "name": perfil.titulo_profissional || perfil.slug,
    },
    ...(servico.preco && {
      "offers": {
        "@type": "Offer",
        "price": servico.preco,
        "priceCurrency": "BRL",
      }
    }),
    ...(servico.duracao && {
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "description": `Duração: ${servico.duracao} minutos`,
      }
    }),
  }));

  // Schema.org - Review (testimonials)
  const reviewSchemas = depoimentos
    .filter(dep => dep.status === 'aprovado')
    .slice(0, 5)
    .map((depoimento) => ({
      "@context": "https://schema.org",
      "@type": "Review",
      "itemReviewed": {
        "@type": "ProfessionalService",
        "name": perfil.titulo_profissional || perfil.slug,
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": depoimento.rating || 5,
        "bestRating": 5,
      },
      "author": {
        "@type": "Person",
        "name": depoimento.nome,
        ...(depoimento.cargo && { "jobTitle": depoimento.cargo }),
        ...(depoimento.empresa && { "worksFor": depoimento.empresa }),
      },
      "reviewBody": depoimento.texto,
      ...(depoimento.data && { "datePublished": depoimento.data }),
    }));

  // Schema.org - HowTo (work process)
  const processoTrabalho = perfil.processo_trabalho as any[] || [];
  const howToSchema = processoTrabalho.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Como funciona o atendimento",
    "description": "Processo de trabalho transparente e eficaz",
    "step": processoTrabalho.map((passo, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": passo.titulo,
      "text": passo.descricao,
    })),
  } : null;

  // Schema.org - FAQPage
  const faqs = perfil.faqs as any[] || [];
  const faqPageSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.pergunta,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.resposta,
      },
    })),
  } : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="title" content={seoTitle} />
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={perfil.titulo_profissional || perfil.slug} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Language */}
      <meta httpEquiv="content-language" content="pt-BR" />
      <html lang="pt-BR" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="profile" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:image:alt" content={seoTitle} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="PsiColab" />
      <meta property="profile:first_name" content={perfil.titulo_profissional?.split(' ')[0] || perfil.slug} />
      {perfil.titulo_profissional?.split(' ').length > 1 && (
        <meta property="profile:last_name" content={perfil.titulo_profissional?.split(' ').slice(1).join(' ')} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      <meta name="twitter:image:alt" content={seoTitle} />
      <meta name="twitter:creator" content="@psicolab" />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />

      {/* Mobile */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={seoTitle} />

      {/* Schema.org JSON-LD - Multiple schemas */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(personSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>

      {/* Breadcrumb Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Início",
              "item": window.location.origin,
            },
             {
               "@type": "ListItem",
               "position": 2,
               "name": perfil.titulo_profissional || perfil.slug,
               "item": canonicalUrl,
             },
          ],
        })}
      </script>

      {/* Service Schemas */}
      {serviceSchemas.map((schema, index) => (
        <script key={`service-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}

      {/* Review Schemas */}
      {reviewSchemas.map((schema, index) => (
        <script key={`review-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}

      {/* HowTo Schema */}
      {howToSchema && (
        <script type="application/ld+json">
          {JSON.stringify(howToSchema)}
        </script>
      )}

      {/* FAQPage Schema */}
      {faqPageSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqPageSchema)}
        </script>
      )}

      {/* Facebook Domain Verification */}
      {perfil.facebook_domain_verification && (
        <meta 
          name="facebook-domain-verification" 
          content={perfil.facebook_domain_verification} 
        />
      )}
    </Helmet>
  );
};
