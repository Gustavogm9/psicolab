-- Adicionar política RLS alternativa para admins visualizarem domínios
-- Esta política verifica tanto user_roles quanto user_metadata para maior compatibilidade
CREATE POLICY "Admins podem ver todos os domínios (alternativa)"
ON dominios_customizados
FOR SELECT
TO authenticated
USING (
  -- Verificar se é admin através da função has_role
  public.has_role(auth.uid(), 'admin'::app_role)
);