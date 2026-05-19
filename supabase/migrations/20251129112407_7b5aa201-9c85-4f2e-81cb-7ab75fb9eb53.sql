-- Políticas RLS para admins gerenciarem configuracoes_whitelabel

-- SELECT: Admins podem ver todas as configurações
CREATE POLICY "Admins podem ver todas configuracoes_whitelabel"
ON public.configuracoes_whitelabel FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- INSERT: Admins podem criar configurações para qualquer usuário
CREATE POLICY "Admins podem criar configuracoes_whitelabel"
ON public.configuracoes_whitelabel FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- UPDATE: Admins podem atualizar qualquer configuração
CREATE POLICY "Admins podem atualizar configuracoes_whitelabel"
ON public.configuracoes_whitelabel FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- DELETE: Admins podem deletar qualquer configuração
CREATE POLICY "Admins podem deletar configuracoes_whitelabel"
ON public.configuracoes_whitelabel FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));