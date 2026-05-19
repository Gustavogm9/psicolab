-- Remover política antiga
DROP POLICY IF EXISTS "Avaliacoes publicas podem ser vistas por todos" ON avaliacoes;

-- Criar política atualizada que inclui avaliações restritas com auto-identificação
CREATE POLICY "Avaliacoes publicas podem ser vistas por todos" 
ON avaliacoes 
FOR SELECT 
TO public 
USING (
  status = 'ativa' 
  AND (
    tipo_acesso = 'publico' 
    OR (tipo_acesso = 'restrito' AND permite_auto_identificacao = true)
  )
);