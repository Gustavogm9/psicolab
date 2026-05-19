-- ============================================
-- FASE 1: Corrigir RLS Policy para respostas_diagnostico
-- Resolver problema de submissão mobile
-- ============================================

-- 1.1 Remover política genérica antiga
DROP POLICY IF EXISTS "Qualquer um pode inserir respostas" ON respostas_diagnostico;

-- 1.2 Criar nova política robusta que valida questionário ativo
CREATE POLICY "Permitir inserts em questionarios ativos"
ON respostas_diagnostico
FOR INSERT
WITH CHECK (
  -- Validar que o questionário existe e está ativo
  -- Não depende de contexto de autenticação (funciona sem sessão)
  EXISTS (
    SELECT 1 FROM questionarios_diagnostico
    WHERE questionarios_diagnostico.id = respostas_diagnostico.questionario_id
    AND questionarios_diagnostico.ativo = true
  )
);

-- 1.3 Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_questionarios_diagnostico_ativo 
ON questionarios_diagnostico(id, ativo);

CREATE INDEX IF NOT EXISTS idx_respostas_diagnostico_questionario 
ON respostas_diagnostico(questionario_id);

-- Comentário explicativo
COMMENT ON POLICY "Permitir inserts em questionarios ativos" ON respostas_diagnostico IS 
'Permite inserção de respostas apenas em questionários ativos. Funciona em desktop e mobile (iOS/Android) sem depender de contexto de autenticação.';