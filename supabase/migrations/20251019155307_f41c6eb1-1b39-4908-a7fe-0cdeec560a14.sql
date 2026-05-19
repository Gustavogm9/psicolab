-- Adicionar coluna observacoes na tabela eventos
ALTER TABLE eventos 
ADD COLUMN observacoes text;

COMMENT ON COLUMN eventos.observacoes IS 'Observações e detalhes adicionais sobre o evento';