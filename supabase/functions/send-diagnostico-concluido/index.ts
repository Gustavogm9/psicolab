import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import nodemailer from "npm:nodemailer@6.9.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APP_URL = Deno.env.get("APP_URL") ?? "https://mentemetrics.com.br";
const PLATFORM_GMAIL_USER = Deno.env.get("PLATFORM_GMAIL_USER") ?? "";
const PLATFORM_GMAIL_APP_PASSWORD = Deno.env.get("PLATFORM_GMAIL_APP_PASSWORD") ?? "";
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface WebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    questionario_id: string;
    score_total: number;
    categoria: string;
    status: string;
  };
  old_record?: {
    status: string;
  };
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
    const payload: WebhookPayload = await req.json();
    console.log("Webhook payload:", payload);

    if (
      payload.type === "UPDATE" &&
      payload.record.status === "concluida" &&
      payload.old_record?.status !== "concluida"
    ) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Buscar questionário + consultora
      const { data: questionario, error: questionarioError } = await supabase
        .from("questionarios_diagnostico")
        .select("titulo, slug, consultora_id")
        .eq("id", payload.record.questionario_id)
        .single();

      if (questionarioError) {
        console.error("Erro ao buscar questionário:", questionarioError);
        throw questionarioError;
      }

      // Buscar perfil da consultora (incluindo credenciais SMTP)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name, company, smtp_email, smtp_app_password")
        .eq("id", questionario.consultora_id)
        .single();

      if (profileError) {
        console.error("Erro ao buscar perfil da consultora:", profileError);
      }

      // Determinar credenciais SMTP
      const smtpUser = profile?.smtp_email || PLATFORM_GMAIL_USER;
      const smtpPassword = profile?.smtp_app_password || PLATFORM_GMAIL_APP_PASSWORD;
      const fromEmail = smtpUser;
      const fromName = profile?.smtp_email
        ? (profile?.name || "Diagnóstico")
        : `${profile?.name || "Diagnóstico"} via PsiColab`;

      const consultoraNome = profile?.name || "Consultora";
      const empresaNome = profile?.company || "Nossa empresa";

      console.log(`Remetente: ${fromEmail} (${profile?.smtp_email ? "email da consultora" : "plataforma"})`);

      // Buscar lead criado pelo trigger
      const { data: lead, error: leadError } = await supabase
        .from('leads_diagnostico')
        .select('*')
        .eq('resposta_id', payload.record.id)
        .maybeSingle();

      if (leadError) {
        console.error('Erro ao buscar lead:', leadError);
      } else if (lead) {
        console.log('Lead encontrado (via trigger):', lead);
      } else {
        console.warn('Lead não criado pelo trigger ainda');
      }

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .score-badge { display: inline-block; background: #10b981; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; font-size: 18px; margin: 20px 0; }
              .category-badge { display: inline-block; background: #3b82f6; color: white; padding: 5px 15px; border-radius: 15px; font-size: 14px; margin: 10px 0; }
              .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; font-size: 14px; color: #6b7280; border: 1px solid #e5e7eb; border-top: none; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: 600; }
              h1 { margin: 0; font-size: 28px; }
              h2 { color: #667eea; margin-top: 0; }
              p { margin: 15px 0; }
              .divider { border-top: 2px solid #e5e7eb; margin: 25px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎉 Diagnóstico Concluído!</h1>
            </div>
            <div class="content">
              <h2>Olá, ${payload.record.nome}!</h2>
              <p>Obrigado por completar o diagnóstico <strong>${questionario.titulo}</strong>!</p>
              <p>Aqui está um resumo dos seus resultados:</p>
              <div style="text-align: center;">
                <div class="score-badge">Score: ${payload.record.score_total} pontos</div>
                <br>
                <div class="category-badge">${payload.record.categoria}</div>
              </div>
              <div class="divider"></div>
              <h2>Próximos Passos</h2>
              <p>Nossa equipe está analisando suas respostas e em breve <strong>${consultoraNome}</strong> entrará em contato para discutir os resultados e apresentar soluções personalizadas.</p>
              <p>Se você tiver alguma dúvida imediata, não hesite em nos contatar respondendo este email.</p>
            </div>
            <div class="footer">
              <p><strong>${empresaNome}</strong></p>
              <p>Você recebeu este email porque completou um diagnóstico em nossa plataforma.</p>
              <p style="margin-top: 15px; font-size: 12px;">© ${new Date().getFullYear()} ${empresaNome}. Todos os direitos reservados.</p>
            </div>
          </body>
        </html>
      `;

      await sendEmailViaSmtp({
        smtpUser,
        smtpPassword,
        fromName,
        fromEmail,
        to: payload.record.email,
        subject: `Obrigado por completar o diagnóstico - ${questionario.titulo}`,
        html,
      });

      console.log("Email de conclusão enviado com sucesso para:", payload.record.email);

      return new Response(
        JSON.stringify({
          success: true,
          emailSent: true,
          leadCreated: !!lead,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "No action needed" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Erro na função send-diagnostico-concluido:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
