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


async function verificarSSL(dominio: string): Promise<SSLVerificacaoResult> {
  try {
    // Tentar fazer requisição HTTPS
    const response = await fetch(`https://${dominio}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000), // 10 segundos timeout
    });

    // Se chegou aqui, SSL está funcionando
    const certInfo = response.headers.get('x-ssl-info');
    
    return {
      status: 'ativo',
      validoAte: undefined, // Lovable provisiona automaticamente
    };
  } catch (error: any) {
    // Analisar tipo de erro
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      return {
        status: 'erro',
        erroMensagem: 'Erro no certificado SSL. Aguarde o provisionamento automático (pode levar até 24h).',
      };
    }

    if (error.message?.includes('timeout')) {
      return {
        status: 'provisionando',
        erroMensagem: 'Timeout na verificação. SSL pode estar sendo provisionado.',
      };
    }

    // Outros erros (pode ser que o DNS ainda não tenha propagado completamente)
    return {
      status: 'provisionando',
      erroMensagem: error.message,
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

    // Detectar se é chamada automatizada (cron job) - múltiplas formas
    let isCronJob = req.headers.get('x-supabase-cron') !== null;
    
    // Se não for pelo header, tentar detectar pelo body
    if (!isCronJob) {
      try {
        const bodyClone = await req.clone().text();
        if (bodyClone) {
          const body = JSON.parse(bodyClone);
          isCronJob = body?.automated === true || body?.cronJob === true;
        } else {
          // Body vazio também pode indicar cron
          isCronJob = true;
        }
      } catch {
        // Se não conseguir parsear, assumir que não é cron
        isCronJob = false;
      }
    }
    
    let dominiosParaVerificar = [];

    if (isCronJob) {
      console.log('[CRON] Detectado chamada automatizada');
      // Buscar todos os domínios pendentes ou com DNS configurado
      const { data, error } = await supabase
        .from('dominios_customizados')
        .select('*')
        .in('status', ['pendente', 'dns_configurado'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      dominiosParaVerificar = data || [];

      console.log(`[CRON] Verificando ${dominiosParaVerificar.length} domínios pendentes`);
    } else {
      // Verificação manual de um domínio específico
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

    const LOVABLE_IP = '185.158.133.1';
    const resultados = [];

    for (const dominio of dominiosParaVerificar) {
      console.log(`Verificando domínio: ${dominio.dominio}`);

      const tipoDominio = detectarTipoDominio(dominio.dominio);
      console.log(`Tipo de domínio detectado: ${tipoDominio.tipo}`);

      let verificacaoA: VerificacaoResult;
      let verificacaoWWW: VerificacaoResult | null = null;

      if (tipoDominio.tipo === 'raiz') {
        // Domínio raiz: verificar @ e www
        verificacaoA = await verificarRegistroA(dominio.dominio, LOVABLE_IP);
        await supabase.from('dominios_verificacoes').insert({
          dominio_id: dominio.id,
          tipo_verificacao: 'dns_a',
          sucesso: verificacaoA.sucesso,
          detalhes: verificacaoA.detalhes,
        });

        verificacaoWWW = await verificarRegistroA(`www.${dominio.dominio}`, LOVABLE_IP);
        await supabase.from('dominios_verificacoes').insert({
          dominio_id: dominio.id,
          tipo_verificacao: 'dns_a_www',
          sucesso: verificacaoWWW.sucesso,
          detalhes: verificacaoWWW.detalhes,
        });
      } else {
        // Subdomínio: verificar apenas o subdomínio específico
        verificacaoA = await verificarRegistroA(dominio.dominio, LOVABLE_IP);
        await supabase.from('dominios_verificacoes').insert({
          dominio_id: dominio.id,
          tipo_verificacao: 'dns_a_subdominio',
          sucesso: verificacaoA.sucesso,
          detalhes: { ...verificacaoA.detalhes, subdominio: tipoDominio.subdominio },
        });
      }

      // Verificar registro TXT (AGORA OPCIONAL)
      const verificacaoTXT = await verificarRegistroTXT(dominio.dominio, dominio.token_verificacao);
      await supabase.from('dominios_verificacoes').insert({
        dominio_id: dominio.id,
        ...verificacaoTXT,
      });

      // Determinar novo status baseado no tipo de domínio
      // TXT AGORA É OPCIONAL - só A record é obrigatório
      let novoStatus = dominio.status;
      let erroMensagem = null;

      const dnsConfigurado = tipoDominio.tipo === 'raiz'
        ? verificacaoA.sucesso && verificacaoWWW?.sucesso
        : verificacaoA.sucesso;

      // Verificar SSL se DNS estiver configurado
      let sslResult: SSLVerificacaoResult | null = null;
      if (dnsConfigurado) {
        console.log(`Verificando SSL para ${dominio.dominio}...`);
        sslResult = await verificarSSL(dominio.dominio);
        console.log(`SSL status: ${sslResult.status}`);
      }

      if (dnsConfigurado) {
        novoStatus = 'aguardando_aprovacao';
        
        // Notificar admin
        const { data: profile } = await supabase
          .from('perfis_publicos')
          .select('user_id')
          .eq('id', dominio.perfil_publico_id)
          .single();

        if (profile) {
          // Buscar admins
          const { data: admins } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'admin');

          if (admins) {
            for (const admin of admins) {
              await supabase.from('alertas').insert({
                consultora_id: admin.user_id,
                tipo: 'dominio_aprovacao',
                titulo: '🌐 Domínio Aguardando Aprovação',
                descricao: `O domínio ${dominio.dominio} foi verificado e aguarda sua aprovação!${verificacaoTXT.sucesso ? ' (TXT verificado ✓)' : ''}`,
              });
            }
          }
        }
      } else if (verificacaoA.sucesso || verificacaoWWW?.sucesso) {
        novoStatus = 'dns_configurado';
        const faltando = [];
        
        if (tipoDominio.tipo === 'raiz') {
          if (!verificacaoA.sucesso) faltando.push('Registro A (@)');
          if (!verificacaoWWW?.sucesso) faltando.push('Registro A (www)');
        } else {
          if (!verificacaoA.sucesso) faltando.push(`Registro A (${tipoDominio.subdominio})`);
        }
        
        erroMensagem = `DNS parcialmente configurado. Faltando: ${faltando.join(', ')}`;
      } else {
        novoStatus = 'erro';
        const tipoMsg = tipoDominio.tipo === 'raiz' 
          ? 'para @ e www' 
          : `para o subdomínio "${tipoDominio.subdominio}"`;
        erroMensagem = `Nenhum registro DNS encontrado ${tipoMsg}. Verifique sua configuração no domínio raiz ${tipoDominio.dominioRaiz || dominio.dominio}.`;
      }

      // Atualizar status do domínio (incluindo SSL e flag TXT verificado)
      const updateData: any = {
        status: novoStatus,
        erro_mensagem: erroMensagem,
        notas_admin: verificacaoTXT.sucesso 
          ? `TXT verificado ✓ | ${new Date().toISOString()}`
          : `TXT não verificado (opcional) | ${new Date().toISOString()}`
      };

      if (novoStatus === 'aguardando_aprovacao') {
        updateData.dns_verificado_em = new Date().toISOString();
      }

      // Atualizar dados SSL se foi verificado
      if (sslResult) {
        updateData.ssl_status = sslResult.status;
        updateData.ssl_verificado_em = new Date().toISOString();
        updateData.ssl_valido_ate = sslResult.validoAte?.toISOString() || null;
        updateData.ssl_erro_mensagem = sslResult.erroMensagem || null;
      }

      await supabase
        .from('dominios_customizados')
        .update(updateData)
        .eq('id', dominio.id);

      resultados.push({
        dominio: dominio.dominio,
        tipo: tipoDominio.tipo,
        status: novoStatus,
        verificacoes: {
          a: verificacaoA.sucesso,
          www: verificacaoWWW?.sucesso,
          txt: verificacaoTXT.sucesso,
        },
        ssl: sslResult ? {
          status: sslResult.status,
          erro: sslResult.erroMensagem,
        } : null,
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
