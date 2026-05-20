-- Migration to update pg_cron job URL from old project ID to the new project ID
-- Affected Cron: 'asaas-sync-daily'
-- Old Project ID: zxcthpshrjsvuiihocvz
-- New Project ID: akxqoqbwgsjjvtywbras

BEGIN;

-- Remove cron job if exists
SELECT cron.unschedule('asaas-sync-daily');

-- Re-create Cron Job with the correct new URL
SELECT cron.schedule(
  'asaas-sync-daily',
  '0 6 * * *', -- Everyday at 6:00 AM
  $$
  SELECT net.http_post(
    url := 'https://akxqoqbwgsjjvtywbras.supabase.co/functions/v1/asaas-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'x-supabase-cron', 'true'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

COMMIT;
