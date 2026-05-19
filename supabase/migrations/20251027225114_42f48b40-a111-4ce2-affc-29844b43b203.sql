-- Adicionar coluna cliente_id na tabela leads_diagnostico para rastrear conversões
ALTER TABLE leads_diagnostico
ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id);

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_leads_cliente_id ON leads_diagnostico(cliente_id);

COMMENT ON COLUMN leads_diagnostico.cliente_id IS 'ID do cliente gerado quando o lead é convertido (quando alguma oportunidade é ganha)';