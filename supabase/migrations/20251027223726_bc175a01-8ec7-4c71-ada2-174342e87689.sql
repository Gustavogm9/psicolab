-- Adicionar campos de cliente à tabela leads_diagnostico
ALTER TABLE leads_diagnostico
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS colaboradores INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tipo TEXT;

-- Comentário explicativo
COMMENT ON COLUMN leads_diagnostico.endereco IS 'Endereço da empresa do lead';
COMMENT ON COLUMN leads_diagnostico.colaboradores IS 'Número de colaboradores da empresa';
COMMENT ON COLUMN leads_diagnostico.tipo IS 'Tipo de empresa (Corporativo, Individual, etc)';