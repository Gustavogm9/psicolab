import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import nodemailer from "npm:nodemailer@6.9.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const APP_URL = Deno.env.get("APP_URL") ?? "https://mentemetrics.com.br";
const PLATFORM_GMAIL_USER = Deno.env.get("PLATFORM_GMAIL_USER") ?? "";
const PLATFORM_GMAIL_APP_PASSWORD = Deno.env.get("PLATFORM_GMAIL_APP_PASSWORD") ?? "";

interface ConviteRequest {
  avaliacaoId: string;
  participanteIds?: string[];
}

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
    const { avaliacaoId, participanteIds }: ConviteRequest = await req.json();

    console.log("Enviando convites para avaliação:", avaliacaoId);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar dados da avaliação + consultora
    const { data: avaliacao, error: avaliacaoError } = await supabaseAdmin
      .from("avaliacoes")
      .select(`
        *,
        cliente:clientes(nome),
        consultora:profiles(id, name, smtp_email, smtp_app_password)
      `)
      .eq("id", avaliacaoId)
      .single();

    if (avaliacaoError) {
      console.error("Erro ao buscar avaliação:", avaliacaoError);
      throw avaliacaoError;
    }

    // Determinar credenciais SMTP (da consultora ou da plataforma)
    const consultora = avaliacao.consultora as any;

    // Buscar domínio customizado da consultora
    let baseUrl = APP_URL;
    if (consultora?.id) {
      const { data: perfil } = await supabaseAdmin
        .from('perfis_publicos')
        .select('id')
        .eq('user_id', consultora.id)
        .eq('ativo', true)
        .maybeSingle();

      if (perfil) {
        const { data: dominio } = await supabaseAdmin
          .from('dominios_customizados')
          .select('dominio')
          .eq('perfil_publico_id', perfil.id)
          .eq('status', 'ativo')
          .maybeSingle();

        if (dominio?.dominio) {
          baseUrl = `https://${dominio.dominio}`;
          console.log(`Usando domínio customizado: ${baseUrl}`);
        }
      }
    }
    const smtpUser = consultora?.smtp_email || PLATFORM_GMAIL_USER;
    const smtpPassword = consultora?.smtp_app_password || PLATFORM_GMAIL_APP_PASSWORD;
    const fromEmail = smtpUser;
    const fromName = consultora?.smtp_email
      ? (consultora?.name || "Avaliação")
      : `${consultora?.name || "Avaliação"} via PsiColab`;

    console.log(`Usando remetente: ${fromEmail} (${consultora?.smtp_email ? "email da consultora" : "email da plataforma"})`);

    // Buscar participantes
    let query = supabaseAdmin
      .from("avaliacoes_participantes")
      .select("*")
      .eq("avaliacao_id", avaliacaoId);

    if (participanteIds && participanteIds.length > 0) {
      query = query.in("id", participanteIds);
    }

    const { data: participantes, error: participantesError } = await query;

    if (participantesError) {
      console.error("Erro ao buscar participantes:", participantesError);
      throw participantesError;
    }

    if (!participantes || participantes.length === 0) {
      return new Response(
        JSON.stringify({ error: "Nenhum participante encontrado" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Enviando emails para ${participantes.length} participantes`);

    const results = [];
    for (const participante of participantes) {
      // Bug corrigido: usar token_acesso (não .token) e APP_URL (não SUPABASE_URL)
      const linkResposta = `${baseUrl}/avaliacao/${avaliacao.slug || avaliacao.id}?token=${participante.token_acesso}`;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              h1 { margin: 0; font-size: 24px; }
              .info-box { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #667eea; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📋 Você foi convidado(a) para uma avaliação</h1>
              </div>
              <div class="content">
                <p>Olá${participante.nome ? ` ${participante.nome}` : ""},</p>
                <p>Você foi convidado(a) para participar da seguinte avaliação:</p>
                <div class="info-box">
                  <strong>📝 ${avaliacao.nome}</strong><br>
                  ${avaliacao.descricao ? `<p>${avaliacao.descricao}</p>` : ""}
                  <strong>Tipo:</strong> ${avaliacao.tipo || "Avaliação"}<br>
                  ${avaliacao.data_fim ? `<strong>Prazo:</strong> até ${new Date(avaliacao.data_fim).toLocaleDateString("pt-BR")}<br>` : ""}
                  ${avaliacao.cliente?.nome ? `<strong>Organização:</strong> ${avaliacao.cliente.nome}<br>` : ""}
                </div>
                <p>Sua participação é muito importante! Clique no botão abaixo para responder:</p>
                <center>
                  <a href="${linkResposta}" class="button">Responder Avaliação</a>
                </center>
                <p style="font-size: 12px; color: #666; margin-top: 30px;">
                  Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                  <a href="${linkResposta}">${linkResposta}</a>
                </p>
              </div>
              <div class="footer">
                <p>Este é um email automático, por favor não responda.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      try {
        await sendEmailViaSmtp({
          smtpUser,
          smtpPassword,
          fromName,
          fromEmail,
          to: participante.email,
          subject: `Convite: ${avaliacao.nome}`,
          html,
        });

        // Atualizar data_convite do participante
        await supabaseAdmin
          .from("avaliacoes_participantes")
          .update({ data_convite: new Date().toISOString() })
          .eq("id", participante.id);

        console.log(`Email enviado para ${participante.email}`);
        results.push({ success: true, email: participante.email });
      } catch (error: any) {
        console.error(`Erro ao enviar para ${participante.email}:`, error.message);
        results.push({ success: false, email: participante.email, error: error.message });
      }
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        total: participantes.length,
        sent,
        failed,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-avaliacao-convite function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
