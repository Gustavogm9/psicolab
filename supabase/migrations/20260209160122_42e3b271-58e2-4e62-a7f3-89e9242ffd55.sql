
-- Criar função RPC SECURITY DEFINER para inserir respostas públicas em diagnósticos
-- Isso contorna problemas de RLS para usuários anônimos
CREATE OR REPLACE FUNCTION public.inserir_resposta_publica(
  p_questionario_id uuid,
  p_nome text,
  p_email text,
  p_telefone text DEFAULT NULL,
  p_respostas jsonb DEFAULT '[]'::jsonb,
  p_score_total numeric DEFAULT 0,
  p_categoria text DEFAULT NULL,
  p_analise_completa jsonb DEFAULT NULL,
  p_status text DEFAULT 'incompleta',
  p_origem text DEFAULT 'link'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_resposta_id uuid;
  v_questionario_ativo boolean;
BEGIN
  -- Verificar se o questionário está ativo
  SELECT ativo INTO v_questionario_ativo
  FROM questionarios_diagnostico
  WHERE id = p_questionario_id;

  IF v_questionario_ativo IS NULL THEN
    RAISE EXCEPTION 'Questionário não encontrado' USING ERRCODE = 'P0002';
  END IF;

  IF NOT v_questionario_ativo THEN
    RAISE EXCEPTION 'Questionário não está ativo' USING ERRCODE = 'P0003';
  END IF;

  -- Inserir a resposta
  INSERT INTO respostas_diagnostico (
    questionario_id, nome, email, telefone, respostas,
    score_total, categoria, analise_completa, status, origem,
    data_inicio
  ) VALUES (
    p_questionario_id, p_nome, p_email, p_telefone, p_respostas,
    p_score_total, p_categoria, p_analise_completa, p_status, p_origem,
    now()
  )
  RETURNING id INTO v_resposta_id;

  RETURN json_build_object('id', v_resposta_id);
END;
$$;
