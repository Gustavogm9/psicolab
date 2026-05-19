-- Adicionar campo faqs na tabela perfis_publicos
ALTER TABLE perfis_publicos
ADD COLUMN faqs jsonb DEFAULT '[]'::jsonb;