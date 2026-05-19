-- Adicionar política PERMISSIVA que permite admins verem todos os perfis
-- Isso resolve o problema do PsychologistSelector não conseguir listar psicólogos para impersonificação
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));