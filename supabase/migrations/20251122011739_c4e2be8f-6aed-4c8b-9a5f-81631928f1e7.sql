-- Adicionar coluna para favicon personalizado
ALTER TABLE perfis_publicos 
ADD COLUMN favicon_url TEXT;

COMMENT ON COLUMN perfis_publicos.favicon_url IS 'URL do favicon personalizado do perfil público';