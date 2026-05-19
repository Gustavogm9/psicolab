-- =====================================================
-- 1. Criar função SECURITY DEFINER para verificar
--    se um questionário permite resposta pública
-- =====================================================
CREATE OR REPLACE FUNCTION public.questionario_permite_resposta_publica(p_questionario_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM questionarios_diagnostico
    WHERE id = p_questionario_id
    AND ativo = true
  )
$$;

-- =====================================================
-- 2. Remover a política de INSERT existente
-- =====================================================
DROP POLICY IF EXISTS "Permitir inserts em questionarios ativos" ON respostas_diagnostico;

-- =====================================================
-- 3. Criar nova política usando a função SECURITY DEFINER
--    A função executa com privilégios elevados, evitando
--    problemas de contexto de segurança em subqueries
-- =====================================================
CREATE POLICY "Permitir inserts em questionarios ativos" 
ON respostas_diagnostico 
FOR INSERT 
TO public
WITH CHECK (public.questionario_permite_resposta_publica(questionario_id));