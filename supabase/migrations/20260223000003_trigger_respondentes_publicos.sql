-- Migration: atualiza participantes_responderam em avaliacoes
-- sempre que uma resposta pública é inserida ou deletada
-- em avaliacoes_respostas_publicas.
--
-- Isso resolve o bug onde o contador permanecia 0/0 na listagem
-- mesmo após o usuário responder uma avaliação COPSOQ pública.

CREATE OR REPLACE FUNCTION public.sync_respondentes_publicos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avaliacao_id uuid;
  v_total integer;
BEGIN
  -- Determinar o avaliacao_id afetado (INSERT usa NEW, DELETE usa OLD)
  IF TG_OP = 'DELETE' THEN
    v_avaliacao_id := OLD.avaliacao_id;
  ELSE
    v_avaliacao_id := NEW.avaliacao_id;
  END IF;

  -- Contar total de respostas públicas para essa avaliação
  SELECT COUNT(*)
  INTO v_total
  FROM public.avaliacoes_respostas_publicas
  WHERE avaliacao_id = v_avaliacao_id;

  -- Atualizar o campo na tabela avaliacoes
  UPDATE public.avaliacoes
  SET participantes_responderam = v_total
  WHERE id = v_avaliacao_id;

  RETURN NULL; -- trigger AFTER não precisa retornar linha
END;
$$;

-- Remove trigger anterior se existir (idempotente)
DROP TRIGGER IF EXISTS trg_sync_respondentes_publicos
  ON public.avaliacoes_respostas_publicas;

-- Cria trigger AFTER INSERT OR DELETE
CREATE TRIGGER trg_sync_respondentes_publicos
  AFTER INSERT OR DELETE
  ON public.avaliacoes_respostas_publicas
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_respondentes_publicos();
