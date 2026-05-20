import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TipoDominio {
  tipo: 'raiz' | 'subdominio';
  dominio: string;
  dominioRaiz?: string;
  subdominio?: string;
}

function detectarTipoDominio(dominio: string): TipoDominio {
  const dominioLimpo = dominio.replace(/^www\./, '');
  const partes = dominioLimpo.split('.');
  
  const ehDominioRaizComBr = partes.length === 3 && partes[2] === 'br';
  const ehDominioRaizSimples = partes.length === 2;
  
  if (ehDominioRaizSimples || ehDominioRaizComBr) {
    return {
      tipo: 'raiz',
      dominio: dominioLimpo,
    };
  }
  
  const subdominio = partes[0];
  const dominioRaiz = partes.slice(1).join('.');
  
  return {
    tipo: 'subdominio',
    dominio: dominioLimpo,
    dominioRaiz,
    subdominio,
  };
}

interface VerificacaoResult {
  tipo: string;
  sucesso: boolean;
  detalhes: any;
}

interface SSLVerificacaoResult {
  status: 'pendente' | 'provisionando' | 'ativo' | 'erro' | 'expirado';
  validoAte?: Date;
  erroMensagem?: string;
}

async function verificarRegistroA(dominio: string, ipEsperado: string): Promise<VerificacaoResult> {
  try {
    // Usar DNS-over-HTTPS do Google
    const url = `https://dns.google/resolve?name=${dominio}&type=A`;
    const response = await fetch(url);
    const data = await response.json();

    const ips = data.Answer?.map((a: any) => a.data) || [];
    const sucesso = ips.includes(ipEsperado);

    return {
      tipo: 'dns_a',
      sucesso,
      detalhes: { ips, ipEsperado },
    };
  } catch (error) {
    return {
      tipo: 'dns_a',
      sucesso: false,
      detalhes: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

async function verificarRegistroCNAME(dominio: string, cnameEsperado: string): Promise<VerificacaoResult> {
  try {
    const url = `https://dns.google/resolve?name=${dominio}&type=CNAME`;
    const response = await fetch(url);
    const data = await response.json();

    const cnames = data.Answer?.map((a: any) => a.data.replace(/\.$/, '')) || [];
    const sucesso = cnames.some((c: string) => c.toLowerCase().includes(cnameEsperado.toLowerCase()));

    return {
      tipo: 'dns_cname',
      sucesso,
      detalhes: { cnames, cnameEsperado },
    };
  } catch (error) {
    return {
      tipo: 'dns_cname',
      sucesso: false,
      detalhes: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

/**
 * Verifica registro TXT para token de verificação (OPCIONAL)
 */
async function verificarRegistroTXT(
  dominio: string,
  tokenEsperado: string
): Promise<VerificacaoResult> {
  try {
    const url = `https://dns.google/resolve?name=_psicolab.${dominio}&type=TXT`;
    const response = await fetch(url);
    const data = await response.json();

    const txtRecords = data.Answer?.map((a: any) => a.data.replace(/"/g, '')) || [];
    const valorEsperado = `psicolab_verify=${tokenEsperado}`;
    const sucesso = txtRecords.includes(valorEsperado);

    return {
      tipo: 'dns_txt',
      sucesso,
      detalhes: { txtRecords, valorEsperado, opcional: true },
    };
  } catch (error) {
    return {
      tipo: 'dns_txt',
      sucesso: false,
      detalhes: { 
        error: error instanceof Error ? error.message : String(error),
        opcional: true
      },
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Credenciais da Vercel
    const VERCEL_TOKEN = Deno.env.get('VERCEL_TOKEN');
    const VERCEL_PROJECT_ID = Deno.env.get('VERCEL_PROJECT_ID');
    const VERCEL_TEAM_ID = Deno.env.get('VERCEL_TEAM_ID');

    // Detectar se é chamada automatizada (cron job)
    let isCronJob = req.headers.get('x-supabase-cron') !== null;
    
    if (!isCronJob) {
      try {
        const bodyClone = await req.clone().text();
        if (bodyClone) {
          const body = JSON.parse(bodyClone);
          isCronJob = body?.automated === true || body?.cronJob === true;
        } else {
          isCronJob = true;
        }
      } catch {
        isCronJob = false;
      }
    }
    
    let dominiosParaVerificar = [];

    if (isCronJob) {
      console.log('[CRON] Detectado chamada automatizada');
      const { data, error } = await supabase
        .from('dominios_customizados')
        .select('*')
        .in('status', ['pendente', 'dns_configurado'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      dominiosParaVerificar = data || [];
      console.log(`[CRON] Verificando ${dominiosParaVerificar.length} domínios pendentes`);
    } else {
      const { dominioId } = await req.json();

      if (!dominioId) {
        throw new Error('dominioId é obrigatório para verificação manual');
      }

      const { data, error } = await supabase
        .from('dominios_customizados')
        .select('*')
        .eq('id', dominioId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Domínio não encontrado');

      dominiosParaVerificar = [data];
    }

    const VERCEL_IP = '76.76.21.21';
    const VERCEL_CNAME = 'cname.vercel-dns.com';
    const resultados = [];

    for (const dominio of dominiosParaVerificar) {
      console.log(`Verificando domínio: ${dominio.dominio}`);

      const tipoDominio = detectarTipoDominio(dominio.dominio);
      console.log(`Tipo de domínio detectado: ${tipoDominio.tipo}`);

      // 1. Tentar integrar com a API da Vercel se os tokens estiverem presentes
      let vercelVerified = false;
      let vercelConfig: any = null;
      let usouVercelApi = false;

      if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
        usouVercelApi = true;
        try {
          console.log(`[Vercel] Tentando adicionar domínio ${dominio.dominio} no projeto ${VERCEL_PROJECT_ID}...`);
          const addRes = await fetch(
            `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains${
              VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ""
            }`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${VERCEL_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: dominio.dominio }),
            }
          );
          const addData = await addRes.json();
          console.log(`[Vercel] POST /domains status: ${addRes.status}`);

          console.log(`[Vercel] Obtendo status do domínio ${dominio.dominio}...`);
          const getRes = await fetch(
            `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${
              dominio.dominio
            }${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ""}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${VERCEL_TOKEN}`,
              },
            }
          );
          if (getRes.status === 200) {
            vercelConfig = await getRes.json();
            vercelVerified = vercelConfig.verified === true;
            console.log(`[Vercel] GET /domains/${dominio.dominio} verified: ${vercelVerified}`);
          }
        } catch (err) {
          console.error(`[Vercel API Error]:`, err);
        }
      }

      // 2. Realizar verificações de DNS tradicionais (D-o-H)
      let dnsAOk = false;
      let dnsWWWOk = false;
      let dnsCNAMEOk = false;

      let verificacaoA: VerificacaoResult;
      let verificacaoWWW: VerificacaoResult | null = null;

      if (tipoDominio.tipo === 'raiz') {
        // Domínio raiz: registro A para @ apontando para VERCEL_IP
        verificacaoA = await verificarRegistroA(dominio.dominio, VERCEL_IP);
        dnsAOk = verificacaoA.sucesso;
        await supabase.from('dominios_verificacoes').insert({
          dominio_id: dominio.id,
          tipo_verificacao: 'dns_a',
          sucesso: verificacaoA.sucesso,
          detalhes: verificacaoA.detalhes,
        });

        // E registro CNAME ou A para www apontando para Vercel
        const verifyWWW_A = await verificarRegistroA(`www.${dominio.dominio}`, VERCEL_IP);
        const verifyWWW_CNAME = await verificarRegistroCNAME(`www.${dominio.dominio}`, VERCEL_CNAME);
        
        dnsWWWOk = verifyWWW_A.sucesso || verifyWWW_CNAME.sucesso;
        verificacaoWWW = {
          tipo: 'dns_a_www',
          sucesso: dnsWWWOk,
          detalhes: { 
            a_record: verifyWWW_A.detalhes, 
            cname_record: verifyWWW_CNAME.detalhes 
          }
        };

        await supabase.from('dominios_verificacoes').insert({
          dominio_id: dominio.id,
          tipo_verificacao: 'dns_a_www',
          sucesso: dnsWWWOk,
          detalhes: verificacaoWWW.detalhes,
        });
      } else {
        // Subdomínio: registro CNAME apontando para cname.vercel-dns.com
        const verifyCNAME = await verificarRegistroCNAME(dominio.dominio, VERCEL_CNAME);
        const verifyA = await verificarRegistroA(dominio.dominio, VERCEL_IP);

        dnsCNAMEOk = verifyCNAME.sucesso || verifyA.sucesso;
        verificacaoA = {
          tipo: 'dns_cname_subdominio',
          sucesso: dnsCNAMEOk,
          detalhes: { 
            cname_record: verifyCNAME.detalhes, 
            a_record: verifyA.detalhes,
            subdominio: tipoDominio.subdominio 
          }
        };

        await supabase.from('dominios_verificacoes').insert({
          dominio_id: dominio.id,
          tipo_verificacao: 'dns_a_subdominio',
          sucesso: dnsCNAMEOk,
          detalhes: verificacaoA.detalhes,
        });
      }

      // Registro TXT (Opcional)
      const verificacaoTXT = await verificarRegistroTXT(dominio.dominio, dominio.token_verificacao);
      await supabase.from('dominios_verificacoes').insert({
        dominio_id: dominio.id,
        ...verificacaoTXT,
      });

      // 3. Determinar o status
      let novoStatus = dominio.status;
      let erroMensagem = null;
      let sslStatus = 'pendente';
      let sslErroMensagem = null;

      const dnsLocalmenteConfigurado = tipoDominio.tipo === 'raiz'
        ? dnsAOk && dnsWWWOk
        : dnsCNAMEOk;

      // Determinar se ativamos diretamente (Direct-to-Active)
      let deveAtivarDiretamente = false;

      if (usouVercelApi) {
        if (vercelVerified) {
          deveAtivarDiretamente = true;
          sslStatus = 'ativo';
        } else if (dnsLocalmenteConfigurado) {
          novoStatus = 'dns_configurado';
          erroMensagem = 'DNS configurado corretamente! A Vercel está gerando o certificado SSL e ativando o domínio.';
          sslStatus = 'provisionando';
          sslErroMensagem = 'Aguardando provisionamento do SSL pela Vercel.';
        } else {
          novoStatus = 'pendente';
          erroMensagem = 'Aguardando configuração de DNS. Certifique-se de configurar os registros apontados.';
        }
      } else {
        // Fallback: Sem API do Vercel configurada, se o DNS bate, ativa automaticamente!
        if (dnsLocalmenteConfigurado) {
          deveAtivarDiretamente = true;
          sslStatus = 'ativo';
        } else {
          novoStatus = 'pendente';
          erroMensagem = 'Aguardando configuração de DNS.';
        }
      }

      if (deveAtivarDiretamente) {
        novoStatus = 'ativo';
        erroMensagem = null;
        sslStatus = 'ativo';
      }

      // Preparar payload de atualização
      const updateData: any = {
        status: novoStatus,
        erro_mensagem: erroMensagem,
        notas_admin: `Automatizado Vercel | TXT: ${verificacaoTXT.sucesso ? '✓' : '✗'} | Verificado em: ${new Date().toISOString()}`
      };

      if (novoStatus === 'ativo') {
        updateData.dns_verificado_em = new Date().toISOString();
        if (!dominio.ativado_em) {
          updateData.ativado_em = new Date().toISOString();
          
          // Criar alerta para o psicólogo informando que está ativo!
          const { data: profile } = await supabase
            .from('perfis_publicos')
            .select('user_id')
            .eq('id', dominio.perfil_publico_id)
            .single();

          if (profile) {
            await supabase.from('alertas').insert({
              consultora_id: profile.user_id,
              tipo: 'dominio_ativo',
              titulo: '🌐 Domínio Customizado Ativo!',
              descricao: `O domínio ${dominio.dominio} foi configurado e ativado com sucesso!`,
            });
          }
        }
      }

      updateData.ssl_status = sslStatus;
      updateData.ssl_verificado_em = new Date().toISOString();
      updateData.ssl_erro_mensagem = sslErroMensagem;

      await supabase
        .from('dominios_customizados')
        .update(updateData)
        .eq('id', dominio.id);

      resultados.push({
        dominio: dominio.dominio,
        status: novoStatus,
        vercel: usouVercelApi ? { verified: vercelVerified } : 'fallback_dns_only',
        dns: {
          raiz_a: dnsAOk,
          www_cname: dnsWWWOk,
          subdominio_cname: dnsCNAMEOk,
          txt: verificacaoTXT.sucesso
        }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        resultados,
        total: dominiosParaVerificar.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
