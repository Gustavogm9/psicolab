-- Adicionar política PERMISSIVA que permite admins verem todas as roles
-- Isso resolve o problema do PsychologistSelector não conseguir listar psicólogos
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));