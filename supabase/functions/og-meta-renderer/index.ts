import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERSION = "v1.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'WhatsApp',
  'LinkedInBot',
  'Twitterbot',
  'TelegramBot',
  'Slackbot',
  'Discordbot',
  'googlebot',
  'bingbot',
  'Applebot',
  'Pinterest',
  'Embedly',
  'Quora Link Preview',
  'Showyoubot',
  'outbrain',
  'vkShare',
  'W3C_Validator',
];

function isCrawler(userAgent: string): boolean {
  const lowerAgent = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some(crawler =>
    lowerAgent.includes(crawler.toLowerCase())
  );
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateMetaHtml(perfil: any, dominio: string): string {
  const title = perfil.seo_titulo || perfil.titulo_profissional || 'Perfil Profissional';
  const description = perfil.seo_descricao || perfil.biografia?.substring(0, 160) || 'Conheça nossos serviços e soluções profissionais.';
  const image = perfil.foto_capa || perfil.imagem_hero_url || perfil.foto_perfil || '';
  const url = `https://${dominio}`;
  const siteName = perfil.titulo_profissional || title;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  ${image ? `<meta property="og:image" content="${image}" />` : ''}
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="${escapeHtml(siteName)}" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${url}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${image ? `<meta name="twitter:image" content="${image}" />` : ''}
  
  <!-- LinkedIn specific -->
  <meta property="linkedin:owner" content="${escapeHtml(siteName)}" />
  
  <!-- Facebook Domain Verification -->
  ${perfil.facebook_domain_verification ? `<meta name="facebook-domain-verification" content="${escapeHtml(perfil.facebook_domain_verification)}" />` : ''}
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${url}" />
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <noscript>
    <p>Redirecionando para <a href="${url}">${url}</a></p>
  </noscript>
  <script>
    // Redirect real users to the SPA
    if (typeof window !== 'undefined') {
      window.location.replace("${url}");
    }
  </script>
</body>
</html>`;
}

serve(async (req) => {
  console.log(`[${VERSION}] OG Meta Renderer - Request received`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const dominio = url.searchParams.get('domain');
    const slug = url.searchParams.get('slug');
    const userAgent = req.headers.get('user-agent') || '';
    const forceCrawler = url.searchParams.get('force') === 'true';

    console.log(`[${VERSION}] Domain: ${dominio}, Slug: ${slug}, User-Agent: ${userAgent.substring(0, 50)}...`);

    // Validate input
    if (!dominio && !slug) {
      return new Response(JSON.stringify({
        error: 'Parâmetro "domain" ou "slug" é obrigatório',
        usage: {
          byDomain: '/og-meta-renderer?domain=sodreia.com.br',
          bySlug: '/og-meta-renderer?slug=sodreia',
          forceHtml: '&force=true'
        },
        _version: VERSION
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let perfilPublicoId: string | null = null;
    let finalDomain = dominio;

    // Strategy 1: Find by custom domain
    if (dominio) {
      console.log(`[${VERSION}] Looking up domain: ${dominio}`);

      const { data: dominioData, error: dominioError } = await supabase
        .from('dominios_customizados')
        .select('perfil_publico_id, dominio')
        .eq('dominio', dominio)
        .eq('status', 'ativo')
        .maybeSingle();

      if (dominioError) {
        console.error(`[${VERSION}] Domain lookup error:`, dominioError);
      }

      if (dominioData) {
        perfilPublicoId = dominioData.perfil_publico_id;
        finalDomain = dominioData.dominio;
        console.log(`[${VERSION}] Found domain, perfil_publico_id: ${perfilPublicoId}`);
      }
    }

    // Strategy 2: Find by slug (fallback or direct)
    if (!perfilPublicoId && slug) {
      console.log(`[${VERSION}] Looking up slug: ${slug}`);

      const { data: perfilData, error: perfilError } = await supabase
        .from('perfis_publicos')
        .select('id, slug')
        .eq('slug', slug)
        .eq('ativo', true)
        .maybeSingle();

      if (perfilError) {
        console.error(`[${VERSION}] Slug lookup error:`, perfilError);
      }

      if (perfilData) {
        perfilPublicoId = perfilData.id;
        // If no domain provided, use the slug-based URL
        if (!finalDomain) {
          finalDomain = `psych-harmony-65175.lovable.app/perfil/${perfilData.slug}`;
        }
        console.log(`[${VERSION}] Found slug, perfil_publico_id: ${perfilPublicoId}`);
      }
    }

    // Not found
    if (!perfilPublicoId) {
      return new Response(JSON.stringify({
        error: 'Perfil não encontrado',
        domain: dominio,
        slug: slug,
        hint: 'Verifique se o domínio está ativo ou se o slug existe',
        _version: VERSION
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch profile data
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis_publicos')
      .select(`
        seo_titulo, 
        seo_descricao, 
        foto_capa, 
        imagem_hero_url, 
        foto_perfil, 
        titulo_profissional, 
        biografia,
        slug,
        facebook_domain_verification
      `)
      .eq('id', perfilPublicoId)
      .single();

    if (perfilError || !perfil) {
      console.error(`[${VERSION}] Profile fetch error:`, perfilError);
      return new Response(JSON.stringify({
        error: 'Erro ao buscar dados do perfil',
        perfil_publico_id: perfilPublicoId,
        details: perfilError?.message,
        _version: VERSION
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[${VERSION}] Profile found: ${perfil.seo_titulo || perfil.titulo_profissional}`);

    // Check if crawler or force mode
    const isCrawlerRequest = isCrawler(userAgent) || forceCrawler;
    console.log(`[${VERSION}] Is crawler: ${isCrawlerRequest} (force: ${forceCrawler})`);

    // Return HTML for crawlers
    if (isCrawlerRequest) {
      const html = generateMetaHtml(perfil, finalDomain!);
      console.log(`[${VERSION}] Returning HTML for crawler`);

      return new Response(html, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          'X-Robots-Tag': 'noindex'
        }
      });
    }

    // Return JSON for non-crawlers (debug/preview mode)
    const metaPreview = {
      title: perfil.seo_titulo || perfil.titulo_profissional || 'Sem título',
      description: perfil.seo_descricao || perfil.biografia?.substring(0, 160) || 'Sem descrição',
      image: perfil.foto_capa || perfil.imagem_hero_url || perfil.foto_perfil || null,
      url: `https://${finalDomain}`,
      slug: perfil.slug
    };

    return new Response(JSON.stringify({
      success: true,
      message: 'Dados do perfil encontrados',
      userAgent: userAgent.substring(0, 100),
      isCrawler: false,
      domain: finalDomain,
      meta: metaPreview,
      hints: {
        forceHtml: 'Adicione &force=true para ver o HTML que crawlers recebem',
        debugTools: {
          facebook: 'https://developers.facebook.com/tools/debug/',
          twitter: 'https://cards-dev.twitter.com/validator',
          linkedin: 'https://www.linkedin.com/post-inspector/'
        }
      },
      _version: VERSION
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`[${VERSION}] Unexpected error:`, error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : String(error),
      _version: VERSION
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
