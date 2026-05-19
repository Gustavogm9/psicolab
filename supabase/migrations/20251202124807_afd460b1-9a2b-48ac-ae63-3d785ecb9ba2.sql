-- Adicionar coluna created_at na tabela avaliacoes_participantes
ALTER TABLE public.avaliacoes_participantes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Preencher registros existentes usando data_convite como fallback
UPDATE public.avaliacoes_participantes 
SET created_at = COALESCE(data_convite, now()) 
WHERE created_at IS NULL;

-- Tornar NOT NULL após preencher todos os registros
ALTER TABLE public.avaliacoes_participantes 
ALTER COLUMN created_at SET NOT NULL;