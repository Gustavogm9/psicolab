-- Adicionar campos para Hero Section na tabela perfis_publicos
ALTER TABLE perfis_publicos
ADD COLUMN IF NOT EXISTS titulo_hero TEXT DEFAULT 'Transforme sua organização',
ADD COLUMN IF NOT EXISTS subtitulo_hero TEXT DEFAULT 'Diagnósticos precisos e intervenções eficazes em clima e cultura organizacional',
ADD COLUMN IF NOT EXISTS imagem_hero_url TEXT,
ADD COLUMN IF NOT EXISTS cta_hero_texto TEXT DEFAULT 'Fazer Diagnóstico Gratuito',
ADD COLUMN IF NOT EXISTS cta_hero_link TEXT DEFAULT '/diagnostico';