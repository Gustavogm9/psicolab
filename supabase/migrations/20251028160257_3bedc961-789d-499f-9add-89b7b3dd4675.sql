-- Restaurar coluna status_crm removida por engano
ALTER TABLE leads_diagnostico 
ADD COLUMN IF NOT EXISTS status_crm TEXT DEFAULT 'novo';

-- Adicionar constraint para valores válidos
ALTER TABLE leads_diagnostico
ADD CONSTRAINT leads_diagnostico_status_crm_check 
CHECK (status_crm IN ('novo', 'contatado', 'qualificado', 'negociacao', 'convertido', 'perdido'));

-- Recriar índice para performance
CREATE INDEX IF NOT EXISTS idx_leads_status_crm ON leads_diagnostico(status_crm);

-- Atualizar leads existentes que não têm status
UPDATE leads_diagnostico 
SET status_crm = 'novo' 
WHERE status_crm IS NULL;

-- Tornar coluna NOT NULL após garantir que todos têm valor
ALTER TABLE leads_diagnostico 
ALTER COLUMN status_crm SET NOT NULL;