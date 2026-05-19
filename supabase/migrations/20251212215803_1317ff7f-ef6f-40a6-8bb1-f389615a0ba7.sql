-- Corrigir RLS de avaliacoes_questoes para incluir avaliações restritas com auto-identificação
DROP POLICY IF EXISTS "Questoes de avaliacoes publicas podem ser vistas" ON avaliacoes_questoes;

CREATE POLICY "Questoes de avaliacoes publicas podem ser vistas" 
ON avaliacoes_questoes 
FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM avaliacoes
    WHERE avaliacoes.id = avaliacoes_questoes.avaliacao_id
      AND avaliacoes.status = 'ativa'
      AND (
        avaliacoes.tipo_acesso = 'publico' 
        OR (avaliacoes.tipo_acesso = 'restrito' AND avaliacoes.permite_auto_identificacao = true)
      )
  )
);