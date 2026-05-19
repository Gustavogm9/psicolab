-- Atualizar função para aceitar avaliações restritas com auto-identificação
CREATE OR REPLACE FUNCTION public.avaliacao_permite_resposta_publica(p_avaliacao_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM avaliacoes
    WHERE id = p_avaliacao_id
    AND status = 'ativa'
    AND (
      tipo_acesso = 'publico'
      OR (tipo_acesso = 'restrito' AND permite_auto_identificacao = true)
    )
  )
$function$;

-- Adicionar policy SELECT pública para verificar participantes em avaliações com auto-identificação
CREATE POLICY "Permitir verificar participante para auto-identificacao" 
ON avaliacoes_participantes 
FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM avaliacoes 
    WHERE id = avaliacao_id 
    AND status = 'ativa' 
    AND permite_auto_identificacao = true
  )
);