-- Fix: remove versões conflitantes/incorretas da função inserir_resposta_publica
-- Causa: overloading com parâmetro p_meta causava PGRST203
DROP FUNCTION IF EXISTS public.inserir_resposta_publica(uuid, text, text, text, jsonb, integer, text, jsonb, text, text);
DROP FUNCTION IF EXISTS public.inserir_resposta_publica(uuid, text, text, text, jsonb, integer, text, jsonb, text, text, jsonb);
DROP FUNCTION IF EXISTS public.inserir_resposta_publica(uuid, text, text, text, jsonb, numeric, text, jsonb, text, text);
DROP FUNCTION IF EXISTS public.inserir_resposta_publica(uuid, text, text, text, jsonb, numeric, text, jsonb, text, text, jsonb);

-- Recria com as colunas corretas da tabela respostas_diagnostico
CREATE OR REPLACE FUNCTION public.inserir_resposta_publica(
  p_questionario_id uuid,
  p_nome text,
  p_email text,
  p_telefone text DEFAULT NULL,
  p_respostas jsonb DEFAULT '[]',
  p_score_total numeric DEFAULT 0,
  p_categoria text DEFAULT NULL,
  p_analise_completa jsonb DEFAULT NULL,
  p_status text DEFAULT 'incompleta',
  p_origem text DEFAULT 'link'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM questionarios_diagnostico
    WHERE id = p_questionario_id AND ativo = true
  ) THEN
    RAISE EXCEPTION 'Questionário não encontrado ou inativo';
  END IF;

  INSERT INTO respostas_diagnostico (
    questionario_id,
    nome,
    email,
    telefone,
    respostas,
    score_total,
    categoria,
    analise_completa,
    status,
    origem,
    data_inicio
  ) VALUES (
    p_questionario_id,
    p_nome,
    p_email,
    p_telefone,
    p_respostas,
    p_score_total::integer,
    p_categoria,
    p_analise_completa,
    p_status,
    p_origem,
    NOW()
  )
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('id', v_id, 'success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.inserir_resposta_publica TO anon;
GRANT EXECUTE ON FUNCTION public.inserir_resposta_publica TO authenticated;
