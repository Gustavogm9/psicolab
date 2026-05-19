-- FASE 3.1: Adicionar constraints UNIQUE para prevenir duplicação de emails

-- Prevenir emails duplicados em leads (por consultora)
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_email_consultora 
ON leads_diagnostico(email, consultora_id) 
WHERE email IS NOT NULL AND email != '';

-- Prevenir emails duplicados em clientes (por consultora)
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_email_consultora 
ON clientes(email, consultora_id) 
WHERE email IS NOT NULL AND email != '';