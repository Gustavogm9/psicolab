-- Adicionar campos de empresa na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS empresa_setor TEXT,
ADD COLUMN IF NOT EXISTS empresa_tamanho TEXT,
ADD COLUMN IF NOT EXISTS empresa_endereco TEXT;

COMMENT ON COLUMN public.profiles.empresa_setor IS 'Setor/ramo de atuação da empresa';
COMMENT ON COLUMN public.profiles.empresa_tamanho IS 'Tamanho da empresa (número de funcionários)';
COMMENT ON COLUMN public.profiles.empresa_endereco IS 'Endereço completo da empresa';