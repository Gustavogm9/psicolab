-- Fase 1: Corrigir índice de avaliacoes
-- Remover constraint UNIQUE global de slug
ALTER TABLE avaliacoes DROP CONSTRAINT IF EXISTS avaliacoes_slug_key;

-- Criar índice UNIQUE composto (slug + consultora_id)
-- Permite que diferentes psicólogos tenham o mesmo slug
CREATE UNIQUE INDEX idx_avaliacoes_slug_consultora 
ON avaliacoes (slug, consultora_id) 
WHERE slug IS NOT NULL;

-- Fase 2: Corrigir índice de questionarios_diagnostico
-- Remover constraint UNIQUE global de slug
ALTER TABLE questionarios_diagnostico DROP CONSTRAINT IF EXISTS questionarios_diagnostico_slug_key;

-- Criar índice UNIQUE composto (slug + consultora_id)
CREATE UNIQUE INDEX idx_questionarios_slug_consultora 
ON questionarios_diagnostico (slug, consultora_id) 
WHERE slug IS NOT NULL;

-- Atualizar função de geração de slug para avaliacoes
-- Verificar duplicatas apenas dentro do contexto do psicólogo
CREATE OR REPLACE FUNCTION public.generate_avaliacao_slug(titulo text, p_consultora_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(trim(regexp_replace(titulo, '[^a-zA-Z0-9\s-]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := substring(base_slug, 1, 50);
  
  final_slug := base_slug;
  
  -- Se consultora_id foi passado, verificar apenas dentro do contexto dela
  IF p_consultora_id IS NOT NULL THEN
    WHILE EXISTS (
      SELECT 1 FROM public.avaliacoes 
      WHERE slug = final_slug 
      AND consultora_id = p_consultora_id
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
  ELSE
    -- Fallback: verificar globalmente (usado em triggers sem contexto)
    WHILE EXISTS (SELECT 1 FROM public.avaliacoes WHERE slug = final_slug) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
  END IF;
  
  RETURN final_slug;
END;
$function$;

-- Atualizar trigger para passar consultora_id para a função
CREATE OR REPLACE FUNCTION public.auto_generate_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.tipo_acesso = 'publico' AND (NEW.slug IS NULL OR NEW.slug = '') THEN
    NEW.slug := generate_avaliacao_slug(NEW.nome, NEW.consultora_id);
  END IF;
  RETURN NEW;
END;
$function$;