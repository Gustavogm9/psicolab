-- Adicionar coluna de benefícios aos perfis públicos
ALTER TABLE perfis_publicos
ADD COLUMN beneficios jsonb DEFAULT '[]'::jsonb;