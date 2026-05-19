-- Adicionar lead_id na tabela eventos
ALTER TABLE eventos 
ADD COLUMN lead_id uuid REFERENCES leads_diagnostico(id) ON DELETE CASCADE;

-- Criar índice para melhorar performance de queries
CREATE INDEX idx_eventos_lead_id ON eventos(lead_id);

-- Comentário explicativo
COMMENT ON COLUMN eventos.lead_id IS 'Referência ao lead associado a este evento';