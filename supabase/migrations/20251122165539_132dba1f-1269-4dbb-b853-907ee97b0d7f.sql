-- Atualizar função para remover outras roles quando atribuir admin
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se o email é do admin designado, atribuir role admin automaticamente
  IF NEW.email = 'gustavo.macedo@guilds.com.br' THEN
    -- Remover outras roles se existirem
    DELETE FROM public.user_roles 
    WHERE user_id = NEW.id AND role != 'admin'::app_role;
    
    -- Inserir role admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Role admin atribuído automaticamente ao usuário %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Limpar role consultora do usuário admin existente
DELETE FROM public.user_roles
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'gustavo.macedo@guilds.com.br'
) AND role = 'consultora'::app_role;