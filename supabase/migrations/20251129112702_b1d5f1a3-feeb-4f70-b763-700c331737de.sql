-- Políticas RLS completas para impersonificação de admin

-- 1. leads_interacoes: Admins podem ver todas as interações
CREATE POLICY "Admins podem ver todas as interacoes de leads"
ON public.leads_interacoes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. pagamentos: Admins podem ver todos os pagamentos
CREATE POLICY "Admins podem ver todos os pagamentos"
ON public.pagamentos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. team_invites: Admins podem ver todos os convites
CREATE POLICY "Admins podem ver todos os convites de equipe"
ON public.team_invites FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. team_members: Admins podem ver todos os membros
CREATE POLICY "Admins podem ver todos os membros de equipe"
ON public.team_members FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. profiles: Adicionar política UPDATE para admins
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. perfil_publico_analytics_consolidado: Corrigir política
DROP POLICY IF EXISTS "Admins podem visualizar analytics consolidado" ON public.perfil_publico_analytics_consolidado;

CREATE POLICY "Admins podem ver analytics consolidado"
ON public.perfil_publico_analytics_consolidado FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 7. perfil_publico_planos: Corrigir política
DROP POLICY IF EXISTS "Admins podem gerenciar planos" ON public.perfil_publico_planos;

CREATE POLICY "Admins podem gerenciar planos"
ON public.perfil_publico_planos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));