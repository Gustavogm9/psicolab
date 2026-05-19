import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import nodemailer from "npm:nodemailer@6.9.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const APP_URL = Deno.env.get("APP_URL") ?? "https://psicosystem.guilds.com.br";
const PLATFORM_GMAIL_USER = Deno.env.get("PLATFORM_GMAIL_USER") ?? "";
const PLATFORM_GMAIL_APP_PASSWORD = Deno.env.get("PLATFORM_GMAIL_APP_PASSWORD") ?? "";
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sendEmailViaSmtp(params: {
  smtpUser: string;
  smtpPassword: string;
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: params.smtpUser,
      pass: params.smtpPassword,
    },
  });

  await transporter.sendMail({
    from: `${params.fromName} <${params.fromEmail}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("🔍 Buscando participantes para enviar lembretes...");

    // Buscar avaliações ativas com lembretes automáticos habilitados
    const { data: avaliacoes, error: avaliacoesError } = await supabase
      .from("avaliacoes")
      .select("id, nome, slug, data_fim, frequencia_lembrete, consultora_id")
      .eq("status", "ativa")
      .eq("lembretes_automaticos", true)
      .gte("data_fim", new Date().toISOString().split("T")[0]);

    if (avaliacoesError) {
      console.error("❌ Erro ao buscar avaliações:", avaliacoesError);
      throw avaliacoesError;
    }

    console.log(`📋 Encontradas ${avaliacoes?.length || 0} avaliações com lembretes habilitados`);

    if (!avaliacoes || avaliacoes.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "Nenhuma avaliação com lembretes habilitados", emails_sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let totalEmailsEnviados = 0;
    const avaliacaoIds = avaliacoes.map(a => a.id);

    // Buscar participantes que não responderam
    const { data: participantesNaoRespondidos, error: participantesError } = await supabase
      .from("avaliacoes_participantes")
      .select("id, nome, email, token_acesso, avaliacao_id, data_convite")
      .in("avaliacao_id", avaliacaoIds)
      .eq("respondido", false);

    if (participantesError) {
      console.error("❌ Erro ao buscar participantes:", participantesError);
      throw participantesError;
    }

    console.log(`👥 Encontrados ${participantesNaoRespondidos?.length || 0} participantes pendentes`);

    if (!participantesNaoRespondidos || participantesNaoRespondidos.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "Nenhum participante pendente", emails_sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Buscar credenciais SMTP de todas as consultoras envolvidas (batch)
    const consultoraIds = [...new Set(avaliacoes.map(a => a.consultora_id).filter(Boolean))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, smtp_email, smtp_app_password")
      .in("id", consultoraIds);

    const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

    // Buscar domínios customizados para todas as consultoras (batch)
    const dominiosMap = new Map<string, string>();
    if (consultoraIds.length > 0) {
      const { data: perfis } = await supabase
        .from('perfis_publicos')
        .select('id, user_id')
        .in('user_id', consultoraIds)
        .eq('ativo', true);

      if (perfis && perfis.length > 0) {
        const perfilIds = perfis.map(p => p.id);
        const { data: dominios } = await supabase
          .from('dominios_customizados')
          .select('perfil_publico_id, dominio')
          .in('perfil_publico_id', perfilIds)
          .eq('status', 'ativo');

        if (dominios) {
          for (const d of dominios) {
            const perfil = perfis.find(p => p.id === d.perfil_publico_id);
            if (perfil) {
              dominiosMap.set(perfil.user_id, `https://${d.dominio}`);
            }
          }
        }
      }
    }

    for (const participante of participantesNaoRespondidos) {
      const avaliacao = avaliacoes.find(a => a.id === participante.avaliacao_id);
      if (!avaliacao) continue;

      // Verificar frequência de lembrete
      const dataConvite = new Date(participante.data_convite);
      const hoje = new Date();
      const diasDesdeConvite = Math.floor((hoje.getTime() - dataConvite.getTime()) / (1000 * 60 * 60 * 24));

      if (diasDesdeConvite % avaliacao.frequencia_lembrete !== 0) {
        console.log(`⏭️  Pulando ${participante.email} - não é dia de lembrete (${diasDesdeConvite} dias)`);
        continue;
      }

      const profile = avaliacao.consultora_id ? profilesMap.get(avaliacao.consultora_id) : null;

      // Determinar credenciais SMTP (URL corrigida: usa APP_URL)
      const smtpUser = profile?.smtp_email || PLATFORM_GMAIL_USER;
      const smtpPassword = profile?.smtp_app_password || PLATFORM_GMAIL_APP_PASSWORD;
      const fromEmail = smtpUser;
      const fromName = profile?.smtp_email
        ? (profile?.name || "Avaliação")
        : `${profile?.name || "Avaliação"} via PsiColab`;

      const reminderBaseUrl = (avaliacao.consultora_id && dominiosMap.get(avaliacao.consultora_id)) || APP_URL;
      const linkAvaliacao = `${reminderBaseUrl}/avaliacao/${avaliacao.slug}?token=${participante.token_acesso}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Lembrete de Avaliação Pendente</h2>
          <p>Olá ${participante.nome || participante.email},</p>
          <p>Este é um lembrete amigável de que você ainda não respondeu à avaliação <strong>"${avaliacao.nome}"</strong>.</p>
          <p>Sua participação é muito importante. A avaliação leva apenas alguns minutos e suas respostas são confidenciais.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${linkAvaliacao}" style="background-color: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Responder Agora
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            <strong>Data limite:</strong> ${new Date(avaliacao.data_fim).toLocaleDateString('pt-BR')}
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">
            Este é um lembrete automático. Se você já respondeu, por favor ignore este email.
          </p>
        </div>
      `;

      try {
        await sendEmailViaSmtp({
          smtpUser,
          smtpPassword,
          fromName,
          fromEmail,
          to: participante.email,
          subject: `Lembrete: Responda à avaliação "${avaliacao.nome}"`,
          html,
        });

        totalEmailsEnviados++;
        console.log(`✅ Lembrete enviado para ${participante.email}`);
      } catch (emailError: any) {
        console.error(`❌ Erro ao enviar para ${participante.email}:`, emailError.message);
      }
    }

    console.log(`🎉 Processo concluído: ${totalEmailsEnviados} lembretes enviados`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${totalEmailsEnviados} lembretes enviados com sucesso`,
        emails_sent: totalEmailsEnviados,
        total_participants: participantesNaoRespondidos.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("❌ Erro na função de lembretes:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
