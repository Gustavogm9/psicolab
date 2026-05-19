-- Remove constraint obsoleta que impedia uso de categorias customizadas
ALTER TABLE public.questionarios_diagnostico 
  DROP CONSTRAINT IF EXISTS questionarios_diagnostico_categoria_check;

-- Adicionar comentário explicativo na coluna
COMMENT ON COLUMN public.questionarios_diagnostico.categoria IS 
  'Nome da categoria (pode ser categoria customizada da tabela categorias_customizadas)';