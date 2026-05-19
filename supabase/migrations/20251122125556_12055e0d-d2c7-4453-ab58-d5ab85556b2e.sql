-- Adicionar campos de webhook tokens por ambiente
ALTER TABLE asaas_credentials 
ADD COLUMN IF NOT EXISTS sandbox_webhook_token TEXT,
ADD COLUMN IF NOT EXISTS production_webhook_token TEXT;

-- Migrar webhook_token existente para o campo apropriado baseado no environment
UPDATE asaas_credentials 
SET sandbox_webhook_token = webhook_token
WHERE environment = 'sandbox' AND webhook_token IS NOT NULL;

UPDATE asaas_credentials 
SET production_webhook_token = webhook_token
WHERE environment = 'production' AND webhook_token IS NOT NULL;