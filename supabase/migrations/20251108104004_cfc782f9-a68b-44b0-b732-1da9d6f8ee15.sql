-- Adicionar campos para CTAs customizados no perfil público
ALTER TABLE perfis_publicos
ADD COLUMN IF NOT EXISTS cta_flutuante_ativo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS cta_flutuante_texto text DEFAULT 'Agende uma Conversa',
ADD COLUMN IF NOT EXISTS cta_flutuante_link text DEFAULT '/contato',
ADD COLUMN IF NOT EXISTS cta_intermediario_titulo text DEFAULT 'Pronto para Transformar sua Organização?',
ADD COLUMN IF NOT EXISTS cta_intermediario_subtitulo text DEFAULT 'Vamos conversar sobre como posso ajudar sua empresa',
ADD COLUMN IF NOT EXISTS cta_intermediario_botao_texto text DEFAULT 'Falar com Especialista',
ADD COLUMN IF NOT EXISTS cta_intermediario_botao_link text DEFAULT '/contato',
ADD COLUMN IF NOT EXISTS cta_rodape_texto text DEFAULT 'Transforme sua organização hoje',
ADD COLUMN IF NOT EXISTS cta_rodape_botao_texto text DEFAULT 'Entre em Contato',
ADD COLUMN IF NOT EXISTS cta_rodape_botao_link text DEFAULT '/contato';