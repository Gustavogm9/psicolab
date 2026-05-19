-- 1. Adicionar tipo ENUM para tipo de acesso (se não existir)
DO $$ BEGIN
  CREATE TYPE tipo_acesso_avaliacao AS ENUM ('publico', 'restrito');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Adicionar campos na tabela avaliacoes (se não existirem)
DO $$ BEGIN
  ALTER TABLE avaliacoes ADD COLUMN slug text;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE avaliacoes ADD COLUMN tipo_acesso tipo_acesso_avaliacao DEFAULT 'restrito';
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- 3. Adicionar constraint UNIQUE ao slug (se não existir)
DO $$ BEGIN
  ALTER TABLE avaliacoes ADD CONSTRAINT avaliacoes_slug_key UNIQUE (slug);
EXCEPTION
  WHEN duplicate_table THEN null;
END $$;

-- 4. Criar índice para slug (se não existir)
CREATE INDEX IF NOT EXISTS idx_avaliacoes_slug ON avaliacoes(slug);

-- 5. Adicionar token de acesso aos participantes (se não existir)
DO $$ BEGIN
  ALTER TABLE avaliacoes_participantes ADD COLUMN token_acesso uuid DEFAULT gen_random_uuid();
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- 6. Adicionar constraint UNIQUE ao token_acesso (se não existir)
DO $$ BEGIN
  ALTER TABLE avaliacoes_participantes ADD CONSTRAINT avaliacoes_participantes_token_acesso_key UNIQUE (token_acesso);
EXCEPTION
  WHEN duplicate_table THEN null;
END $$;

-- 7. Criar tabela para respostas públicas (se não existir)
CREATE TABLE IF NOT EXISTS avaliacoes_respostas_publicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id uuid NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
  nome text,
  email text,
  respostas jsonb NOT NULL DEFAULT '[]'::jsonb,
  respondido boolean DEFAULT true,
  data_resposta timestamp with time zone DEFAULT now(),
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- 8. Habilitar RLS na nova tabela
ALTER TABLE avaliacoes_respostas_publicas ENABLE ROW LEVEL SECURITY;

-- 9. Remover políticas existentes se houver
DROP POLICY IF EXISTS "Consultoras podem ver respostas publicas de suas avaliacoes" ON avaliacoes_respostas_publicas;
DROP POLICY IF EXISTS "Qualquer um pode inserir respostas publicas" ON avaliacoes_respostas_publicas;
DROP POLICY IF EXISTS "Avaliacoes publicas podem ser vistas por todos" ON avaliacoes;
DROP POLICY IF EXISTS "Questoes de avaliacoes publicas podem ser vistas" ON avaliacoes_questoes;

-- 10. Políticas RLS para respostas públicas
CREATE POLICY "Consultoras podem ver respostas publicas de suas avaliacoes"
ON avaliacoes_respostas_publicas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM avaliacoes
    WHERE avaliacoes.id = avaliacoes_respostas_publicas.avaliacao_id
    AND avaliacoes.consultora_id = auth.uid()
  )
);

CREATE POLICY "Qualquer um pode inserir respostas publicas"
ON avaliacoes_respostas_publicas
FOR INSERT
WITH CHECK (true);

-- 11. Atualizar política RLS para permitir acesso público às avaliações públicas
CREATE POLICY "Avaliacoes publicas podem ser vistas por todos"
ON avaliacoes
FOR SELECT
USING (tipo_acesso = 'publico' AND status = 'ativa');

-- 12. Permitir acesso público às questões de avaliações públicas
CREATE POLICY "Questoes de avaliacoes publicas podem ser vistas"
ON avaliacoes_questoes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM avaliacoes
    WHERE avaliacoes.id = avaliacoes_questoes.avaliacao_id
    AND avaliacoes.tipo_acesso = 'publico'
    AND avaliacoes.status = 'ativa'
  )
);

-- 13. Função para gerar slug único
CREATE OR REPLACE FUNCTION generate_avaliacao_slug(titulo text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  WHILE EXISTS (SELECT 1 FROM avaliacoes WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- 14. Trigger para gerar slug automaticamente quando tipo_acesso = 'publico'
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tipo_acesso = 'publico' AND (NEW.slug IS NULL OR NEW.slug = '') THEN
    NEW.slug := generate_avaliacao_slug(NEW.nome);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON avaliacoes;

CREATE TRIGGER trigger_auto_generate_slug
BEFORE INSERT OR UPDATE ON avaliacoes
FOR EACH ROW
EXECUTE FUNCTION auto_generate_slug();