-- Fase 1: Corrigir RLS Policy para avaliacoes_respostas_publicas
-- Remove a política genérica que causa problemas em mobile
DROP POLICY IF EXISTS "Qualquer um pode inserir respostas publicas" ON avaliacoes_respostas_publicas;

-- Cria política robusta que valida avaliação ativa e pública
-- Não depende de contexto de autenticação (funciona em mobile e desktop)
CREATE POLICY "Permitir inserts publicos em avaliacoes ativas"
ON avaliacoes_respostas_publicas
FOR INSERT
WITH CHECK (
  -- Validar que a avaliação existe, está ativa e é pública
  EXISTS (
    SELECT 1 FROM avaliacoes
    WHERE avaliacoes.id = avaliacoes_respostas_publicas.avaliacao_id
    AND avaliacoes.status = 'ativa'
    AND avaliacoes.tipo_acesso = 'publico'
  )
);

-- Adicionar índices para melhorar performance da validação RLS
CREATE INDEX IF NOT EXISTS idx_avaliacoes_status_tipo_acesso 
ON avaliacoes(id, status, tipo_acesso);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_respostas_publicas_avaliacao 
ON avaliacoes_respostas_publicas(avaliacao_id);

-- Comentário explicativo
COMMENT ON POLICY "Permitir inserts publicos em avaliacoes ativas" 
ON avaliacoes_respostas_publicas IS 
'Permite inserção de respostas públicas apenas em avaliações ativas e públicas. Não requer autenticação, funcionando em mobile e desktop.';