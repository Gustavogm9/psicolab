-- Meta Conversions API Token
ALTER TABLE perfis_publicos 
ADD COLUMN IF NOT EXISTS meta_capi_access_token TEXT DEFAULT NULL;

-- Facebook Domain Verification
ALTER TABLE perfis_publicos 
ADD COLUMN IF NOT EXISTS facebook_domain_verification VARCHAR(50) DEFAULT NULL;

-- Comentários para documentação
COMMENT ON COLUMN perfis_publicos.meta_capi_access_token IS 'Token de acesso da Meta Conversions API. Começa com EAA. Usado para enviar eventos server-side.';
COMMENT ON COLUMN perfis_publicos.facebook_domain_verification IS 'Código de verificação de domínio da Meta. Alfanumérico de 20-40 chars.';