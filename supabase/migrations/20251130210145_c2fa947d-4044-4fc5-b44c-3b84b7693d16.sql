-- Adicionar campos para favicon e título do sistema na tabela configuracoes_whitelabel
ALTER TABLE configuracoes_whitelabel 
ADD COLUMN IF NOT EXISTS titulo_sistema text DEFAULT 'PsiColab',
ADD COLUMN IF NOT EXISTS favicon_url text DEFAULT NULL;

COMMENT ON COLUMN configuracoes_whitelabel.titulo_sistema IS 'Título customizado que aparece na aba do navegador';
COMMENT ON COLUMN configuracoes_whitelabel.favicon_url IS 'URL do favicon customizado armazenado no bucket marca-logos';