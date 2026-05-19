-- Adicionar suporte para múltiplos ambientes e status de conexão
ALTER TABLE asaas_credentials 
ADD COLUMN IF NOT EXISTS sandbox_api_key TEXT,
ADD COLUMN IF NOT EXISTS production_api_key TEXT,
ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'not_tested',
ADD COLUMN IF NOT EXISTS last_validation_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_name TEXT;

-- Migrar dados existentes da coluna api_key para sandbox_api_key ou production_api_key
UPDATE asaas_credentials 
SET 
  sandbox_api_key = CASE WHEN environment = 'sandbox' THEN api_key ELSE NULL END,
  production_api_key = CASE WHEN environment = 'production' THEN api_key ELSE NULL END
WHERE api_key IS NOT NULL;

-- Remover coluna antiga api_key (após migração dos dados)
ALTER TABLE asaas_credentials 
DROP COLUMN IF EXISTS api_key;

-- Remover constraint de ambiente único pois agora armazenamos ambos no mesmo registro
ALTER TABLE asaas_credentials 
DROP CONSTRAINT IF EXISTS asaas_credentials_consultora_id_environment_key;