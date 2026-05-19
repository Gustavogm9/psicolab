-- Habilitar extensões necessárias para Cron Jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar Cron Job para sincronização diária às 6h da manhã
SELECT cron.schedule(
  'asaas-sync-daily',
  '0 6 * * *', -- Todos os dias às 6:00 AM
  $$
  SELECT net.http_post(
    url := 'https://zxcthpshrjsvuiihocvz.supabase.co/functions/v1/asaas-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'x-supabase-cron', 'true'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Comentário: Verificar Cron Jobs ativos
-- SELECT * FROM cron.job;

-- Comentário: Ver histórico de execuções
-- SELECT jobid, runid, job_pid, status, return_message, start_time, end_time
-- FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'asaas-sync-daily')
-- ORDER BY start_time DESC
-- LIMIT 20;